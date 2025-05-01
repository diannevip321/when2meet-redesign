// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import SignIn from "./components/SignIn"; 
import CreateEvent from "./components/CreateEvent";
import AvailabilityInput from "./components/AvailabilityInput";
import GroupAvailability from "./components/GroupAvailability";
import theme from "./theme";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* sidebar toggle button + drawer */}
      <Sidebar />

      {/* your pages */}
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/availability" element={<AvailabilityInput />} />
        <Route path="/group" element={<GroupAvailability />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
