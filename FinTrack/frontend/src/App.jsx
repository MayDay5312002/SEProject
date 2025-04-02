import Login from "./PageComponents/Login"
import Register from "./PageComponents/Register"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



function App() {
  

  return (
    <>
        <Router>
            {/*Implementing Routes for respective Path */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Register" element={<Register />} />
            </Routes>
        </Router>
     
    </>
  )
}

export default App
