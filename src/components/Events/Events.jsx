import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserEvents } from "../../services/authApi";
import SkeletonLoader from "../common/SkeletonLoader";
import PageLoader from "../common/PageLoader";
import "./Events.css";

const Events = ({ home }) => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const data = await getUserEvents();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setEvents(data);
          } else {
            setEvents([]);
          }
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        if (isMounted) {
          setError("Failed to load events. Please try again later.");
          setEvents([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvents();
    return () => { isMounted = false; };
  }, []);

  const openForm = (event) => {
    setSelectedEventId(event._id);
    setErrorMessage("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setErrorMessage("");
    setSuccessMessage("");
    setFormData({ name: "", email: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!formData.name.trim() || !isValidEmail) {
      setErrorMessage("Please enter a valid name and email address.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("https://brillon-tasks.onrender.com/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, eventId: selectedEventId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Successfully Registered!");
        setFormData({ name: "", email: "" });
        setTimeout(() => { closeForm(); }, 1500);
      } else {
        setErrorMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration API error:", err);
      setErrorMessage("Failed to connect to the server. Please try again.");
    } finally { setSubmitting(false); }
  };

  const displayedEvents = home ? events.slice(0, 3) : events;

  return (
    <div className="events-container" id="events">
      <h1 className="title section-heading-premium">Upcoming Events</h1>

      {loading ? (
        home ? <PageLoader /> : <SkeletonLoader count={8} type="event" />
      ) : error ? (
        <div className="events-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="events-empty">
          <p>No upcoming events at this time. Check back later!</p>
        </div>
      ) : (
        <div className="events-grid">
          {displayedEvents.map((event, index) => (
            <div className="event-card" key={`${event._id}-${index}`}>
              <img src={event.image} alt={event.name} loading="lazy" />
              <div className="event-content">
                <span className={`category ${event.category?.toLowerCase() === 'it' ? 'it-badge' : 'non-it-badge'}`}>
                  {event.category || "General"}
                </span>
                <h2>{event.name}</h2>
                <p className="event-meta">📅 {event.date ? new Date(event.date).toLocaleDateString(undefined, {dateStyle: 'medium'}) : "TBA"}</p>
                <p className="event-meta">📍 {event.location}</p>
                <p className="event-description">{event.description}</p>
                <button className="register-btn" onClick={() => openForm(event)}>Register Now</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {home && (
        <div className="view-more-container">
          <button className="view-more-btn" onClick={() => navigate("/events")}>View More Events</button>
        </div>
      )}

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h2>Event Registration</h2>
            {errorMessage && <p className="form-msg error">{errorMessage}</p>}
            {successMessage && <p className="form-msg success">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" placeholder="Enter Full Name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Enter Email Address" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? "Processing..." : "Confirm Seat"}</button>
                <button type="button" className="close-btn" onClick={closeForm} disabled={submitting}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;