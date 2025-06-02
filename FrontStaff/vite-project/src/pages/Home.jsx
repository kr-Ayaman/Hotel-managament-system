import React, { useState } from "react";
import "./Home.css";
import PastRoomsTable from "../components/bookings/pastrooms";
import CurrentRoomsTable from "../components/bookings/currentrooms";
import UpcomingRoomsTable from "../components/bookings/upcomingrooms";
import PastBanquetsTable from "../components/bookings/pastbanquets";
import CurrentBanquetsTable from "../components/bookings/currentbanquets";
import UpcomingBanquetsTable from "../components/bookings/upcomingbanquets";
const Home = () => {
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPast, setShowPast] = useState(false);

  return (
    <div className="bookings-container">
      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowUpcoming(!showUpcoming)}
        >
          <span className="toggle-icon">{showUpcoming? "➖" : "➕"}</span>
          <h2>View Upcoming Bookings</h2>
        </div>
        {showUpcoming && (
          <div className="section-content">
            <div className="tables">
              <h2>Rooms</h2>
              <UpcomingRoomsTable/>
              </div>
              <div className="tables">
              <h2>Banquets</h2>
              <UpcomingBanquetsTable/>
              </div>
          </div>
          
        )}
      </div>
      
      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowCurrent(!showCurrent)}
        >
          <span className="toggle-icon">{showCurrent ? "➖" : "➕"}</span>
          <h2>View Current Bookings</h2>
        </div>
        {showCurrent && (
          <div className="section-content">
          <div className="tables">
            <h2>Rooms</h2>
            <CurrentRoomsTable/>
            </div>
            <div className="tables">
            <h2>Banquets</h2>
            <CurrentBanquetsTable/>
            </div>
        </div>
        )}
      </div>
      
      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowPast(!showPast)}
        >
          <span className="toggle-icon">{showPast ? "➖" : "➕"}</span>
          <h2>View Past Bookings</h2>
        </div>
        {showPast && (
          <div className="section-content">
          <div className="tables">
            <h2>Rooms</h2>
            <PastRoomsTable/>
            </div>
            <div className="tables">
            <h2>Banquets</h2>
            <PastBanquetsTable/>
            </div>
        </div>
        )}
      </div>

      
    </div>
  );
};

export default Home;
