# Frontend - Reachability and Safety Checking Tool

## Overview
This is the **React-based frontend** for the **Reachability and Safety Checking Tool**. It provides an interactive UI for users to:
- Upload input files
- Generate **GAL code**
- Verify **reachability**
- Visualize **transition graphs**

## Tech Stack
- **React 18** (Frontend framework)
- **TailwindCSS** (Styling)
- **React Flow / Cytoscape** (Graph visualization)
- **Axios** (API requests)
- **Netlify** (Deployment)

## Getting Started

### Prerequisites
- **Node.js 18+**
- **npm** (or `yarn`)

### Installation & Running Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/ipranavprashant/ReachabilityAndSafetyCheckingTool.git
   cd ReachabilityAndSafetyCheckingToolFrontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   - Add the backend BASE_URL in the config.js file present in the root folder(if different from default):
   ```
   BASE_URL=http://localhost:7050
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```
   The app will be available at **http://localhost:5173**

### Deployment
The frontend is deployed using **Netlify**.

Deployed version is available at: **[Reachability and Safety Checking Tool](https://safetychecking.netlify.app/)**

## Additional Notes
- Ensure the backend is running before testing API calls.
- API requests are managed using `axios`. Update `BASE_URL` in `config.js` if needed.

For backend setup, see [Backend README](../backend/README.md).

