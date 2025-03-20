// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./homePage/homePage"; // The popout homepage
import VitalsPage from "./vitals/vitalsPage"; // The new screen with red & blue halves
import MySleepPage from "./mySleep/mySleepPage";
import MyHeartPage from "./myHeart/myHeartPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Screen after clicking the red portion */}
        <Route path="/vitals" element={<VitalsPage />} />
        <Route path="/myHeart" element={<MyHeartPage />} />
        <Route path="/mySleep" element={<MySleepPage />} />
      </Routes>
    </Router>
  );
}

export default App;
