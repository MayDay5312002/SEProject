import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Typography, Toolbar, Box, Button, Menu, MenuItem } from "@mui/material";
import About from "./About";


function MainPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [AboutSt, setAboutSt] = useState(false);
    const [ServicesSt, setServicesSt] = useState(false);
    const [MainAppSt, setMainAppSt] = useState(true);

    const handleClickAbout = () => {
        setMainAppSt(false);
        setAboutSt(true);
        setServicesSt(false);
      }
    
      const handleClickServices = () => {
        setMainAppSt(false);
        setAboutSt(false);
        setServicesSt(true);
      }
    
      const handleClickMainApp = () => {
        setMainAppSt(true);
        setAboutSt(false);
        setServicesSt(false);
      }
      const handleClick = (event) => {
        // console.log(event.currentTarget);
        setAnchorEl(event.currentTarget);
      };
      const handleClose = (event) => {
        // console.log(event.currentTarget);
        setAnchorEl(null);
      };
      const handleLogout = (event) => {
        // axios.get("http://127.0.0.1:8000/api/logout").then(() => {
        //   localStorage.setItem("isAuthenticated", "false");
        //   navigate("/");  
        // })
        navigate("/");
      }

    return (
        <div>
        <AppBar position="sticky" sx={{ bgcolor: "black", py: 2 }}>
        <Toolbar>
          {/* Logo or app name */}
          <Typography
            variant="h3"
            sx={{
              flexGrow: 1,
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.15em',
              color: 'inherit',
              textDecoration: 'none',
              // cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
          >
            <span style={{cursor: 'pointer'}}>FinTrack</span>
          </Typography>


          <Box sx={{ display: {xs: 'none', sm: 'flex'} }}>
            <Button color="inherit" onClick={console.log("Home Test")}>Home</Button>
            <Button color="inherit" onClick={handleClickAbout}>About</Button>
            <Button color="inherit" onClick={console.log("Services")}>Services</Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
          <Button
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            color="inherit"
            sx={{
              display: {xs: 'block', sm: 'none'}
            }}
          >
          menu
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open} //controls the visibility of the menu
            onClose={handleClose}
            sx={{display: {sm: 'none'}}}
          >
            <MenuItem onClick={console.log("Menu")}>Home</MenuItem>
            <MenuItem onClick={handleClickAbout}>About</MenuItem>
            <MenuItem onClick={console.log("Services")}>Services</MenuItem>
            <MenuItem onClick={console.log("logout")}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <div>
        {/* {MainAppSt && <MainApp />} */}
        {AboutSt && <About />}
        {/* {ServicesSt && <Services />} */}
      </div>
      
    </div>
    );
}

export default MainPage