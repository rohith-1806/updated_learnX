import React from "react";
import "./ProfileSkeletons.css";

export const CourseCardSkeleton = () => (
  <div className="skeleton-card glass-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-body">
      <div className="skeleton-line title"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-progress-bar"></div>
    </div>
  </div>
);

export const CertificateCardSkeleton = () => (
  <div className="skeleton-card certificate-skeleton glass-card">
    <div className="skeleton-icon-large"></div>
    <div className="skeleton-body center">
      <div className="skeleton-line title"></div>
      <div className="skeleton-line short center"></div>
    </div>
  </div>
);

export const EventCardSkeleton = () => (
  <div className="skeleton-card event-skeleton glass-card">
    <div className="skeleton-image small"></div>
    <div className="skeleton-body">
      <div className="skeleton-line title"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-line date"></div>
    </div>
  </div>
);

export const SettingsSkeleton = () => (
  <div className="settings-skeleton glass-card">
    <div className="skeleton-line header"></div>
    <div className="skeleton-input-group">
      <div className="skeleton-line short"></div>
      <div className="skeleton-input"></div>
    </div>
    <div className="skeleton-input-group">
      <div className="skeleton-line short"></div>
      <div className="skeleton-input"></div>
    </div>
    <div className="skeleton-button"></div>
  </div>
);
