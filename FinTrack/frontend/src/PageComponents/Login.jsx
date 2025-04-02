import * as React from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { CardContent } from '@mui/material';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useNavigate,
    Outlet,
} from "react-router-dom";
import { useState } from 'react';
import '../Styling.css'




/**
 * 
 * TODOs:
 * - eventually add a snackbar that does a loading animation for when you are logging in 
 * 
 * - Button to be disabled when login and password is not entered
 * 
 * - use state values 
 * 
 * 
 */





function Login(){
    // current state of text fields ( username, password , and the ability to show password )
    const [username , setUsername] = useState("");
    const [password , setPassword] = useState("");
    const [loginStatus, setLoginStatus] = useState(false);

    // loading process of logining in 
    const [open, setOpen] = useState(false);
   
   

    const printFunction = () => {
        console.log("Attempt to login");   

        setOpen(true);

       // send api to login and get authenticated and authorized etc

       // for backdrop now end 

       // relocate to the main page 
    };

    return(
        //backdrop is like a loading effect 
        <>
        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={open}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
        
     
        <div className='center-container'>
           <Card className='.card' sx={{ maxWidth: 300 }}>
            <CardContent>
                <h1>Login</h1>
                <TextField
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    id="outlined-required"
                    label="username" 
                />
                <TextField
                    onChange={(e) => setPassword(e.target.value)}
                    id="outlined-password-input"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                />
                
                <div>
                    <Button variant="contained" onClick={printFunction} disabled ={!username || !password ? true : false}>Log In</Button>
                </div>
                <Divider orientation='horizontal'>OR</Divider>
                <div>
                    <Button variant='contained'> <Link to="/Register">Register</Link> </Button> 
                </div>
            </CardContent>
           </Card>
           </div>
    
        </>
    );
}

export default Login;