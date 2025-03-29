import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

import sample_input1 from "../assets/sample_input1.txt";
import sample_input2 from "../assets/sample_input2.txt";
import sample_input3 from "../assets/sample_input3.txt";
import sample_input4 from "../assets/sample_input4.txt";
import sample_input5 from "../assets/sample_input5.txt";
import tunnel_sample_input_safe from "../assets/tunnel_sample_input_safe.txt";
import tunnel_sample_input_unsafe from "../assets/tunnel_sample_input_unsafe.txt";

export default function InputFormatSpecifications() {
  const sample_inputFiles = {
    sample_input1: { name: "sample_input1.txt", file: sample_input1 },
    sample_input2: { name: "sample_input2.txt", file: sample_input2 },
    sample_input3: { name: "sample_input3.txt", file: sample_input3 },
    sample_input4: { name: "sample_input4.txt", file: sample_input4 },
    sample_input5: { name: "sample_input5.txt", file: sample_input5 },
    sample_input6: {
      name: "tunnel_sample_input_safe.txt",
      file: tunnel_sample_input_safe,
    },
    sample_input7: {
      name: "tunnel_sample_input_unsafe.txt",
      file: tunnel_sample_input_unsafe,
    },
  };
  const [selectedsample_input, setSelectedsample_input] =
    useState("sample_input1");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Input Format", path: "/input-format" },
    { name: "Research Paper", path: "/research-paper" },
    { name: "Test Cases", path: "/test-cases" },
    { name: "Contributors", path: "/contributors" },
  ];

  return (
    <>
      <nav
        className={`py-4 px-6 flex justify-center lg:justify-between items-center transition-colors duration-300 ${
          darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        <h1 className="text-2xl font-bold hidden lg:block">Research Paper</h1>
        <div className="flex items-center justify-center space-x-6">
          {menuItems.map((element, index) => (
            <Link
              key={index}
              to={element.path}
              className="text-lg font-medium transition-colors duration-300 hover:text-blue-500"
            >
              {element.name}
            </Link>
          ))}
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              toast(`Theme set to ${darkMode ? "Light Mode" : "Dark Mode"}`);
            }}
            className="p-2 rounded-full transition cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-gray-800" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`min-h-screen flex flex-col items-center py-6 px-4 transition-colors ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="mt-6 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">
            Understanding the Input Format and Semantics
          </h2>
          <p className="text-lg mb-4">
            The input file describes the structure of a{" "}
            <strong>Rutwiya System</strong> in two sections:{" "}
            <strong>Agent</strong> and <strong>Environment</strong>. Below is a
            line-by-line explanation of the file format, including the
            definition of unsafe transitions.
          </p>
          <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm mb-4">
            {`# agent information
  --> Marks the beginning of the agent configuration section.

outside: 1, approach: 1, tunnel: 1, collision: 0
  --> Defines agent states with capacities:
      * outside, approach, tunnel: capacity 1 (safe states)
      * collision: capacity 0 (unsafe state; unreachable)

a1, a2
  --> Lists the agent names.

outside: a1,a2
  --> Initial assignment: both agents start in the "outside" state.

# Agent Transitions:
# Safe transitions:
outside,a1,b,a1,approach
  --> Agent a1 transitions from "outside" to "approach" using action b.

approach,a1,b,a1,tunnel
  --> Agent a1 transitions from "approach" to "tunnel" using action b.

tunnel,a1,b,a1,tunnel
  --> Agent a1 has a self-loop in "tunnel" using action b.

outside,a2,b,a2,approach
  --> Agent a2 transitions from "outside" to "approach" using action b.

approach,a2,b,a2,tunnel
  --> Agent a2 transitions from "approach" to "tunnel" using action b.

tunnel,a2,b,a2,tunnel
  --> Agent a2 has a self-loop in "tunnel" using action b.

# Unsafe transitions (defined but unreachable because "collision" has capacity 0):
outside,a1,b,a1,collision
  --> Agent a1 could transition from "outside" to unsafe "collision" (unreachable).

approach,a1,b,a1,collision
  --> Agent a1 could transition from "approach" to unsafe "collision" (unreachable).

outside,a2,b,a2,collision
  --> Agent a2 could transition from "outside" to unsafe "collision" (unreachable).

approach,a2,b,a2,collision
  --> Agent a2 could transition from "approach" to unsafe "collision" (unreachable).

# Expected final safe states (each agent ends in tunnel):
tunnel
tunnel
  --> Indicates that the expected final state for each agent is "tunnel".

# environment information
  --> Marks the beginning of the environment configuration section.

green, yellow, red
  --> Defines the environment states (using a color scheme).

b
  --> Specifies the environment action (b).

green: b
yellow: b
red: b
  --> Sets the environment protocol: In each state, action b is allowed.

green
  --> Initial environment state is "green".

green,b,a1,green
  --> Environment transition: In "green", action b by agent a1 keeps it in "green".

green,b,a2,green
  --> Environment transition: In "green", action b by agent a2 keeps it in "green".`}
          </pre>
          <p className="text-lg">
            <strong>Summary:</strong> This file defines safe agent transitions
            (from outside to approach to tunnel) and includes unsafe transitions
            to &quot;collision&quot; for documentation. However, because
            &quot;collision&quot; has a capacity of 0, these unsafe transitions
            are unreachable.
          </p>
        </div>

        <div className="mt-6">
          <label className="text-lg font-bold mr-2">Choose a Test Case:</label>
          <select
            value={selectedsample_input}
            onChange={(e) => setSelectedsample_input(e.target.value)}
            className="p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white"
          >
            {Object.keys(sample_inputFiles).map((key) => (
              <option key={key} value={key}>
                {sample_inputFiles[key].name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <a
            href={sample_inputFiles[selectedsample_input].file}
            download={sample_inputFiles[selectedsample_input].name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Download className="w-5 h-5" /> Download{" "}
            {sample_inputFiles[selectedsample_input].name}
          </a>
        </div>
      </div>
      <footer
        className={`py-4 text-center ${
          darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-600"
        }`}
      >
        A Petri net based Reachability and Safety Checking Tool for Open
        Multi-Agent Systems
      </footer>
      <ToastContainer />
    </>
  );
}
