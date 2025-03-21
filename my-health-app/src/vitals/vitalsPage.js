// src/VitalsPage.js
import React from "react";
import { useNavigate } from "react-router-dom";

import "./vitalsPage.css";

// Import the heart SVG as a React component (Create React App or Vite)
import { ReactComponent as HeartIcon } from "../assets/heart.svg";

function VitalsPage() {
  const navigate = useNavigate();

  const handleHeartInfoPage = () => {
    navigate("/myHeart");
  };
  const handleSleepInfoPage = () => {
    navigate("/mySleep");
  };
  return (
    <div className="vitals-page">
      <div className="top-row">
        <div className="left-col" onClick={handleHeartInfoPage}>
          {/* Container for the heart and label */}
          <div className="heart-container">
            <HeartIcon className="heart-icon" />
            <h1>Heart Health</h1>
          </div>
        </div>
        <div className="right-col" onClick={handleSleepInfoPage}>
          <div className="sleep-container">
            <h1>Sleep Data</h1>
            {/* Replace this with your sleep icon SVG if available */}
            <div className="sleep-icon">🌙</div>
          </div>
        </div>
      </div>
      <div className="bottom-section">{/* Additional content goes here */}</div>
    </div>
  );
}

export default VitalsPage;
