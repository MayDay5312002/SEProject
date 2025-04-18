import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

const categories = [
  { name: 'Groceries', value: 320, goal: 500 },
  { name: 'Utilities', value: 180, goal: 150 },
  { name: 'Entertainment', value: 220, goal: 300 },
  { name: 'Transport', value: 180, goal: 200 },
];

const CategoryProgressBars = () => {
  return (
    // <Paper elevation={3} sx={{ p: 3 }}>
    <Box sx={{width: "100%"}}>
      <Typography variant="h7" className="blue2" sx={{ mb: 2, fontWeight: 500 }}>
        Category Budgets
      </Typography>
      {categories.map(({ name, value, goal }) => {
        const percent = Math.min((value / goal) * 100, 100);
        return (
          <Box key={name} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">{name}</Typography>
              <Typography variant="body2">${value} / ${goal}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 10,
                borderRadius: 5,
              }}
            />
          </Box>
        );
      })}
    {/* // </Paper> */}
    </Box>
  );
};

export default CategoryProgressBars;
