import React from "react";
import { CircularProgress, AppBar, Typography, Toolbar, Box, Button, Menu, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MainPage() {
    const navigate = useNavigate();
    useEffect(()=> {
      axios.get("http://127.0.0.1:8000/api/authenticate/")
      .then((response) => {
        localStorage.setItem("isAuthenticated", "true");
      })
      .catch((error) => {
        localStorage.setItem("isAuthenticated", "false");
        navigate("/"); 
      });
    }, []);
    return (
        <div>

        </div>
    );
}

export default MainPage