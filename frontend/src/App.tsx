import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Container, Typography } from '@mui/material';
import SignIn from "./components/SignIn"; 
import CreateEvent from "./components/CreateEvent";
import AvailabilityInput from "./components/AvailabilityInput";

function App() {
  return (
    <div className="App">
        <AvailabilityInput />
    </div>
  );
}

export default App;
