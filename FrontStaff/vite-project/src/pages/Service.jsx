import React, { useState, useEffect, useContext } from "react";
import { useHttpClient } from "../hooks/http-hook";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { AuthContext } from "../context/auth-context";
import { useForm } from "../hooks/form-hook";
import Input from "../components/FormElements/Input";
import ErrorModal from "../components/UIElements/ErrorModal";
import "./Service.css";
import LoadingSpinner from "../components/UIElements/LoadingSpinner";

const Service = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { bookingType, bookingId } = useParams();
  const { token } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [formState, inputHandler] = useForm(
    {
      name: { value: "", isValid: true },
      description: { value: "", isValid: true },
      maxPrice: { value: "", isValid: true },
    },
    true
  );
  const [bookingMessage, setBookingMessage] = useState(null); // New state for booking message

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/guestportal/getservices",
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        setServices(responseData.result);
        setFilteredServices(responseData.result);
      } catch (err) {}
    };

    fetchServices();
  }, [sendRequest, token]);

  const filterServices = () => {
    const nameFilter = formState.inputs.name.value.toLowerCase();
    const descriptionFilter =
      formState.inputs.description.value.toLowerCase();
    const maxPriceFilter = formState.inputs.maxPrice.value;

    const filtered = services.filter((service) => {
      const matchesName =
        !nameFilter || service.service_name.toLowerCase().includes(nameFilter);
      const matchesDescription =
        !descriptionFilter ||
        service.description.toLowerCase().includes(descriptionFilter);
      const matchesMaxPrice =
        !maxPriceFilter || service.services_price <= +maxPriceFilter;

      return matchesName && matchesDescription && matchesMaxPrice;
    });

    setFilteredServices(filtered);
  };

  useEffect(() => {
    filterServices();
  }, [formState]);

  const handleBookService = async (serviceId, serviceName) => {
    try {
      const responseData = await sendRequest(
        `http://localhost:5000/guestportal/${bookingType}-booking/${bookingId}/request-service`,
        "POST",
        JSON.stringify({
          service_name: serviceName,
        }),
        {
            Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );
      setBookingMessage(`Successfully booked ${serviceName}!`);
    } catch (err) {
      setBookingMessage("Error booking the service. Please try again.");
    }
  };
  if(isLoading){
    return ( <LoadingSpinner />)
  }
  return (
    <div className="service-page">
      <ErrorModal error={error} onClear={clearError} />
      <h2>Services</h2>
      <div className="filter-controls">
        <Input
          id="name"
          element="input"
          type="text"
          placeholder="Search by Name"
          validators={[]}
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="input"
          type="text"
          placeholder="Search by Description"
          validators={[]}
          onInput={inputHandler}
        />
        <Input
          id="maxPrice"
          element="input"
          type="number"
          placeholder="Filter by Max Price"
          validators={[]}
          onInput={inputHandler}
        />
      </div>
      {bookingMessage && <p className="booking-message">{bookingMessage}</p>}
      {!isLoading && filteredServices.length > 0 && (
        <table className="services-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Book</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service, index) => (
              <tr key={index}>
                <td>{service.service_name}</td>
                <td>{service.description}</td>
                <td>{service.services_price}</td>
                <td>
                  <button
                    onClick={() =>
                      handleBookService(service.id, service.service_name)
                    }
                  >
                    Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!isLoading && filteredServices.length === 0 && (
        <p>No services found matching the filters.</p>
      )}
      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default Service;
