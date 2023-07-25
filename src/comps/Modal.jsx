import React from "react";

export const Modal = ({ activity, onClose }) => {
    return (
      <div className="modal-overlay" style={modalOverlayStyle}>
        <div className="modal" style={modalStyle}>
          <button className="modal-close-btn" onClick={onClose}>
            X
          </button>
          <p>{activity.direction} call</p>
          <p>from {activity.from}</p>
          <p>{new Date(activity.created_at).toISOString().slice(11, 19)}</p>
        </div>
      </div>
    );
  };

// Inline styles for the modal overlay
const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  
  // Inline styles for the modal
  const modalStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "5px",
    minWidth: "400px",
  };