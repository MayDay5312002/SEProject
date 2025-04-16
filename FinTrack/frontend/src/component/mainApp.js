import React from "react";
import { Container, Typography, Avatar, LinearProgress, Box, TextField, Button, IconButton, Collapse, CircularProgress,
Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import axios from "axios"; 
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart } from "@mui/x-charts/PieChart";
import BasicModal from "../other-components/BasicModal";
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
    const [expanded, setExpanded] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const bottomRef = useRef(null);
  
    const handleSendMessage = async () => {
      if (!message.trim()) return;
    
      const newChat = [...chat, { type: "user", content: message }];
      setChat(newChat);
      setMessage("");//clear the message
    
      const updatedChat = [...newChat, { type: "ai", content: <CircularProgress size="1.7em" color="white"/> }];
      setChat(updatedChat);
    
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/chat/", { message });
    
        setChat([...updatedChat.slice(0, -1), { type: "ai", content: response.data.response }]);
      } catch (error) {
        console.error("Error communicating with AI:", error);
      }
    };  

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);
    
    useEffect(()=> {
      axios.get("http://127.0.0.1:8000/api/getMessages/")
      .then((response) => {
        let i = 1;
        let dict = [];
        response.data["response"].forEach((msg) => {
          dict.push({ type: (i % 2 === 0 ? "ai" : "user"), content: msg });
          i++;
        });
        setChat(dict);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
      axios.get("http://127.0.0.1:8000/api/getCategories/")
      .then((response) => {
        console.log(response.data["categories"]);
        setCategories(response.data["categories"]);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
    }, []);

    useEffect(() => {
      axios.get("http://127.0.0.1:8000/api/getUserTransactions/")
      .then((response) => {
        console.log(response.data["transactions"]);
        setTransactions(response.data["transactions"]);
        // console.log(transactions);
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
    }, []);

    // useEffect(() => {
    //   console.log('Transactions updated:', transactions);
    // }, [transactions]);

    // useEffect(() => {
    //   console.log('Categories updated:', categories);
    // }, [categories]);
    

    const resetThreadClick = async () => {
      try {
        await axios.post("http://127.0.0.1:8000/api/deleteThread/");
        setChat([]); // Clear the chat state
      }
      catch (error) {
        console.error("Error resetting thread:", error);
      }

    }

    const data = [
      {
        date: '2025-04-15',
        vendorName: 'Amazon',
        amount: 129.99,
        category: 'Shopping',
      },
      {
        date: '2025-04-13',
        vendorName: 'Starbucks',
        amount: 5.75,
        category: 'Food & Drink',
      },
      {
        date: '2025-04-10',
        vendorName: 'Netflix',
        amount: 15.99,
        category: 'Entertainment',
      },
    ];

    const getCategories = (category_id) => {return categories.find(category => category.id === category_id)?.category_name;} //returns a string of a category name
    // this is for search
    const filteredData = transactions.filter((row) =>
      (row.transaction_name && row.transaction_name.toLowerCase().includes(searchTerm.toLowerCase())) || // Check for transaction_name
      (getCategories(row.category_id) && getCategories(row.category_id).toLowerCase().includes(searchTerm.toLowerCase())) || // Check if category exists
      (row.date && row.date.toString().includes(searchTerm)) // Ensure row.date is a string
    );
    

 

    
    return (        
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
        <Avatar alt="FinTrack" src="http://localhost:8000/static/images/Logo.png" sx={{ width: 80, height: 80, margin: "auto" }} />
        <Typography variant="h6" className="blue2" sx={{ mt: 1.5 }}>
          {months[currentMonth]}'s Budget
        </Typography>
        <Typography variant="body2" className="blue2" sx={{ fontWeight: "600" }}>$2,000.00</Typography>
        <LinearProgress variant="determinate" value={50} sx={{ height: 10, borderRadius: 5, my: 5 }} />
        <PieChart
          series={[
            {
              data: [
                { id: 0, value: 10, label: 'Grocerries' },
                { id: 1, value: 15, label: 'Entertainment' },
                { id: 2, value: 20, label: 'Restaturant' },
              ],
            },
          ]}
          width={400}
          height={200}
        />
        <div style={{paddingBottom: "5em"}}>
        <Paper sx={{ padding: 2, borderRadius: 3, }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <BasicModal transactions={transactions} setTransactions={setTransactions}/>
            <TableContainer>
              <Table aria-label="expenses table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Vendor Name</strong></TableCell>
                    <TableCell align="right"><strong>Amount ($)</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.transaction_date}</TableCell>
                      <TableCell>{row.transaction_name}</TableCell>
                      <TableCell align="right">{row.amount.toFixed(2)}</TableCell>
                      <TableCell>{typeof row.category_id === "string" ? row.category_id : getCategories(row.category_id)}</TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          </div>
        <div style={{backgroundColor: "#90e0ef", zIndex:1000}}>
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: {xs: "85%", sm: "70%", md: "70%" }, 
            // height: {xs: "auto", sm: "15em", md: "em" },
            textAlign: "center",
            zIndex: 1000, 
            // bgcolor: "white",
          }}
          fullWidth
        >
          {/* Expand Button */}
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              transition: "transform 0.3s ease",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              // bgcolor: "#0077b6",
              // color: "white",
              borderRadius: "50%",
              width: 50,
              height: 50,
              boxShadow: 3
            }}
          >
            <ExpandLessIcon />
          </IconButton>
  

          <Collapse in={expanded} timeout="auto">
            <Box
              sx={{
                position: "absolute",
                bottom: 60, 
                left: "50%", 
                transform: "translateX(-50%)", 
                width: "100%", 
                bgcolor: "#caf0f8",
                borderRadius: 2,
                boxShadow: 3,
                p: 2,
                // transition: "0.3s ease"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h5" gutterBottom className="blue2" sx={{ fontWeight: "500" }}>
                  FinTracker AI Assistant
                </Typography>

                <IconButton onClick={resetThreadClick}>
                  <DeleteIcon sx={{color: "primary.main"}} />
                </IconButton>
              </Box>
              <Box sx={{ overflowY: "auto",
                p: 1,
                mb: 2, 
                height: {xs: "auto", sm: "10em", md: "10em" }, 
                bgcolor: "#90e0ef", 
                borderRadius: 2 }}>
                {chat.map((msg, index) => (
                  <Typography
                    variant="body1"
                    key={index}
                    sx={{
                      textAlign: msg.type === "user" ? "right" : "left",
                      bgcolor: msg.type === "user" ? "primary.light" : "#298fc4",
                      p: 1,
                      borderRadius: 1,
                      mb: 1,
                      color: "white",
                      whiteSpace: "pre-line", // Preserve line breaks
                    }}
                  >
                    {msg.content}
                  </Typography>
                ))}
                <div ref={bottomRef} /> {/* Scroll to the bottom of the chat */}
              </Box>
  
              {/* Input Field & Send Button */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevents a new line from being added
                    handleSendMessage();
                  }
                }}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth onClick={handleSendMessage}>
                Send
              </Button>
            </Box>
          </Collapse>
        </Box>
        </div>
      </Container>
     );
};
export default MainApp;

