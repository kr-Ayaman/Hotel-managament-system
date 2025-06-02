import React from 'react';
import { useHistory } from 'react-router-dom';
import './BookingCard.css';

const BookingCard = ({ 
  bookingType, 
  bookingId, 
  roomNumber, 
  roomType, 
  hallCapacity, 
  checkIn, 
  checkOut,
  occasion
}) => {
  const history = useHistory();
  const isPastCheckOut = new Date(checkOut) < new Date();
  const isBeforeCheckIn = new Date(checkIn) > new Date();
  const prefix = bookingType === 'Room' ? 'room' : 'hall';
  const formattedCheckIn = new Date(checkIn).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const formattedCheckOut = new Date(checkOut).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const handleRedirect = (e) => {
    if (e.target.tagName !== 'BUTTON') {
      history.push(`/${prefix}/${bookingId}/invoice`);
    }
  };

  const handleFeedback = (e) => {
    e.stopPropagation();
    history.push(`/${prefix}/${bookingId}/feedback`);
  };

  const handleAskService = (e) => {
    e.stopPropagation();
    history.push(`/${prefix}/${bookingId}/service`);
  };

  const handleOrderFood = (e) => {
    e.stopPropagation();
    history.push(`/${prefix}/${bookingId}/order`);
  };

  return (
    <div className="booking-card" onClick={handleRedirect}>
      <div className="details">
        <p><strong>{bookingType} booking ID:</strong> {bookingId}</p>
        {bookingType === 'Room' && (
          <>
            <p><strong>Room No:</strong> {roomNumber}</p>
            <p><strong>Room Type:</strong> {roomType}</p>
          </>
        )}
        {bookingType === 'Hall' && (
          <>
          <p><strong>Hall No:</strong> {roomNumber}</p>
          <p><strong>Capacity:</strong> {hallCapacity}</p>
          <p><strong>Occasion:</strong> {occasion}</p>
          </>
        )}
        <p><strong>Check-In:</strong> {formattedCheckIn}</p>
        <p><strong>Check-Out:</strong> {formattedCheckOut}</p>
      </div>
      <div className="links">
        {isPastCheckOut ? (
          <button onClick={handleFeedback}>Give Feedback</button>
        ) : (
          <>
            {!isBeforeCheckIn &&
              <>
              <button onClick={handleAskService}>Ask Service</button>
              <button onClick={handleOrderFood}>Order Food</button>
              </>
            }
          </>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
