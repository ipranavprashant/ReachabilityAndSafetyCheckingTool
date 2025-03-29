import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Loader2,
  Clipboard,
  Moon,
  Sun,
  Menu,
  Terminal,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { BASE_URL } from "../config";

export default function CheckWithITS() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [fetchingUpdates, setFetchingUpdates] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [result, setResult] = useState(null);
  const terminalRef = useRef(null);
  const pollingIntervalRef = useRef(null);

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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Polling for updates
  useEffect(() => {
    if (requestId && !processingComplete) {
      // Start polling for updates
      pollingIntervalRef.current = setInterval(fetchUpdates, 500);

      // Clean up interval on unmount or when processing is complete
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [requestId, processingComplete]);

  // Handle component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const fetchUpdates = async () => {
    if (fetchingUpdates || !requestId) return;

    setFetchingUpdates(true);
    try {
      const response = await axios.get(`${BASE_URL}/updates/${requestId}`);
      console.log(`${BASE_URL}/updates/${requestId}`);
      const { updates, completed, result } = response.data;

      if (updates && updates.length > 0) {
        setTerminalOutput(updates);
      }

      if (completed) {
        setProcessingComplete(true);
        setResult(result);
        setLoading(false);
        clearInterval(pollingIntervalRef.current);

        if (result && result.unsafe) {
          toast.error("System is UNSAFE! Unsafe markings found.");
        } else if (result && !result.error) {
          toast.success("System is SAFE! No unsafe markings are reachable.");
        }
      }
    } catch (error) {
      console.error("Error fetching updates:", error);
    } finally {
      setFetchingUpdates(false);
    }
  };

  const handleBackendCall = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter input text or upload a file");
      return;
    }

    setLoading(true);
    setTerminalOutput([]);
    setRequestId(null);
    setProcessingComplete(false);
    setResult(null);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/process`,
        {
          input_text: inputText,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (response.data && response.data.request_id) {
        setRequestId(response.data.request_id);
        toast.info("Processing started. Updates will appear in the terminal.");
      } else {
        toast.error("Invalid response from server");
        setLoading(false);
      }
    } catch (error) {
      console.error("Axios Error:", error);
      toast.error(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setInputText(e.target.result);
      reader.readAsText(file);
      toast.info(`File loaded: ${file.name}`);
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <X className="w-4 h-4 text-red-500" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMessageClass = (type) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "info":
      default:
        return "text-blue-400";
    }
  };

  const renderTerminalContent = () => {
    if (terminalOutput.length === 0) {
      return (
        <div className="text-gray-500 italic">Logs will appear here...</div>
      );
    }

    return terminalOutput.map((message, index) => (
      <div
        key={index}
        className={`flex items-start gap-2 mb-1 ${getMessageClass(
          message.type
        )}`}
      >
        <div className="mt-1">{getMessageIcon(message.type)}</div>
        <div className="font-mono text-xs whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    ));
  };

  const clearTerminal = () => {
    setTerminalOutput([]);
    setRequestId(null);
    setProcessingComplete(false);
    setResult(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Input Format", path: "/input-format" },
    { name: "Research Paper", path: "/research-paper" },
    { name: "Test Cases", path: "/test-cases" },
    { name: "Contributors", path: "/contributors" },
  ];

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } flex flex-col`}
    >
      <nav
        className={`py-4 px-6 mb-8 flex justify-center lg:justify-between items-center ${
          darkMode ? "bg-gray-800" : "bg-gray-200 shadow-md"
        }`}
      >
        <h1 className="text-sm lg:text-2xl font-bold">
          Reachability Tool – GAL Synthesis & Analysis
        </h1>
        <div className="lg:hidden flex ml-auto cursor-pointer">
          <button onClick={() => setNavOpen(!navOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div
          className={`lg:flex items-center space-x-6 ${
            navOpen
              ? `flex flex-col absolute top-14 right-0 p-4 w-48 rounded-lg ${
                  darkMode ? "bg-gray-800" : "bg-gray-200 shadow-md"
                }`
              : "hidden"
          }`}
        >
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
            className={`p-2 rounded-full  ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-400"
            } transition cursor-pointer`}
          >
            {darkMode ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-gray-800" />
            )}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          className={`p-6 rounded-2xl shadow-lg w-full max-w-4xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-3">
            Upload Rutwiya System Input
          </h2>

          <div className="flex flex-wrap gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
              <Clipboard className="w-5 h-5" />
              Upload File
              <input
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <button
              className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleBackendCall}
              disabled={loading || !inputText.trim()}
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
              ) : (
                <Terminal className="w-5 h-5 mr-2" />
              )}
              {loading ? "Processing..." : "Verify Reachability"}
            </button>

            <button
              className="px-6 py-2 bg-gray-600 text-white rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all cursor-pointer"
              onClick={clearTerminal}
              disabled={loading}
            >
              Clear Terminal
            </button>
          </div>

          <textarea
            className={`mt-3 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-100"
            }`}
            rows="6"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type input data here..."
          />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Analysis Terminal Output
              </h3>
              {loading && (
                <div className="flex items-center gap-2 text-blue-500">
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span className="text-sm">Processing...</span>
                </div>
              )}
              {processingComplete && result && (
                <div
                  className={`flex items-center gap-2 ${
                    result.unsafe ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {result.unsafe ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {result.unsafe ? "UNSAFE" : "SAFE"}
                  </span>
                </div>
              )}
            </div>

            <div
              ref={terminalRef}
              className={`p-4 rounded-lg ${
                darkMode ? "bg-black" : "bg-gray-800"
              } text-white font-mono text-sm overflow-y-auto`}
              style={{ height: "400px" }}
            >
              {renderTerminalContent()}
            </div>
          </div>
        </motion.div>
      </div>

      <footer
        className={`py-4 text-center mt-8 ${
          darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-600"
        }`}
      >
        A Petri net based Reachability and Safety checking Tool for Open
        Multi-Agent Systems
      </footer>
      <ToastContainer
        position="bottom-right"
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}
