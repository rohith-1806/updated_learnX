import React from 'react';
import './SkeletonLoader.css';

export const CardSkeleton = () => (
  <div className="skeleton-card-container">
    <div className="skeleton-line skeleton-avatar"></div>
    <div className="skeleton-line skeleton-title"></div>
    <div className="skeleton-line skeleton-subtitle"></div>
    <div className="skeleton-line skeleton-btn"></div>
  </div>
);

export const ResumePreviewSkeleton = () => (
  <div className="skeleton-preview-container">
    <div className="skeleton-header-box">
      <div className="skeleton-line skeleton-name"></div>
      <div className="skeleton-line skeleton-role"></div>
      <div className="skeleton-line skeleton-contact"></div>
    </div>
    <div className="skeleton-body-box">
      <div className="skeleton-section-block">
        <div className="skeleton-line skeleton-section-title"></div>
        <div className="skeleton-line skeleton-text-full"></div>
        <div className="skeleton-line skeleton-text-half"></div>
      </div>
      <div className="skeleton-section-block">
        <div className="skeleton-line skeleton-section-title"></div>
        <div className="skeleton-line skeleton-text-full"></div>
        <div className="skeleton-line skeleton-text-full"></div>
      </div>
    </div>
  </div>
);

export const AtsSkeleton = () => (
  <div className="skeleton-ats-container">
    <div className="skeleton-circle-gauge"></div>
    <div className="skeleton-progress-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="skeleton-progress-row">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-bar"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function SkeletonLoader({ type = "card" }) {
  if (type === "preview") return <ResumePreviewSkeleton />;
  if (type === "ats") return <AtsSkeleton />;
  return <CardSkeleton />;
}
