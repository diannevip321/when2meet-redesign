import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Container, Typography } from '@mui/material';
import SignIn from "./components/SignIn"; 
import CreateEvent from "./components/CreateEvent";
import AvailabilityInput from "./components/AvailabilityInput";
import GroupAvailability from "./components/GroupAvailability";

function App() {
  return (
    <div className="App">
      <GroupAvailability />
    </div>
  );
}

export default App;
