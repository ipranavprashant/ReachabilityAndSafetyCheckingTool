# Backend - Reachability and Safety Checking Tool

## Overview
This is the **Flask-based backend** for the **Reachability and Safety Checking Tool**. It handles input parsing, **GAL code generation**, **Petri net simulation**, and **reachability verification**.

## Features
- Parses **multi-agent system descriptions**
- Generates **GAL code** dynamically
- Simulates **Petri net transitions**
- Verifies **reachability & safety properties**
- Provides **REST API** for frontend integration
- **Dockerized for deployment**

## Tech Stack
- **Python 3.9** (Backend framework)
- **Flask** (Web server)
- **Docker** (Containerization)
- **Render** (Deployment)
- **ITS-Tool** (Reachability verification)

## Getting Started

### Prerequisites
- **Python 3.9+**
- **pip** (Python package manager)
- **ITS-Tool** (For reachability analysis)

### Installation & Running Locally
1. Clone the repository
   ```sh
   git clone https://github.com/ipranavprashant/ReachabilityAndSafetyCheckingTool.git
   cd ReachabilityAndSafetyCheckingToolBackend
   ```
2. Install dependencies
   ```sh
   pip install -r requirements.txt
   ```
3. Ensure **ITS-Tool** is installed
   ```sh
   chmod +x its-reach
   ```
4. Start the Flask server
   ```sh
   python its_tool_be.py
   ```
   The server will run at **http://localhost:7050**

### Running with Docker
1. Build the Docker image
   ```sh
   docker build -t reachability-backend .
   ```
2. Run the container
   ```sh
   docker run -p 7050:7050 reachability-backend
   ```

### API Endpoints
| Method | Endpoint            | Description                     |
|--------|---------------------|---------------------------------|
| POST   | `/generate_gal`      | Generate GAL code from input   |
| GET    | `/updates/<id>`      | Fetch reachability results     |
| POST   | `/check_reachability` | Verify system safety           |


## Additional Notes
- Ensure `its-reach` is executable before running
- Logs are stored in `logs/` for debugging

For frontend setup, see [Frontend README](../frontend/README.md).

