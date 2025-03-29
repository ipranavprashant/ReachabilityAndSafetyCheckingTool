from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import subprocess
import os
import itertools
import time
import threading
import queue

app = Flask(__name__)
CORS(app)

processing_updates = {}
processing_results = {}

@app.route('/process', methods=['OPTIONS'])
def process_options():
    return jsonify({}), 200

def add_update(request_id, update_type, content):
    if request_id not in processing_updates:
        processing_updates[request_id] = []
    
    processing_updates[request_id].append({
        "type": update_type,
        "content": content,
        "timestamp": time.time()
    })

def readInput(agent_and_environment_information, request_id):
    add_update(request_id, "info", "Reading input data...")
    lines = [line.strip() for line in agent_and_environment_information.splitlines() if line.strip() and not line.startswith("#")]
    
    agentStates = {}
    for stateInfo in lines[0].split(","):
        state, value = stateInfo.split(":")
        agentStates[state.strip()] = int(value.strip())
    
    add_update(request_id, "info", f"Agent States: {agentStates}")
    
    agentActions = [action.strip() for action in lines[1].split(",")]
    add_update(request_id, "info", f"Agent Actions: {agentActions}")
    
    agentProtocols = {}
    idx = 2
    while ":" in lines[idx]:
        state, actions = lines[idx].split(":")
        agentProtocols[state.strip()] = [action.strip() for action in actions.split(",")]
        idx += 1
    
    add_update(request_id, "info", f"Agent Protocols: {agentProtocols}")
    
    agentTransitions = {}
    while "," in lines[idx]:
        parts = lines[idx].split(",")
        actions = [action.strip() for action in parts[3].split()]
        actions.sort()
        keyVal = parts[1].strip() + ',' + parts[2].strip() + ',' + " ".join(actions)
        if keyVal in agentTransitions:
            agentTransitions[keyVal].append([parts[0].strip(), parts[4].strip()])
        else:
            agentTransitions[keyVal] = [[parts[0].strip(), parts[4].strip()]]
        idx += 1
    
    add_update(request_id, "info", f"Agent Transitions detected: {len(agentTransitions)}")
    
    agentInitialState = lines[idx].strip()
    idx += 1
    agentLeaveState = lines[idx].strip()
    idx += 1
    
    add_update(request_id, "info", f"Agent Initial State: {agentInitialState}")
    add_update(request_id, "info", f"Agent Leave State: {agentLeaveState}")
    
    environmentStates = [state.strip() for state in lines[idx].split(",")]
    idx += 1
    environmentActions = [action.strip() for action in lines[idx].split(",")]
    idx += 1
    
    add_update(request_id, "info", f"Environment States: {environmentStates}")
    add_update(request_id, "info", f"Environment Actions: {environmentActions}")
    
    environmentProtocols = {}
    while ":" in lines[idx]:
        state, actions = lines[idx].split(":")
        environmentProtocols[state.strip()] = [action.strip() for action in actions.split(",")]
        idx += 1
    
    add_update(request_id, "info", f"Environment Protocols: {environmentProtocols}")
    
    environmentInitialState = lines[idx].strip()
    idx += 1
    
    add_update(request_id, "info", f"Environment Initial State: {environmentInitialState}")
    
    environmentTransitions = []
    while idx < len(lines):
        environmentTransitions.append([value.strip() for value in lines[idx].split(",")])
        idx += 1
    
    add_update(request_id, "info", f"Environment Transitions detected: {len(environmentTransitions)}")
    
    return (agentStates, agentActions, agentProtocols, agentTransitions, 
            agentInitialState, agentLeaveState, environmentStates, environmentActions, 
            environmentProtocols, environmentInitialState, environmentTransitions)

def findValidCombinations(flattenedCombination, environmentAction, agentTransitions, request_id):
    add_update(request_id, "info", f"Finding valid combinations for: {flattenedCombination}")
    actionStates = []
    for action in flattenedCombination:
        withoutAct = ""
        i = 0
        while i < len(flattenedCombination):
            a = flattenedCombination[i]
            if a == action:
                if i + 1 < len(flattenedCombination) and flattenedCombination[i] == flattenedCombination[i + 1]:
                    withoutAct += a + " "
            else:
                withoutAct += a + " "
            i += 2 if i + 1 < len(flattenedCombination) and flattenedCombination[i] == flattenedCombination[i + 1] else 1
        withoutAct = withoutAct.strip()
        transitionKey = action + ',' + environmentAction + ',' + withoutAct
        if transitionKey in agentTransitions:
            actionStates.append(agentTransitions[transitionKey])
        else:
            actionStates = []
            add_update(request_id, "warning", f"Failed local TransitionKey: {transitionKey}")
            break
    return actionStates

def generateGlobalTransitions(agentTransitions, environmentTransitions, request_id):
    add_update(request_id, "info", "Generating global transitions...")
    globalTransitions = []
    for i, environmentTransition in enumerate(environmentTransitions):
        add_update(request_id, "info", f"Processing environment transition {i+1}/{len(environmentTransitions)}")
        environmentBeforeState = environmentTransition[0]
        environmentAction = environmentTransition[1]
        agentsAction = [a.strip() for a in environmentTransition[2].split()]
        environmentFinalState = environmentTransition[3]

        add_update(request_id, "info", f"Environment transition: {environmentBeforeState} --{environmentAction}--> {environmentFinalState}")

        agentsAction.sort()
        actionCombination = []
        for action in agentsAction:
            actionCombination.append([[action], [action, action]])

        for combination in itertools.product(*actionCombination):
            flattenedCombination = [item for sublist in combination for item in sublist]
            add_update(request_id, "info", f"Testing combination: {flattenedCombination}")
            actionStates = findValidCombinations(flattenedCombination, environmentAction, agentTransitions, request_id)
            if actionStates:
                for gTransition in itertools.product(*actionStates):
                    agentBeforeStates = []
                    agentTakenActions = []
                    agentFinalStates = []
                    i = 0
                    for localTransition in gTransition:
                        agentBeforeStates.append(localTransition[0])
                        agentTakenActions.append(flattenedCombination[i])
                        i += 1
                        agentFinalStates.append(localTransition[1])
                    globalTransition = [agentBeforeStates, agentTakenActions, environmentBeforeState, 
                                        environmentAction, agentsAction, agentFinalStates, environmentFinalState]
                    globalTransitions.append(globalTransition)
                    add_update(request_id, "success", f"Valid global transition: {agentBeforeStates} --{agentTakenActions}--> {agentFinalStates}")
    
    add_update(request_id, "info", f"Total global transitions generated: {len(globalTransitions)}")
    return globalTransitions

def initializeGalVariables(agentStates, environmentStates, environmentInitialState, request_id):
    add_update(request_id, "info", "Initializing GAL variables...")
    galVariables = {state: 0 for state in agentStates}
    for state in environmentStates:
        galVariables[state] = 0
    galVariables[environmentInitialState] = 1
    galVariables["count"] = 0
    add_update(request_id, "info", f"GAL variables initialized: {galVariables}")
    return galVariables

def globalToGalTransitions(globalTransitions, agentStates, agentInitialState, agentLeaveState, request_id):
    add_update(request_id, "info", "Converting global transitions to GAL transitions...")
    galTransitions = {}
    galTransitions["initialTrans"] = ("count < 50", f"{agentInitialState} += 1; count += 1;")
    galTransitions["leaveTrans"] = (f"{agentLeaveState} > 0", f"{agentLeaveState} -= 1; count -= 1;")

    i = 1
    unsafeMarkings = []
    for globalTransition in globalTransitions:
        initialStateWeight = {globalTransition[2]: 1}
        for state in globalTransition[0]:
            initialStateWeight[state] = initialStateWeight.get(state, 0) + 1

        flag = 0
        finalStateWeight = {globalTransition[6]: 1}
        for state in globalTransition[5]:
            finalStateWeight[state] = finalStateWeight.get(state, 0) + 1
            if not flag and agentStates[state] == 0:
                flag = 1
        if flag:
            unsafeMarkings.append(initialStateWeight)
            add_update(request_id, "warning", f"Found unsafe marking: {initialStateWeight}")

        transitionConditions = [f"{state} >= {weight}" for state, weight in initialStateWeight.items()]
        galTransitionCondition = " && ".join(transitionConditions)

        actions1 = [f"{state} -= {weight};" for state, weight in initialStateWeight.items()]
        actions2 = [f"{state} += {weight};" for state, weight in finalStateWeight.items()]
        galActions = " ".join(actions1 + actions2)

        galTransitions[f"t{i}"] = (galTransitionCondition, galActions)
        add_update(request_id, "info", f"GAL transition t{i}: [{galTransitionCondition}] {galActions}")
        i += 1

    add_update(request_id, "info", f"Total GAL transitions: {i-1}")
    add_update(request_id, "info", f"Total unsafe markings: {len(unsafeMarkings)}")
    return galTransitions, unsafeMarkings

def generateGalCode(function_name, variables, transitions, request_id):
    add_update(request_id, "info", f"Generating GAL code for {function_name}...")
    gal_code = f"gal {function_name} {{\n"
    for var, value in variables.items():
        gal_code += f"    int {var} = {value};\n"
    for transition_name, (condition, actions) in transitions.items():
        gal_code += f"\n    transition {transition_name} [{condition}] {{\n"
        gal_code += f"        {actions}\n"
        gal_code += "    }\n"
    gal_code += "}\n"
    file_name = f"{function_name}.gal"
    with open(file_name, 'w') as file:
        file.write(gal_code)
    add_update(request_id, "success", f"GAL code written to {file_name}")
    return file_name

def check_system_safety(unsafeMarkings, request_id):
    add_update(request_id, "info", "==== CHECKING SYSTEM SAFETY ====")
    all_states = []
    with open("testing.gal", "r") as f:
        for line in f:
            if line.strip().startswith("int "):
                state_name = line.strip().split()[1].split("=")[0].strip()
                if state_name != "count":
                    all_states.append(state_name)
    add_update(request_id, "info", f"States in GAL file: {all_states}")

    state_mapping = {}
    for marking in unsafeMarkings:
        for state in marking.keys():
            if state not in state_mapping:
                if state in all_states:
                    state_mapping[state] = state
                elif state.startswith("le") and "le" in all_states:
                    state_mapping[state] = "le"
                elif state[0] == 'l' and state[1:] in ["0", "1", "2", "3"] and state in all_states:
                    state_mapping[state] = state
                else:
                    add_update(request_id, "warning", f"Could not map state {state} to any GAL state")
    add_update(request_id, "info", f"State mapping: {state_mapping}")

    system_unsafe = False
    for i, marking in enumerate(unsafeMarkings):
        state_values = {state: 0 for state in all_states}
        for state, count in marking.items():
            if state in state_mapping:
                gal_state = state_mapping[state]
                state_values[gal_state] = count

        formula_parts = [f"{state}=={value}" for state, value in state_values.items()]
        formula = " && ".join(formula_parts)
        add_update(request_id, "info", f"Checking marking {i+1}/{len(unsafeMarkings)}: {marking}")
        add_update(request_id, "info", f"Mapped to GAL states: {state_values}")
        add_update(request_id, "info", f"Formula: \"{formula}\"")

        try:
            cmd = ["./its-reach", "-i", "testing.gal", "-t", "GAL", "-reachable", formula]
            add_update(request_id, "info", f"Executing: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            output = result.stdout
            
            for line in output.split('\n'):
                if any(term in line for term in ["property", "true", "false", "reachable states"]):
                    add_update(request_id, "info", line)
            
            if "is true" in output:
                add_update(request_id, "warning", f"🚨 Unsafe Marking {i+1} is REACHABLE!")
                system_unsafe = True
            else:
                add_update(request_id, "success", f"✅ Unsafe Marking {i+1} is UNREACHABLE.")
        except Exception as e:
            add_update(request_id, "error", f"Error executing command: {e}")

    add_update(request_id, "info", "==== SAFETY ANALYSIS COMPLETE ====")
    if system_unsafe:
        add_update(request_id, "error", "❌ SYSTEM IS UNSAFE: At least one unsafe marking is reachable.")
    else:
        add_update(request_id, "success", "✅ SYSTEM IS SAFE: No unsafe markings are reachable.")
    return system_unsafe

def process_input(input_text, request_id):
    try:
        add_update(request_id, "info", "Starting input processing...")
        
        result = readInput(input_text, request_id)
        agentStates, agentActions, agentProtocols, agentTransitions, agentInitialState, agentLeaveState, environmentStates, environmentActions, environmentProtocols, environmentInitialState, environmentTransitions = result
        
        galVariables = initializeGalVariables(agentStates, environmentStates, environmentInitialState, request_id)
        
        globalTransitions = generateGlobalTransitions(agentTransitions, environmentTransitions, request_id)
        
        galTransitions, unsafeMarkings = globalToGalTransitions(globalTransitions, agentStates, agentInitialState, agentLeaveState, request_id)
        
        generateGalCode("testing", galVariables, galTransitions, request_id)
        
        is_unsafe = check_system_safety(unsafeMarkings, request_id)
        
        processing_results[request_id] = {
            "completed": True,
            "unsafe": is_unsafe,
            "unsafeMarkings": unsafeMarkings,
            "agentStates": agentStates,
            "agentActions": agentActions,
            "agentProtocols": agentProtocols,
            "environmentStates": environmentStates,
            "environmentActions": environmentActions,
            "environmentProtocols": environmentProtocols,
            "globalTransitions": len(globalTransitions)
        }
        
        add_update(request_id, "success", "Processing completed successfully!")
        
    except Exception as e:
        add_update(request_id, "error", f"Error during processing: {str(e)}")
        processing_results[request_id] = {
            "completed": False,
            "error": str(e)
        }

@app.route('/process', methods=['POST'])
@cross_origin()
def process_file():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON received"}), 400
        input_text = data.get("input_text", "")
        
        request_id = str(time.time())
        
        processing_updates[request_id] = []
        processing_results[request_id] = {"completed": False}
        
        thread = threading.Thread(target=process_input, args=(input_text, request_id))
        thread.start()
        
        return jsonify({"message": "Processing started", "request_id": request_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/updates/<request_id>', methods=['GET'])
@cross_origin()
def get_updates(request_id):
    if request_id not in processing_updates:
        return jsonify({"error": "Invalid request ID"}), 404
    
    updates = processing_updates[request_id]
    result = processing_results.get(request_id, {"completed": False})
    
    return jsonify({
        "updates": updates,
        "completed": result.get("completed", False),
        "result": result
    })

@app.route('/status/<request_id>', methods=['GET'])
@cross_origin()
def get_status(request_id):
    if request_id not in processing_results:
        return jsonify({"error": "Invalid request ID"}), 404
    
    return jsonify({
        "completed": processing_results[request_id].get("completed", False)
    })

@app.route('/complete/<request_id>', methods=['POST'])
@cross_origin()
def complete_processing(request_id):
    if request_id not in processing_results:
        return jsonify({"error": "Invalid request ID"}), 404
    
    processing_results[request_id]["completed"] = True
    add_update(request_id, "success", "Processing marked as completed manually!")
    
    return jsonify({"message": "Processing marked as completed"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7050, debug=True)
