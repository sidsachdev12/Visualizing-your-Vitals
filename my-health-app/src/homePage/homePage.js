import React from "react";
import { useNavigate } from "react-router-dom";

import "./homePage.css"; // Import the same CSS file as above

function HomePage() {
  const navigate = useNavigate();

  const handleVitals = () => {
    // Navigate to the /vitals route
    navigate("/vitals");
  };

  // const handleHealth = () => {
  //   navigate("/health");
  // }

  return (
    <div className="split-container">
      <div className="split left" onClick={handleVitals}>
        <h1>Visualize Your Vitals</h1>
      </div>
      <div className="split right">
        <h1>Visualize General Health Trends</h1>
      </div>
    </div>
  );
}

export default HomePage;
