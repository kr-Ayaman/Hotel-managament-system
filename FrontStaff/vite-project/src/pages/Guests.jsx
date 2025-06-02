import React, { useState } from "react";
import "./Guests.css";
import AddGuestForm from "../components/Guests/AddGuestForm";
import GuestSearchTable from "../components/Guests/GuestSearchTable";
const Guests = () => {
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showSearchGuest, setShowSearchGuest] = useState(false);

  return (
    <div className="guests-container">
      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowAddGuest(!showAddGuest)}
        >
          <span className="toggle-icon">{showAddGuest ? "➖" : "➕"}</span>
          <h2>Add New Guest</h2>
        </div>
        {showAddGuest && (
          <div className="section-content">
            <AddGuestForm />
          </div>
        )}
      </div>

      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowSearchGuest(!showSearchGuest)}
        >
          
          <span className="toggle-icon">{showSearchGuest ? "➖" : "➕"}</span>
          <h2>Search Guest</h2>
        </div>
        {showSearchGuest && (
          <div className="section-content">
            <GuestSearchTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Guests;
