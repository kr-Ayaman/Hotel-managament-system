import React, { useContext, useState } from "react";
import { useHttpClient } from "../../hooks/http-hook";
import { AuthContext } from "../../context/auth-context";
import "./SearchRoomForm.css";
import LoadingSpinner from "../UIElements/LoadingSpinner";
import ErrorModal from "../UIElements/ErrorModal";
import Modal from "../UIElements/Modal";

const SearchRoomForm = () => {
  const { token } = useContext(AuthContext);
  const [room, setRoom] = useState({
    bookfrom: "",
    bookupto: "",
    roomTypes: {
      Single: false,
      Double: false,
      Large: false,
    },
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false); 
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setRoom((prevRoom) => ({
        ...prevRoom,
        roomTypes: {
          ...prevRoom.roomTypes,
          [name]: checked,
        },
      }));
    } else {
      setRoom({ ...room, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const roomFilters = Object.keys(room.roomTypes).filter(
      (type) => room.roomTypes[type]
    );

    const payload = {
      check_in_date: room.bookfrom,
      check_out_date: room.bookupto,
      room_types: roomFilters,
    };

    try {
      const responseData = await sendRequest(
        "http://localhost:5000/staffportal/available/rooms",
        "POST",
        JSON.stringify(payload),
        { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      setAvailableRooms(responseData.rooms);
    } catch (err) {}
  };

  const openBookingModal = (roomId) => {
    setSelectedRoomId(roomId);
    setBookingModalOpen(true);
    setBookingSuccess(false); 
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setGuestEmail("");
  };

  const handleBooking = async () => {
    try {
      await sendRequest(
        "http://localhost:5000/staffportal/book/room",
        "POST",
        JSON.stringify({
          email: guestEmail,
          room_id: selectedRoomId,
          check_in_date: room.bookfrom,
          check_out_date: room.bookupto,
        }),
        { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      setBookingSuccess(true); 
      setTimeout(() => {
        closeBookingModal();
      }, 2000); 
      
    } catch (err) {
    }
  };

  return (
    <>
      <form className="search-room-form" onSubmit={handleSubmit}>
        <ErrorModal error={error} onClear={clearError} />
        <div>
          <label htmlFor="bookfrom">Book From</label>
          <input
            type="date"
            id="bookfrom"
            name="bookfrom"
            value={room.bookfrom}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="bookupto">Book Upto</label>
          <input
            type="date"
            id="bookupto"
            name="bookupto"
            value={room.bookupto}
            onChange={handleChange}
            required
          />
        </div>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="Single"
              checked={room.roomTypes.Single}
              onChange={handleChange}
            />
            Single Room
          </label>
          <label>
            <input
              type="checkbox"
              name="Double"
              checked={room.roomTypes.Double}
              onChange={handleChange}
            />
            Double Room
          </label>
          <label>
            <input
              type="checkbox"
              name="Large"
              checked={room.roomTypes.Large}
              onChange={handleChange}
            />
            Large Room
          </label>
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Filtering..." : "Filter"}
        </button>
      </form>

      <div className="available-rooms">
        {isLoading && <LoadingSpinner asOverlay />}
        {!isLoading && availableRooms.length > 0 && (
          <table className="room-table">
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Price per Night</th>
                <th>Room Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {availableRooms.map((room) => (
                <tr key={room.room_id}>
                  <td>{room.room_id}</td>
                  <td>{room.price_per_night}</td>
                  <td>{room.room_type}</td>
                  <td>
                    <button onClick={() => openBookingModal(room.room_id)}>
                      Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && availableRooms.length === 0 && !error && (
          <p>No available rooms found</p>
        )}
      </div>

      <Modal
        show={isBookingModalOpen}
        onCancel={closeBookingModal}
        header="Enter Guest Email "
        footer={
          <button className="submit-button" onClick={handleBooking}>
            Confirm Booking
          </button>
        }
      >
        <div className="modal-inputs">
          <label htmlFor="guestEmail">Guest Email: </label>
          <input
            type="email"
            id="guestEmail"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
          />
        </div>

        {bookingSuccess && <p className="success-message">Room booked successfully!</p>} 
      </Modal>
    </>
  );
};

export default SearchRoomForm;
