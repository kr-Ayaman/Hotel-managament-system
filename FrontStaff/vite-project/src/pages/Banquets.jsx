import React, { useState } from "react";
import "./Banquets.css";
import SearchBanquetForm from "../components/banquets/SearchBanquetForm";
import CurrentBanquetsTable from "../components/bookings/currentbanquets";
const Banquets = () => {
  const [showSearchBanquet, setShowSearchBanquet] = useState(false);
  const [showAvailableBanquet, setShowAvailableBanquet] = useState(false);

  return (
    <div className="banquets-container">
      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowSearchBanquet(!showSearchBanquet)}
        >
          <span className="toggle-icon">{showSearchBanquet ? "➖" : "➕"}</span>
          <h2>View Available Banquets</h2>
        </div>
        {showSearchBanquet && (
          <div className="section-content">
            <SearchBanquetForm />
          </div>
        )}
      </div>

      <div className="section">
        <div
          className="section-header"
          onClick={() => setShowAvailableBanquet(!showAvailableBanquet)}
        >
          <span className="toggle-icon">{showAvailableBanquet ? "➖" : "➕"}</span>
          <h2>View Booked Banquets</h2>
        </div>
        {showAvailableBanquet && (
          <div className="section-content">
            <CurrentBanquetsTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Banquets;
