import React from "react";
import "./SkeletonLoader.css";

const SkeletonCard = ({ type }) => {
  switch (type) {
    case "course":
      return (
        <div className="skeleton-card skeleton-card-course">
          <div className="skeleton-img"></div>
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-text short"></div>
          <div className="skeleton-btn"></div>
        </div>
      );
    case "department":
      return (
        <div className="skeleton-card skeleton-card-department">
          <div className="skeleton-icon"></div>
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-text short"></div>
        </div>
      );
    case "event":
      return (
        <div className="skeleton-card skeleton-card-event">
          <div className="skeleton-img skeleton-img-event"></div>
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-text short"></div>
          <div className="skeleton-btn"></div>
        </div>
      );
    case "pathway":
      return (
        <div className="skeleton-card skeleton-card-pathway">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-bar"></div>
        </div>
      );
    case "profile":
      return (
        <div className="skeleton-card skeleton-card-profile">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-text short"></div>
          <div className="skeleton-bar"></div>
        </div>
      );
    default:
      return (
        <div className="skeleton-card">
          <div className="skeleton-img"></div>
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-btn"></div>
        </div>
      );
  }
};

function SkeletonLoader({ count = 8, type = "course" }) {
  return (
    <div className={`skeleton-grid skeleton-grid-${type}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} type={type} />
      ))}
    </div>
  );
}

export default SkeletonLoader;
