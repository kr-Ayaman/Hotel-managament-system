import React from 'react';
import './Terms.css'; // Separate CSS file for styling

const Terms = () => {
  return (
    <div className="terms-container">
      <img 
        src="terms_logo_url.png" // Replace with the path to the Terms and Conditions image/logo
        alt="Terms and Conditions"
        className="terms-logo"
      />
      <p className="terms-intro">
        By accessing or using our website, making a reservation, or staying at our hotel, you agree to be bound by the following terms and
        conditions. Please read them carefully before using our website or making a reservation.
      </p>

      <div className="terms-section">
        <h3>1. Room Reservations</h3>
        <ul>
          <li>Reservations must be guaranteed with a valid credit card</li>
          <li>Cancellations or changes must be made at least 12 hours prior to arrival to avoid a penalty</li>
          <li>No-shows will be charged</li>
        </ul>
      </div>

      <div className="terms-section">
        <h3>2. Check-in and Check-out</h3>
        <ul>
          <li>Check-in time is 12 pm onwards</li>
          <li>Check-out time is till 12 pm</li>
          <li>Late check-out may be available upon request, subject to availability and additional fees</li>
        </ul>
      </div>

      <div className="terms-section">
        <h3>3. Payment and Cancellation Policies</h3>
        <ul>
          <li>Payment is due upon check-in</li>
          <li>We accept payment through UPI, net banking, credit card or debit card only</li>
          <li>Cancellations or changes may incur additional fees</li>
        </ul>
      </div>

      <div className="terms-section">
        <h3>4. Room Occupancy and Guest Policy</h3>
        <ul>
          <li>Maximum occupancy per room is two</li>
          <li>Additional guests may incur extra charges</li>
          <li>Children under 10 years of age stay free with accompanying adult</li>
        </ul>
      </div>

      <div className="terms-section">
        <h3>5. Liability and Indemnification</h3>
        <ul>
          <li>XYZ Hotel is not liable for any damages or losses, including but not limited to property damage, personal injury, or loss of belongings</li>
          <li>Guests indemnify and hold harmless XYZ A Hotel against any claims or damages</li>
        </ul>
      </div>
    </div>
  );
};

export default Terms;
