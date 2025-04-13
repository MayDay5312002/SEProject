import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";
import Login from "./Login";
import MainPage from "./MainPage";
import Signup from "./SignUp";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<MainPage />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Router>
    )
}

const appDiv = document.getElementById("app");
const root = ReactDOM.createRoot(appDiv);
root.render(<App />);