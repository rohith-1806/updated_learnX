import React, { useState, useRef, useEffect } from "react";
import { Layers, ChevronDown, Lock, Circle, Check } from "lucide-react";
import "./ModuleDropdown.css";

/**
 * Custom glassmorphism module dropdown.
 * Replaces the native <select> with a professional UI.
 * Blurs the content behind it when open.
 */
const ModuleDropdown = ({ modules, selectedModuleId, onSelect, completedModules = [], unlockedModuleIds = null, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const selectedModule = modules.find((m) => m._id === selectedModuleId);
  const selectedLabel = selectedModule?.name || selectedModule?.title || "Select Module";

  const handleSelect = (moduleId) => {
    onSelect(moduleId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      {isOpen && (
        <div
          className="dropdown-backdrop-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="custom-dropdown-container" ref={containerRef}>
        {/* Trigger */}
        <button
          className={`custom-dropdown-trigger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          <span className="dropdown-trigger-left">
            <span className="module-icon">
              <Layers size={16} />
            </span>
            <span className="module-label">{selectedLabel}</span>
          </span>
          <span className={`dropdown-chevron-icon ${isOpen ? "rotated" : ""}`}>
            <ChevronDown size={16} />
          </span>
        </button>

        {/* Options panel */}
        {isOpen && (
          <div className="custom-dropdown-options">
            {modules.map((mod, idx) => {
              const isActive = mod._id === selectedModuleId;
              const label = mod.name || mod.title || `Module ${idx + 1}`;
              const isCompleted = completedModules.includes(mod._id);
              const isLocked = unlockedModuleIds 
                ? !unlockedModuleIds.includes(mod._id) 
                : (idx > 0 && !completedModules.includes(modules[idx - 1]._id));

              let statusIcon;
              if (isCompleted) {
                statusIcon = (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 15, height: 15, borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', marginRight: 2 }}>
                    <Check size={11} strokeWidth={4} />
                  </span>
                );
              } else if (isLocked) {
                statusIcon = <Lock size={15} color="#9ca3af" />;
              } else if (isActive) {
                statusIcon = <Circle size={15} color="#6366f1" fill="#6366f1" fillOpacity={0.2} />;
              } else {
                statusIcon = <Layers size={15} color="#6366f1" />;
              }

              return (
                <button
                  key={mod._id}
                  className={`custom-dropdown-option ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
                  onClick={() => { if (!isLocked) handleSelect(mod._id); }}
                  type="button"
                  disabled={isLocked}
                  style={isLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  <span className="option-icon">
                    {statusIcon}
                  </span>
                  <span className="option-text">{label}</span>
                  {mod.isPlaceholder && (
                    <span className="option-badge placeholder">Preview</span>
                  )}
                  {isLocked && (
                    <span className="option-badge placeholder">Locked</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ModuleDropdown;
