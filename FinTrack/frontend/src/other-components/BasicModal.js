import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import BasicSelect from './BasicSelect';
// import  { useAppContext } from "../Global/AppProvider";
import axios from 'axios';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

/**
 * 
 * date field
 * amount field
 * currency field
 * name field
 * 
 * submit button
 */

export default function BasicModal({transactions, setTransactions}) {

  //global access token 
//   const {accessToken , setAccessToken , refreshMount, setRefreshMount} = useAppContext();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //use state for current variables
  const [ date , setDate] = useState(null);
  const [ name , setName] = useState(null);
  const [ amount , setAmount] = useState(null);
  const [category, setCategory] = useState(null);
  const [categoryID, setCategoryID] = useState(null);


  const handleTransaction = async () => {
    axios.post("http://127.0.0.1:8000/api/addTransaction/", {"date": date, "amount": amount, "category": category, "name": name})
    .then((response) => {
      console.log("Transaction added successfully:", response.data);
    //   console.log("asddas",category, typeof category);
      setTransactions((prevTransactions) => [...prevTransactions, {transaction_date: date, amount: parseFloat(amount), category_id: category, transaction_name: name}]);//not categoryId
      handleClose();
    //   clearFields();
    })
    .catch((error) => {
      console.error("Error adding transaction:", error);
    });
    
    setDate("");
    setAmount("");
    setCategory(null);
    setName("");
    handleClose();
  }

  return (
    <div>
      <Button onClick={handleOpen}>Add Transaction</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enter Transaction
          </Typography>

          <div>
            <h2>Category Type</h2>
            <BasicSelect category={category} setCategory={setCategory} categoryID={categoryID} setCategoryID={setCategoryID}/>
          </div>

          <div>
            <TextField type='date' value={date} onChange={(e) => setDate(e.target.value)}/>

          </div>
          <div>
          <TextField id="Transaction-Name" label="Transaction-Name" value={name} onChange={(e) => setName(e.target.value)} variant="filled" />
          </div>
        
          <div>
            <h2>Amount</h2>
            <input type='number' min="0.0" value={amount} onChange={(e) => setAmount(e.target.value)}/>
          </div>

          

          <div>
            <Button disabled={date == null || name == null || amount == null ? true : false} onClick={handleTransaction} variant='contained'>Submit transaction</Button>
          </div>
          
          
          
       
         
          
        </Box>
      </Modal>
    </div>
  );
}