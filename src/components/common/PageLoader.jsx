import React from "react";
import "./PageLoader.css";

export default function PageLoader({
  text = "Loading LernX..."
}) {
  return (
    <div className="loader-page">
      <div className="lx-loader">
        <div className="loader-circle"></div>
        <div className="loader-logo">LX</div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
}
