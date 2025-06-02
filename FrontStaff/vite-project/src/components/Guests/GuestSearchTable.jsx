import React, { useState, useEffect, useContext } from "react";
import { useHttpClient } from "../../hooks/http-hook"; 
import { useHistory } from "react-router-dom"; // Import useHistory
import ErrorModal from "../UIElements/ErrorModal"; 
import { AuthContext } from "../../context/auth-context";
import "./GuestSearchTable.css";

function GuestSearchTable() {
  const { token } = useContext(AuthContext);
  const [guests, setGuests] = useState([]);
  const { sendRequest, error, clearError } = useHttpClient();
  const history = useHistory(); // Initialize history hook

  // States for each filter column
  const [filters, setFilters] = useState({
    guest_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const responseData = await sendRequest("http://localhost:5000/staffportal/guest/get", "GET", null, {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        });
        setGuests(responseData.result);
      } catch (err) {
        console.error("Error fetching guests:", err);
      }
    };

    fetchGuests();
  }, [sendRequest, token]);

  // Handle filter changes
  const handleFilterChange = (column, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: value.toLowerCase(),
    }));
  };

  // Handle navigation to guest profile
  const handleViewProfile = (guestId) => {
    history.push(`/guest/${guestId}`); // Navigate to the guest profile route
  };

  // Filter guests based on individual column filters
  const filteredGuests = guests.filter((guest) => {
    const name = `${guest.first_name} ${guest.last_name}`.toLowerCase();
    return (
      (filters.guest_id === "" || guest.guest_id.toString().includes(filters.guest_id)) &&
      (filters.name === "" || name.includes(filters.name)) &&
      (filters.email === "" || guest.email.toLowerCase().includes(filters.email)) &&
      (filters.phone === "" || guest.phone_number.toLowerCase().includes(filters.phone)) &&
      (filters.address === "" || guest.address.toLowerCase().includes(filters.address))
    );
  });

  return (
    <div className="guest-search-table">
      <ErrorModal error={error} onClear={clearError} />

      <table>
        <thead>
          <tr>
            {["guest id", "name", "email", "phone", "address"].map((col) => (
              <th key={col}>
                {col.toUpperCase()}
                <input
                  type="text"
                  placeholder={`Search ${col}`}
                  value={filters[col]} // Bind input value to corresponding filter state
                  onChange={(e) => handleFilterChange(col, e.target.value)}
                />
              </th>
            ))}
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {filteredGuests.length === 0 ? (
            <tr>
              <td colSpan="6">No guests found.</td>
            </tr>
          ) : (
            filteredGuests.map((guest) => (
              <tr key={guest.guest_id}>
                <td>{guest.guest_id}</td>
                <td>{guest.first_name} {guest.last_name}</td>
                <td>{guest.email}</td>
                <td>{guest.phone_number}</td>
                <td>{guest.address}</td>
                <td>
                  <button onClick={() => handleViewProfile(guest.guest_id)}>View Profile</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GuestSearchTable;
