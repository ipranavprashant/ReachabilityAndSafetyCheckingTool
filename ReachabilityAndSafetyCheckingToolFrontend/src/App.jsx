import { Routes, Route } from "react-router-dom";
import GalCodeGenerator from "./components/GalCodeGenerator";
import Contributors from "./components/Contributors";
import ResearchPaper from "./components/ResearchPaper";
import InputFormatSpecifications from "./components/InputFormatSpecifications";
import TestCases from "./components/TestCases";
import CheckWithITS from "./components/CheckWithITS";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/AttemptWithRandomness" element={<GalCodeGenerator />} />
        <Route path="/" element={<CheckWithITS />} />
        <Route path="/input-format" element={<InputFormatSpecifications />} />
        <Route path="/research-paper" element={<ResearchPaper />} />
        <Route path="/test-cases" element={<TestCases />} />
        <Route path="/contributors" element={<Contributors />} />
      </Routes>
    </div>
  );
}
