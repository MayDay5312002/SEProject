import React from "react";
import { Container, Typography, Grid, Card, CardContent, Avatar } from "@mui/material";

const developers = [
  { name: "Luke Evarretta", role: "Programmer", image: "http://localhost:8000/static/images/levarretta.jpg" },
  { name: "James Ngo", role: "Team Lead", image: "https://via.placeholder.com/150" },
  { name: "Kian Aliwalas", role: "Quality Assurance", image: "https://via.placeholder.com/150" },
  { name: "Amadea Doleci", role: "Database Administrator", image: "https://via.placeholder.com/150" },
  { name: "Alejandro Dorado", role: "Modeling & Design", image: "https://via.placeholder.com/150" },
];

const About = () => {
  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 5}}>
      <Typography variant="h3" gutterBottom className="blue2" sx={{fontWeight: "500"}}>About Us</Typography>
      <Typography variant="h6" sx={{my: 3}} className="blue2">
        We are a passionate team dedicated to building innovative solutions. Our mission is to create 
        user-friendly applications that enhance everyday experiences.
      </Typography>
      <Grid container spacing={3} justifyContent="center" sx={{pb: 1}}>
        {developers.map((developer, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Avatar src={developer.image} alt={developer.name} sx={{ width: 160, height: 160, margin: "auto" }} />
              <CardContent>
                <Typography variant="h6" className="blue2">{developer.name}</Typography>
                <Typography variant="body2" color="text.secondary" className="blue2">{developer.role}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
export default About

