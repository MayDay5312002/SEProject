import * as React from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { CardContent } from '@mui/material';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import '../Styling.css'

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


function Register(){

    // current state of text fields ( username, password , and the ability to show password )
    const [username , setUsername] = useState("");
    const [password , setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loginStatus, setLoginStatus] = useState(false);

    // loading process of logining in 
    const [open, setOpen] = useState(false);
    

    const printFunction = () => {
        console.log("Attempt to Register account");   

        setOpen(true);

        // send api to login and get authenticated and authorized etc

        // for backdrop now end 

        // relocate to the main page 
    };


    return(
        <>
            <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={open}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
     
        <div className='center-container'>
            <Card className='card'  sx={{ maxWidth: 345 }}>
                <CardContent>
                    <h1>Register</h1>
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
                    <TextField
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        id="outlined-password-input"
                        label="confirm-Password"
                        type="password"
                        autoComplete="current-password"
                    />
                    
                    <div>
                        <Button variant='contained' onClick={printFunction} disabled={!username || !password || !password || (password != confirmPassword) ? true : false
                        }> Register </Button> 
                    </div>
                </CardContent>
            </Card>
        </div>
        </>
    )
}

export default Register;