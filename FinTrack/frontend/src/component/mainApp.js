import React from "react";
import { Container, Typography, Avatar, Box, TextField, Button, IconButton, Collapse, CircularProgress,
Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider
} from "@mui/material";

// import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import BasicModal from "../other-components/BasicModal";
import ChartDashboard from "../other-components/ChartDashboard";
import CategoryProgressBars from "../other-components/CategoryProgressBars";
import BasicModalBudget from "../other-components/BasicModalBudget";
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
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortTransConfig, setSortTransConfig] = useState({ key: null, direction: "asc" });
    const [sortBudgetConfig, setSortBudgetConfig] = useState({ key: null, direction: "asc" });
    const [totalBudget, setTotalBudget] = useState(0);
    const [username, setUsername] = useState("");
    const bottomRef = useRef(null);

    const navigate = useNavigate();
  
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
        // console.log(response.data["categories"]);
        setCategories(response.data["categories"]);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        localStorage.setItem("isAuthenticated", "false");
        navigate("/"); 
      });
    }, []);

    useEffect(() => {
      axios.get("http://127.0.0.1:8000/api/getUserTransactions/")
      .then((response) => {
        // console.log(response.data["transactions"]);
        setTransactions(response.data["transactions"]);
        // console.log(transactions);
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
        localStorage.setItem("isAuthenticated", "false");
        navigate("/"); 
      });
      axios.get("http://127.0.0.1:8000/api/getUserBudgets/")
      .then((response) => {
        // console.log(response.data["budgets"]);
        setBudgets(response.data["budgets"]);
        // console.log(budgets);
      })
      .catch((error) => {
        console.error("Error fetching budgets:", error);
        localStorage.setItem("isAuthenticated", "false");
        navigate("/"); 
      });

      axios.get("http://127.0.0.1:8000/api/getUsername/")
      .then((response) => {
        // console.log(response.data["budgets"]);
        setUsername(response.data["username"]);
        // console.log(budgets);
      })
      .catch((error) => {
        console.error("Error fetching budgets:", error);
        localStorage.setItem("isAuthenticated", "false");
        navigate("/"); 
      });

    }, []);

    useEffect(() => {
      let total = 0;
      console.log("Yerr");
      budgets.forEach((budget) => {
        total += budget.amount;
      });
      setTotalBudget(total);
    }, [budgets]);


  
    

    const resetThreadClick = async () => {
      try {
        await axios.post("http://127.0.0.1:8000/api/deleteThread/");
        setChat([]); // Clear the chat state
      }
      catch (error) {
        console.error("Error resetting thread:", error);
      }

    }


    const getCategories = (category_id) => {return categories.find(category => category.id === category_id)?.category_name;} //returns a string of a category name
    // this is for search
    const filteredTransactionData = transactions.filter((row) =>
      (row.transaction_name && row.transaction_name.toLowerCase().includes(searchTerm.toLowerCase())) || // Check for transaction_name
      (getCategories(row.category_id) && getCategories(row.category_id).toLowerCase().includes(searchTerm.toLowerCase())) || // Check if category exists
      (row.transaction_date && row.transaction_date.includes(searchTerm)) || // Ensure row.date is a string
      (row.amount && row.amount.toString().includes(searchTerm)) // Ensure row.amount is a number 
    );
    

    const sortedFinancialData = [...filteredTransactionData].sort((a, b) => {
      if (!sortTransConfig.key) return 0;
    
      let aValue = a[sortTransConfig.key];
      let bValue = b[sortTransConfig.key];
    
      // Handle numeric sort
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortTransConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
    
      // Handle string sort
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    
      if (aValue < bValue) return sortTransConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortTransConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    const handleTransactionSort = (key) => {
      setSortTransConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    };


    const filteredBudgetData = budgets.filter((row) =>
      // (row.transaction_name && row.transaction_name.toLowerCase().includes(searchTerm.toLowerCase())) || // Check for transaction_name
      (getCategories(row.category_id) && getCategories(row.category_id).toLowerCase().includes(searchTerm.toLowerCase())) || // Check if category exists
      // (row.transaction_date && row.transaction_date.includes(searchTerm)) || // Ensure row.date is a string
      (row.amount && row.amount.toString().includes(searchTerm)) // Ensure row.amount is a number 
    );


    const sortedBudgetData = [...filteredBudgetData].sort((a, b) => {
      if (!sortBudgetConfig.key) return 0;
    
      let bValue = b[sortBudgetConfig.key];
      let aValue = a[sortBudgetConfig.key];
    
      // Handle numeric sort
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortBudgetConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
    
      // Handle string sort
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    
      if (aValue < bValue) return sortBudgetConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortBudgetConfig.direction === "asc" ? 1 : -1;
      return 0;
    });


    
    const handleBudgetSort = (key) => {
      setSortBudgetConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    };
    
    

    // console.log("budgets: ",budgets);

    
    return (        
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
        <Avatar alt={username} src={`https://placehold.co/150?text=${username.charAt(0).toUpperCase()}`} sx={{ width: 80, height: 80, margin: "auto" }} />
        <Typography variant="h6" className="blue2" sx={{ mt: 1.5 }}>
          {months[currentMonth]}'s Total Budget
        </Typography>
        <Typography variant="body2" className="blue2" sx={{ fontWeight: "600" }}>${totalBudget}</Typography>
        {/* <LinearProgress variant="determinate" value={50} sx={{ height: 10, borderRadius: 5, my: 5 }} /> */}
        <Divider sx={{ my: 2 }} />
        <CategoryProgressBars />
        {/* <PieChart
          series={[
            {
              data: [
                { id: 0, value: 10, label: 'Grocerries' },
                { id: 1, value: 15, label: 'Entertainment' },
                { id: 2, value: 20, label: 'Restaturant' },
              ],
            },
          ]}
          width={350}
          height={200}
        /> */}
        <ChartDashboard transactions={transactions} categories={categories} getCategories={getCategories}/>

        <div style={{paddingBottom: "5em"}}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "column", md: "row" }} // xs & sm = column, md+ = row
              gap={"2em"} // adds spacing between items
              // sx={{pd: "20em"}}
            >
            <Paper sx={{ padding: "2em", borderRadius: "3em"}}>
                <Typography variant="h5" gutterBottom className="blue2" sx={{fontWeight: "500"}}>Transactions</Typography>
                <TextField
                  label="Search"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <BasicModal transactions={transactions} setTransactions={setTransactions}/> {/* Add Transaction Button */}
                <TableContainer>
                  <Table aria-label="expenses table">
                    <TableHead>
                      <TableRow>
                        <TableCell onClick={() => handleTransactionSort("transaction_date")} style={{ cursor: "pointer" }}>
                          <strong>Date {sortTransConfig.key === "transaction_date" ? (sortTransConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell>
                        <TableCell onClick={() => handleTransactionSort("transaction_name")} style={{ cursor: "pointer" }}>
                          <strong>Vendor Name {sortTransConfig.key === "transaction_name" ? (sortTransConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell>
                        <TableCell onClick={() => handleTransactionSort("amount")} style={{ cursor: "pointer" }} align="right">
                          <strong>Amount ($) {sortTransConfig.key === "amount" ? (sortTransConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell>
                        <TableCell onClick={() => handleTransactionSort("category_id")} style={{ cursor: "pointer" }}>
                          <strong>Category {sortTransConfig.key === "category_id" ? (sortTransConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedFinancialData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.transaction_date}</TableCell>
                          <TableCell>{row.transaction_name}</TableCell>
                          <TableCell align="right">{row.amount.toFixed(2)}</TableCell>
                          <TableCell>{typeof row.category_id === "string" ? row.category_id : getCategories(row.category_id)}</TableCell>
                        </TableRow>
                      ))}
                      {filteredTransactionData.length === 0 && (
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


              <Paper sx={{ padding: "2em", borderRadius: "3em"}}>
                <Typography variant="h5" gutterBottom className="blue2" sx={{fontWeight: "500"}}>Budgets</Typography>
                <TextField
                  label="Search"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <BasicModalBudget budgets={budgets} setBudgets={setBudgets} getCategory={getCategories}/>
                <TableContainer>
                  <Table aria-label="expenses table">
                    <TableHead>
                      <TableRow>
                        {/* <TableCell onClick={() => handleTransactionSort("transaction_date")} style={{ cursor: "pointer" }}>
                          <strong>Date {sortTransConfig.key === "transaction_date" ? (sortTransConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell>
                        <TableCell onClick={() => handleTransactionSort("transaction_name")} style={{ cursor: "pointer" }}>
                          <strong>Vendor Name {sortTransConfig.key === "transaction_name" ? (sortTransConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell> */}
                        <TableCell onClick={() => handleBudgetSort("amount")} style={{ cursor: "pointer" }} align="right">
                          <strong>Amount ($) {sortBudgetConfig.key === "amount" ? (sortBudgetConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell>
                        <TableCell onClick={() => handleBudgetSort("category_id")} style={{ cursor: "pointer" }}>
                          <strong>Category {sortBudgetConfig.key === "category_id" ? (sortBudgetConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedBudgetData.map((row, index) => (
                        <TableRow key={index}>
                          {/* <TableCell>{row.transaction_date}</TableCell>
                          <TableCell>{row.transaction_name}</TableCell> */}
                          <TableCell align="right">{row.amount.toFixed(2)}</TableCell>
                          <TableCell>{typeof row.category_id === "string" ? row.category_id : getCategories(row.category_id)}</TableCell>
                        </TableRow>
                      ))}
                      {filteredTransactionData.length === 0 && (
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
            </Box>
        </div>
        <div style={{backgroundColor: "#90e0ef", zIndex:1000}}>
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: {xs: "85%", sm: "85%", md: "70%" }, 
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
              <Box 
              sx={{ overflowY: "auto",
              p: 1,
              mb: 2, 
              height: "37vh", 
              
              bgcolor: "#90e0ef", 
              borderRadius: 2 }}
              // gap="2em"
              >
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
                sx={{ mb: 2}}
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

