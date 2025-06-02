import React, { useState } from "react";
import "./Rooms.css";
import SearchRoomForm from "../components/rooms/SearchRoomForm";
import CurrentRoomsTable from "../components/bookings/currentrooms";
const Rooms = () => {
  const [showSearchRoom, setShowSearchRoom] = useState(false);
  const [showAvailableRoom, setShowAvailableRoom] = useState(false);

  return (
    <div className="rooms-container">
      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowSearchRoom(!showSearchRoom)}
        >
          <span className="toggle-icon">{showSearchRoom ? "➖" : "➕"}</span>
          <h2>View Available Rooms</h2>
        </div>
        {showSearchRoom && (
          <div className="section-content">
            <SearchRoomForm />
          </div>
        )}
      </div>

      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowAvailableRoom(!showAvailableRoom)}
        >
          
          <span className="toggle-icon">{showAvailableRoom ? "➖" : "➕"}</span>
          <h2>View Booked Rooms</h2>
        </div>
        {showAvailableRoom && (
          <div className="section-content">
            <CurrentRoomsTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
