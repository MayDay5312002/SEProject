import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState, useEffect } from 'react';

const BasicSelect = ({category, setCategory,categoryID, setCategoryID, }) => {
 

  const[categories , setCategories] = useState([]);
      useEffect(() =>{
          //so this is called or mounted when the useEffect isloaded
          // so downside that the api is going to be called ever time it is open
          console.log("from basic select called ?")
          const fetchCategories = async () =>{
              try{
                  const response = await fetch("http://127.0.0.1:8000/api/getCategories");
                  const data = await response.json();
                //   console.log(data);
                  setCategories(data["categories"]);
                //   console.data(categories)
              }catch(error){
                  console.log("error fetching categories", error);
              }
          }
          fetchCategories(); // on mount call api to set categories 
      },[]);

      const getCategories = (category_id) => {return categories.find(category => category.id === category_id)?.category_name;}
  

  const handleChange = (event) => {
    setCategory(getCategories(event.target.value));
    setCategoryID(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Category</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={categoryID}
          label="Category"
          onChange={handleChange}
        >
          {
            categories.map((categoryItem) => (
              <MenuItem key={categoryItem.id} value={categoryItem.id}>{categoryItem.category_name}</MenuItem>
            ))
          }
          
        </Select>
      </FormControl>
    </Box>
  );
}

export default BasicSelect;