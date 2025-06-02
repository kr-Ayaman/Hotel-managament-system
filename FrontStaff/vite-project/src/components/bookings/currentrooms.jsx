import React, { useState, useEffect, useContext } from "react";
import "./currentrooms.css";
import QRCode from "qrcode";
import { useHistory, useLocation } from "react-router-dom"; 
import { AuthContext } from "../../context/auth-context"; 
import { useHttpClient } from "../../hooks/http-hook";

function CurrentRoomsTable() {
  const [rooms, setRooms] = useState([]);
  const { token } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [paymentReceived, setPaymentReceived] = useState(false);
  
  // Search States for each column
  const [bookingIdSearch, setBookingIdSearch] = useState("");
  const [guestIdSearch, setGuestIdSearch] = useState("");
  const [roomNoSearch, setRoomNoSearch] = useState("");
  const [bookedFromSearch, setBookedFromSearch] = useState("");
  const [bookedUptoSearch, setBookedUptoSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory(); 
  const location = useLocation(); 

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/staffportal/cur-booking/rooms",
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        setRooms(
          responseData.result.map((room) => ({
            bookingid: room.booking_id,
            guestid: room.guest_id,
            roomno: room.room_id,
            bookedfrom: room.check_in_date,
            bookedupto: room.check_out_date,
            phone: room.phone_number,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchRooms();
  }, [sendRequest, token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingid = params.get("bookingid");

    if (bookingid) {
      setPaymentReceived(true);
    }
  }, [location]);

  const generateQRCode = (bookingid) => {
    const url = `https://yourwebsite.com/confirm-payment?bookingid=${bookingid}`;
    QRCode.toDataURL(url, { width: 256, margin: 2 }, (err, url) => {
      if (err) {
        console.error("Error generating QR code:", err);
      } else {
        setQrCodeDataUrl(url);
      }
    });
  };

  // Filtering the rooms based on search inputs
  const filteredRooms = rooms.filter((room) => {
    return (
      room.bookingid.toString().toLowerCase().includes(bookingIdSearch.toLowerCase()) &&
      room.guestid.toString().toLowerCase().includes(guestIdSearch.toLowerCase()) &&
      room.roomno.toString().toLowerCase().includes(roomNoSearch.toLowerCase()) &&
      room.bookedfrom.toLowerCase().includes(bookedFromSearch.toLowerCase()) &&
      room.bookedupto.toLowerCase().includes(bookedUptoSearch.toLowerCase()) &&
      room.phone.toLowerCase().includes(phoneSearch.toLowerCase())
    );
  });

  const handleCheckout = (room) => {
    setSelectedRoom(room);
    generateQRCode(room.bookingid);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoom(null);
    setQrCodeDataUrl(null);
  };

  return (
    <div className="room-search-table">
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && (
        <>
          <table>
            <thead>
              <tr>
                {/* Table headers */}
                {["room booking id", "guest id", "room number", "booked from", "booked upto", "phone number"].map((col) => (
                  <th key={col}>{col.toUpperCase()}</th>
                ))}
                <th>ACTION</th>
              </tr>
              {/* Filter row */}
              <tr>
                <th>
                  <input
                    type="text"
                    placeholder="Search by Booking ID"
                    value={bookingIdSearch}
                    onChange={(e) => setBookingIdSearch(e.target.value)}
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search by Guest ID"
                    value={guestIdSearch}
                    onChange={(e) => setGuestIdSearch(e.target.value)}
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search by Room Number"
                    value={roomNoSearch}
                    onChange={(e) => setRoomNoSearch(e.target.value)}
                  />
                </th>
                <th>
                  <input
                    type="date"
                    placeholder="Search by Booked From"
                    value={bookedFromSearch}
                    onChange={(e) => setBookedFromSearch(e.target.value)}
                  />
                </th>
                <th>
                  <input
                    type="date"
                    placeholder="Search by Booked Upto"
                    value={bookedUptoSearch}
                    onChange={(e) => setBookedUptoSearch(e.target.value)}
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Search by Phone"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                  />
                </th>
                <th></th> {/* Empty cell for the Action column */}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.bookingid}>
                  <td>{room.bookingid}</td>
                  <td>{room.guestid}</td>
                  <td>{room.roomno}</td>
                  <td>{room.bookedfrom.split("T")[0]}</td>
                  <td>{room.bookedupto.split("T")[0]}</td>
                  <td>{room.phone}</td>
                  <td>
                    <button onClick={() => handleCheckout(room)}>Checkout</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {modalOpen && selectedRoom && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-modal" onClick={handleCloseModal}>
                  X
                </button>
                <h3>Scan the QR Code to Confirm Payment</h3>
                {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt="QR Code" width="256" height="256" /> : <p>Loading QR code...</p>}
              </div>
            </div>
          )}

          {paymentReceived && !modalOpen && (
            <div className="payment-confirmation">
              <h3>Payment Received</h3>
              <p>Thank you for your payment! The booking has been completed.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CurrentRoomsTable;
