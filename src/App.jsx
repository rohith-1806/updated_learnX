import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import PageLoader from "./components/common/PageLoader";

// COMMON NEW
import Navbar from "./components/Navbar";
import Hero from "./components/Hero/Hero";
import Footer from "./components/Footer/Footer";
import CustomCursor from "./components/CustomCursor";
import LearnXHelper from "./components/LearnXHelper/LearnXHelper";

// AUTH PAGES
import CreateAccount from "./components/CreateAccount/CreateAccount";
import AdminLogin from "./components/AdminLogin/AdminLogin";
import UserLogin from "./components/UserLogin/UserLogin";
import VerifyEmail from "./components/VerifyEmail/VerifyEmail";

// NEW PAGES
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import CoursePlayer from "./pages/CoursePlayer";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Certificate from "./pages/Certificate";

// OLD COMPATIBLE (FOR HOMEPAGE VIEWPORT PRESERVING)
import OldCourses from "./components/Courses/Courses";

// DASHBOARD
import UserDashboard from "./components/UserDashboard/UserDashboard";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

// RESUME MODULE
import ResumeDashboard from "./components/Resume/ResumeDashboard";
import ResumeBuilder from "./components/Resume/ResumeBuilder";
import ResumeTemplates from "./components/Resume/ResumeTemplates";
import AtsChecker from "./components/Resume/AtsChecker";

function HomePage() {
  return (
    <>
      <Hero />
      <OldCourses home={true} />
      <Events home={true} />
      <Footer />
    </>
  );
}

function App() {
  const location = useLocation();
  const { loading } = useAuth();

  // Hide the global Navbar in LMS player, dashboards, and verify-email screen
  const hideNavbar =
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/user-dashboard" ||
    location.pathname.includes("verify-email") ||
    location.pathname.startsWith("/player/");

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <CustomCursor />
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* HOME */}
        <Route path="/" element={<HomePage />} />

        {/* COURSES & PLAYER */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/player/:courseId" element={<CoursePlayer />} />

        {/* EVENTS */}
        <Route path="/events" element={<Events />} />

        {/* PROFILE & CERTIFICATE */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/certificate/preview" element={<Certificate />} />

        {/* RESUME MODULE */}
        <Route path="/resume" element={<ResumeDashboard />} />
        <Route path="/resume/builder" element={<ResumeBuilder />} />
        <Route path="/resume/templates" element={<ResumeTemplates />} />
        <Route path="/resume/ats" element={<AtsChecker />} />

        {/* OLD ROUTING COMPATIBILITY */}
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/user/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
      <LearnXHelper />
    </>
  );
}

export default App;