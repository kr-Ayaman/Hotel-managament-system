import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { useForm } from "../hooks/form-hook"; 
import { useHttpClient } from "../hooks/http-hook"; 
import ErrorModal from "../components/UIElements/ErrorModal"; 
import { AuthContext } from "../context/auth-context";
import Input from "../components/FormElements/Input"; 
import Select from "../components/FormElements/Select"; 
import { VALIDATOR_REQUIRE } from "../util/validators";
import "./Booking.css"; // Updated CSS import

const Booking = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [price, setPrice] = useState(null);
  const [gstPrice, setGstPrice] = useState(null);
  const { guestId, token } = useContext(AuthContext);
  const [submitted, setsubmitted] = useState(false)
  const [formState, inputHandler, setFormData] = useForm(
    {
      bookingType: { value: "room", isValid: true },
      check_in_date: { value: "", isValid: false },
      check_out_date: { value: "", isValid: false } 
    },
    false
  );

  useEffect(() => {
    // Reset formState when the bookingType changes
    if (formState.inputs.bookingType.value === "room") {
      setFormData(
        {
          ...formState.inputs,
          room_type: { value: "", isValid: false },
          capacity: undefined,
          occasion: undefined,
        },
        false
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          room_type: undefined,
          capacity: { value: "", isValid: false },
          occasion: { value: "", isValid: true },
        },
        false
      );
    }
  }, [formState.inputs.bookingType.value, setFormData]);

  useEffect(() => {
    if (!formState.isValid) {
      setPrice(null);
      return;
    }

    const fetchPrice = async () => {
      let data;
    if (formState.inputs.bookingType.value === "room") {
      data = {
        bookingType: formState.inputs.bookingType.value,
        room_type: formState.inputs.room_type.value,
        check_in_date: formState.inputs.check_in_date.value,
        check_out_date: formState.inputs.check_out_date.value,
      };
    } else if (formState.inputs.bookingType.value === "banquet") {
      data = {
        bookingType: formState.inputs.bookingType.value,
        capacity: formState.inputs.capacity.value,
        occasion: formState.inputs.occasion.value,
        check_in_date: formState.inputs.check_in_date.value,
        check_out_date: formState.inputs.check_out_date.value,
      };
    }

      try {
        const responseData = await sendRequest(
          "http://localhost:5000/guestportal/getprice",
          "POST",
          JSON.stringify(data),
          { "Content-Type": "application/json" }
        );
        const basePrice = parseFloat(responseData.price);
        const calculatedPrice = basePrice + basePrice * 0.18; 
        setPrice(basePrice);
        setGstPrice(calculatedPrice);
      } catch (err) {
      }
    };

    fetchPrice();
  }, [formState.isValid, sendRequest, formState.inputs]);

  const handleBooking = async () => {
    try {
      let data;
    if (formState.inputs.bookingType.value === "room") {
      data = {
        bookingType: formState.inputs.bookingType.value,
        room_type: formState.inputs.room_type.value,
        check_in_date: formState.inputs.check_in_date.value,
        check_out_date: formState.inputs.check_out_date.value,
      };
    } else if (formState.inputs.bookingType.value === "banquet") {
      data = {
        bookingType: formState.inputs.bookingType.value,
        capacity: formState.inputs.capacity.value,
        occasion: formState.inputs.occasion.value,
        check_in_date: formState.inputs.check_in_date.value,
        check_out_date: formState.inputs.check_out_date.value,
      };
    }
      let prefix;
      if(formState.inputs.bookingType.value === "room"){
        prefix="room"
      }
      else{
        prefix="hall"
      }
      const responseData = await sendRequest(
        `http://localhost:5000/guestportal/${prefix}-booking/${guestId}`,
        "POST",
        JSON.stringify(data),
        { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      const basePrice = parseFloat(responseData.price);
      const calculatedPrice = basePrice + basePrice * 0.18; 
      setsubmitted(true)
    } catch (err) {
    }
    
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <div className="booking-form-container">
        <h2>Book Your Stay</h2>
        {submitted && <p className="submittted">Booking Completed</p>}
        {isLoading && <p>Loading...</p>}
        <div className="booking-type-options">
          <label>
            <input
              type="radio"
              name="bookingType"
              value="room"
              checked={formState.inputs.bookingType.value === "room"}
              onChange={(e) =>
                inputHandler("bookingType", e.target.value, true)
              }
            />
            Room
          </label>
          <label>
            <input
              type="radio"
              name="bookingType"
              value="banquet"
              checked={formState.inputs.bookingType.value === "banquet"}
              onChange={(e) =>
                inputHandler("bookingType", e.target.value, true)
              }
            />
            Banquet Hall
          </label>
        </div>

        {formState.inputs.bookingType.value === "room" && (
          <Select
            id="room_type"
            label="Select Room Type"
            options={[
              { value: "", label: "--Select--" },
              { value: "Single", label: "Single" },
              { value: "Double", label: "Double" },
              { value: "Large", label: "Large" },
            ]}
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please select a valid room type."
            onInput={inputHandler}
          />
        )}

        {formState.inputs.bookingType.value === "banquet" && (
          <>
            <Select
              id="capacity"
              label="Select Banquet Capacity"
              options={[
                { value: "", label: "--Select--" },
                { value: "200", label: "200" },
                { value: "250", label: "250" },
                { value: "300", label: "300" },
                { value: "350", label: "350" },
              ]}
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please select a valid banquet capacity."
              onInput={inputHandler}
            />
            <Input
              id="occasion"
              element="input"
              validators={[]}
              type="text"
              label="Occasion"
              onInput={inputHandler}
            />
          </>
        )}

        <Input
          id="check_in_date"
          element="input"
          type="date"
          label="Check-In Date"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid check-in date."
          onInput={inputHandler}
        />
        <Input
          id="check_out_date"
          element="input"
          type="date"
          label="Check-Out Date"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid check-out date."
          onInput={inputHandler}
        />

        {price && (
          <div className="price-summary">
            <p>Base Price: ₹{price.toFixed(2)}</p>
            <p>Total Price (with 18% GST): ₹{gstPrice.toFixed(2)}</p>
            <button onClick={handleBooking}>Confirm Booking</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Booking;
