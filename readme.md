# Reachability and Safety Checking Tool

## Overview
This project is a **Reachability and Safety Checking Tool** built using **React (Frontend)** and **Flask (Backend)**. It allows users to generate **GAL code**, simulate **Petri net transitions**, and verify **system reachability and safety** through a structured pipeline.

## Project Structure
```
/
|-- ReachabilityAndSafetyCheckingToolFrontend/           # React-based frontend
|-- ReachabilityAndSafetyCheckingToolBackend/            # Flask-based backend
|-- README.md          # Project overview
|-- ReachabilityAndSafetyCheckingToolFrontend/README.md  # Frontend-specific setup and details
|-- ReachabilityAndSafetyCheckingToolBackend/README.md   # Backend-specific setup and details
```

## Getting Started

### Prerequisites
- **Docker** (For containerized deployment) OR
- **Node.js (18+)** (For frontend)
- **Python 3.9+** (For backend)

### Running the Application

#### Running Manually
1. **Start the Backend**
   ```sh
   cd ReachabilityAndSafetyCheckingToolBackend
   pip install -r requirements.txt
   python its_tool_be.py
   ```
2. **Start the Frontend**
   ```sh
   cd ReachabilityAndSafetyCheckingToolFrontend
   npm install
   npm run dev
   ```

### Deployment
The application is deployed using **Render**.
- Backend: [Deployed on Render](https://reachabilityandsafetycheckingtoolbackend.onrender.com/)
- Frontend: [Deployed on Netlify](https://safetychecking.netlify.app/)

For detailed frontend and backend setup, refer to the respective README files:
- [Frontend README](ReachabilityAndSafetyCheckingToolFrontend/README.md)
- [Backend README](ReachabilityAndSafetyCheckingToolBackend/README.md)

