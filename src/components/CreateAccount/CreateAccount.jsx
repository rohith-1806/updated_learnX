import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./CreateAccount.css";

const CreateAccount = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await register(formData.name, formData.email, formData.password);
      alert("Account Created Successfully! Please login.");
      navigate("/user-login");
    } catch (error) {
      console.error("Registration Error:", error);
      setErrorMsg(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-container">
      <form
        className="create-account-form"
        onSubmit={handleSubmit}
      >
        <h1>Create Account</h1>

        {errorMsg && (
          <p style={{ color: "#ef4444", fontSize: "0.9rem", marginBottom: "0.5rem", textAlign: "center" }}>
            {errorMsg}
          </p>
        )}

        <input
          type="text"
          placeholder="Enter Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          placeholder="Enter Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          placeholder="Create Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default CreateAccount;