import React, { useContext, useState } from "react";
import { useHttpClient } from "../../hooks/http-hook";
import { AuthContext } from "../../context/auth-context";
import "./SearchBanquetForm.css";
import LoadingSpinner from "../UIElements/LoadingSpinner";
import ErrorModal from "../UIElements/ErrorModal";
import Modal from "../UIElements/Modal";
import Button from "../FormElements/Button";

function AvailableBanquetsTable() {
  const { token } = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [banquets, setBanquets] = useState([]);
  const [filters, setFilters] = useState({
    check_in_date: "",
    check_out_date: "",
    capacity: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanquet, setSelectedBanquet] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    email: "",
    occasion: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const fetchAvailableBanquets = async () => {
    try {
      const responseData = await sendRequest(
        "http://localhost:5000/staffportal/available/banquets",
        "POST",
        JSON.stringify(filters),
        { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      setBanquets(responseData.banquets);
    } catch (err) { }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAvailableBanquets();
  };

  const openBookingModal = (banquet) => {
    setSelectedBanquet(banquet);
    setIsModalOpen(true);
    setBookingSuccess(false);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedBanquet(null);
    setBookingDetails({ email: "", occasion: "" });
  };

  const confirmBooking = async () => {
    try {
      await sendRequest(
        "http://localhost:5000/staffportal/book/banquet",
        "POST",
        JSON.stringify({
          hall_id: selectedBanquet.hall_id,
          email: bookingDetails.email,
          occasion: bookingDetails.occasion,
          check_in_date: filters.check_in_date,
          check_out_date: filters.check_out_date,
        }),
        { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      setBookingSuccess(true);
      setTimeout(() => {
        closeBookingModal();
      }, 2000);
    } catch (err) { }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <div className="filter-card">
        <form className="banquet-search-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="check_in_date">Check-in Date</label>
            <input
              type="date"
              id="check_in_date"
              name="check_in_date"
              value={filters.check_in_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="check_out_date">Check-out Date</label>
            <input
              type="date"
              id="check_out_date"
              name="check_out_date"
              value={filters.check_out_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="capacity">Minimum Capacity</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={filters.capacity}
              onChange={handleInputChange}
              required
            />
          </div>
          <button className="submit-button" type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {isLoading && <LoadingSpinner asOverlay />}
      <div className="banquet-search-table">
        {banquets.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>BANQUET HALL NUMBER</th>
                <th>CAPACITY</th>
                <th>PRICE PER HOUR</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {banquets.map((banquet) => (
                <tr key={banquet.hall_id}>
                  <td>{banquet.hall_id}</td>
                  <td>{banquet.capacity}</td>
                  <td>{banquet.price_per_hour}</td>
                  <td>
                    <button onClick={() => openBookingModal(banquet)}>
                      Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !isLoading && <p>No available banquet halls found.</p>
        )}
      </div>

      {isModalOpen && (
        <Modal
          show={isModalOpen}
          onCancel={closeBookingModal}
          header="Confirm Booking"
          footer={
            <>
              <Button danger onClick={closeBookingModal}>Cancel</Button>
              <Button onClick={confirmBooking} disabled={isLoading}>
                Confirm
              </Button>
            </>
          }
        >
          <div className="modal-inputs">

            <div>
              <label htmlFor="email">Guest Email: </label>
              <input
                type="email"
                id="email"
                name="email"
                value={bookingDetails.email}
                onChange={handleBookingInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="occasion">Occasion: </label>
              <input
                type="text"
                id="occasion"
                name="occasion"
                value={bookingDetails.occasion}
                onChange={handleBookingInputChange}
              />
            </div>
          </div>
          {bookingSuccess && <p className="success-message">Room booked successfully!</p>}
        </Modal>
      )}
    </>
  );
}

export default AvailableBanquetsTable;
