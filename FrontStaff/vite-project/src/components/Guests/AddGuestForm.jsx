import React, { useState, useContext } from "react";
import { useHttpClient } from "../../hooks/http-hook";
import ErrorModal from "../UIElements/ErrorModal";
import { AuthContext } from "../../context/auth-context"; 
import "./AddGuestForm.css";
import LoadingSpinner from "../UIElements/LoadingSpinner";
const AddGuestForm = () => {
  const [guest, setGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [otp, setOtp] = useState(""); // Stores the OTP entered by the user
  const [step, setStep] = useState("details"); // Tracks the current step: "details" or "otp"
  const [successMessage, setSuccessMessage] = useState("");
  const { sendRequest, error, clearError, isLoading } = useHttpClient();
  const { token } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuest({ ...guest, [name]: value });
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();

    const guestData = {
      first_name: guest.firstName,
      last_name: guest.lastName,
      email: guest.email,
      phone_number: guest.phoneNumber,
      address: guest.address,
    };

    try {
      await sendRequest(
        "http://localhost:5000/staffportal/guest/add",
        "POST",
        JSON.stringify(guestData),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setStep("otp"); // Move to OTP verification step
    } catch (err) {
      console.error("Error adding guest:", err);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      await sendRequest(
        "http://localhost:5000/guestportal/verify-otp",
        "POST",
        JSON.stringify({ email: guest.email, otp }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      setSuccessMessage("Guest successfully registered!");
      setStep("details"); 
      setGuest({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
      });
      setOtp("");
      window.location.reload()
    } catch (err) {
      console.error("Error verifying OTP:", err);
    }
  };

  return (
    <div className="add-guest-container">
    {isLoading && <LoadingSpinner asOverlay/>}
      <ErrorModal error={error} onClear={clearError} />

      {successMessage && <p className="success-message">{successMessage}</p>}

      {step === "details" ? (
        <form className="add-guest-form" onSubmit={handleSubmitDetails}>
          <div>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={guest.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={guest.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={guest.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="number"
              id="phoneNumber"
              name="phoneNumber"
              value={guest.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={guest.address}
              onChange={handleChange}
              placeholder="Enter address"
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      ) : (
        <form className="add-guest-form" onSubmit={handleVerifyOtp}>
          <p className="otp-message">
            OTP sent to <strong>{guest.email}</strong>. It will expire in 10 minutes.
          </p>
          <div>
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
};

export default AddGuestForm;
