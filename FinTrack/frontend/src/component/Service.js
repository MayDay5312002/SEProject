import React from "react";
import { Container, Typography, Grid, Card, CardContent, Avatar } from "@mui/material";

function Service() {
    return (
         <Container maxWidth="md" sx={{ textAlign: "center", mt: 5}}>
            <Typography variant="h3" className="blue2" sx={{fontWeight: "500"}}>Service</Typography>
            <Typography variant="h6" sx={{my: 3}} className="blue2">FinTrack is a powerful web application designed to simplify your financial management. 
                It enables you to effortlessly track your transactions, create and manage budgets, and gain real-time insights into your spending habits.
                By turning your financial data into actionable information, FinTrack helps you identify trends, optimize your expenditures, and make informed decisions to secure your financial future. 
                Whether you’re an individual or a small business,
                 FinTrack offers a user-friendly interface and robust features that put you in complete control of your finances.
            </Typography>
         </Container>
     );
}
export default Service

