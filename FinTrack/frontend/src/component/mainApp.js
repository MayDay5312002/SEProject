import React from "react";
import { Container, Typography, Avatar, LinearProgress, Box, TextField, Button } from "@mui/material";
import { useState } from "react";
import axios from "axios"; // Make sure to install axios using npm or yarn if you haven't already
const months = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December",
};
function MainApp() {
    const currentMonth = new Date().getMonth(); 
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
  
    const handleSendMessage = async () => {
      if (!message.trim()) return;
  
      const newChat = [...chat, { type: "user", content: message }];
      setChat(newChat);
      setMessage("");
  
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/chat/", { message });
        console.log(response)
        setChat([...newChat, { type: "ai", content: response.data['response'] }]);
      } catch (error) {
        console.error("Error communicating with AI:", error);
      }
    };

    
    return (
         <Container maxWidth="md" sx={{ textAlign: "center", mt: 5}}>
            <Avatar alt="FinTrack" src="http://localhost:8000/static/images/Logo.png" sx={{ width: 80, height: 80, margin: "auto" }} />
            <Typography variant="h6" className="blue2" sx={{mt: 1.5}}>{months[currentMonth]}'s Budget</Typography>
            <Typography variant="body2" className="blue2" sx={{fontWeight: "600"}}>$2,000.00</Typography>
            <LinearProgress variant="determinate" value={50} sx={{ height: 10, borderRadius: 5 , my: 5}} />


            <Typography variant="h5" align="center" gutterBottom className="blue2">AI Assistant</Typography>
      
            <Box sx={{ maxHeight: "400px", overflowY: "auto", p: 1, mb: 2 }}>
              {chat.map((msg, index) => (
                <Typography key={index} sx={{ 
                  textAlign: msg.type === "user" ? "right" : "left",
                  bgcolor: msg.type === "user" ? "primary.light" : "grey.300",
                  p: 1, borderRadius: 1, mb: 1 
                }}>
                  {msg.content}
                </Typography>
              ))}
            </Box>
          
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleSendMessage}>Send</Button>
         </Container>
     );
};
export default MainApp;

