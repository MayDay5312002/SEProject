import React from "react";
import { CircularProgress, AppBar, Typography, Toolbar, Box, Button, Menu, MenuItem } from "@mui/material";

function MainPage() {
    return (
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
            <Button color="inherit" onClick={console.log("Home")}>Home</Button>
            <Button color="inherit" onClick={console.log("About")}>About</Button>
            <Button color="inherit" onClick={console.log("Services")}>Services</Button>
            <Button color="inherit" onClick={console.log("Logout")}>Logout</Button>
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
            <MenuItem onClick={console.log("About")}>About</MenuItem>
            <MenuItem onClick={console.log("Services")}>Services</MenuItem>
            <MenuItem onClick={console.log("logout")}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    );
}

export default MainPage