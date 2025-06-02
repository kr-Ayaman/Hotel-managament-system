import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './RoomCard.css';

const RoomCard = ({ image, price, details, room_title }) => {
  const [showDetails, setShowDetails] = useState(false);
  const history = useHistory();
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleBooking = () => {
    history.push('/booking');
  };

  return (
    <div className="room-card-wrapper">
      <div className="room-card">
        <img src={image} alt="Room" className="room-image" />
        <div className="room-content">
          <h2 className="room-title">{room_title}</h2>
          <div className="details-price-row">
            <button className="toggle-button" onClick={toggleDetails}>
              <span className="toggle-icon">{showDetails ? '-' : '+'}</span> View Details
            </button>
            <button className="room-price-button" onClick={handleBooking}>
              ₹{price} / night
            </button>
          </div>
          {showDetails && (<p className="room-details">{details.split('<br>').map((line, index) => (
        <p key={index}>{line}</p>
      ))}</p>)}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
