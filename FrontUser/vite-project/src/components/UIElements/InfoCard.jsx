import React from 'react';
import './InfoCard.css';

const InfoCard = ({ image, heading, text }) => {
  return (
    <div className="card">
      <div className="image-container">
        <img src={image} alt="card" className="card-image" />
      </div>
      <h2 className="card-heading">{heading}</h2>
      <p className="card-text">{text}</p>
    </div>
  );
};

export default InfoCard;
