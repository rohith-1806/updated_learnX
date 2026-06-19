import React from "react";
import "./Loader.css";

const Loader = ({ text = "Loading LernX content..." }) => {
  return (
    <div className="lernx-loader-wrapper loading-container">
      <div className="neon-loader"></div>
      {text && <p className="lernx-loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
