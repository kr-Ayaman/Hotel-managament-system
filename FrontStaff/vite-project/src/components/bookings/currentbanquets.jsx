import React, { useState, useEffect, useContext } from "react";
import "./currentbanquets.css";
import QRCode from "qrcode";
import { useHistory, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { useHttpClient } from "../../hooks/http-hook";

function CurrentBanquetsTable() {
  const [banquets, setBanquets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanquet, setSelectedBanquet] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [paymentReceived, setPaymentReceived] = useState(false);

  // Search States
  const [bookingIdSearch, setBookingIdSearch] = useState("");
  const [guestIdSearch, setGuestIdSearch] = useState("");
  const [banquetNoSearch, setBanquetNoSearch] = useState("");
  const [bookedFromSearch, setBookedFromSearch] = useState("");
  const [bookedUptoSearch, setBookedUptoSearch] = useState("");
  const [occasionSearch, setOccasionSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");

  const { token } = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const history = useHistory();
  const location = useLocation();

  // Fetch Banquet Data
  useEffect(() => {
    const fetchBanquets = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/staffportal/cur-booking/banquets",
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        setBanquets(
          responseData.result.map((banquet) => ({
            bookingid: banquet.hall_booking_id,
            guestid: banquet.guest_id,
            banquetno: banquet.hall_id,
            bookedfrom: banquet.check_in_date,
            bookedupto: banquet.check_out_date,
            occasion: banquet.occasion,
            phone: banquet.phone_number,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchBanquets();
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

  // Filtering the banquets based on search inputs
  const filteredBanquets = banquets.filter((banquet) => {
    return (
      banquet.bookingid.toString().toLowerCase().includes(bookingIdSearch.toLowerCase()) &&
      banquet.guestid.toString().toLowerCase().includes(guestIdSearch.toLowerCase()) &&
      banquet.banquetno.toString().toLowerCase().includes(banquetNoSearch.toLowerCase()) &&
      banquet.bookedfrom.toLowerCase().includes(bookedFromSearch.toLowerCase()) &&
      banquet.bookedupto.toLowerCase().includes(bookedUptoSearch.toLowerCase()) &&
      banquet.occasion.toLowerCase().includes(occasionSearch.toLowerCase()) &&
      banquet.phone.toLowerCase().includes(phoneSearch.toLowerCase())
    );
  });

  const handleCheckout = (banquet) => {
    setSelectedBanquet(banquet);
    generateQRCode(banquet.bookingid);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBanquet(null);
    setQrCodeDataUrl(null);
  };

  return (
    <div className="banquet-search-table">
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && (
        <>
          <table>
            <thead>
              <tr>
                {/* Table Headers with Inputs for Search */}
                <th>
                  Booking ID
                  <input
                    type="text"
                    placeholder="Search by booking ID"
                    value={bookingIdSearch}
                    onChange={(e) => setBookingIdSearch(e.target.value)}
                  />
                </th>
                <th>
                  Guest ID
                  <input
                    type="text"
                    placeholder="Search by guest id"
                    value={guestIdSearch}
                    onChange={(e) => setGuestIdSearch(e.target.value)}
                  />
                </th>
                <th>
                  Banquet Number
                  <input
                    type="text"
                    placeholder="Search by banquet no"
                    value={banquetNoSearch}
                    onChange={(e) => setBanquetNoSearch(e.target.value)}
                  />
                </th>
                <th>
                  Booked From
                  <input
                    type="date"
                    value={bookedFromSearch}
                    onChange={(e) => setBookedFromSearch(e.target.value)}
                  />
                </th>
                <th>
                  Booked Upto
                  <input
                    type="date"
                    value={bookedUptoSearch}
                    onChange={(e) => setBookedUptoSearch(e.target.value)}
                  />
                </th>
                <th>
                  Occasion
                  <input
                    type="text"
                    placeholder="Search by occasion"
                    value={occasionSearch}
                    onChange={(e) => setOccasionSearch(e.target.value)}
                  />
                </th>
                <th>
                  Phone
                  <input
                    type="text"
                    placeholder="Search by phone"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                  />
                </th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanquets.map((banquet) => (
                <tr key={banquet.bookingid}>
                  <td>{banquet.bookingid}</td>
                  <td>{banquet.guestid}</td>
                  <td>{banquet.banquetno}</td>
                  <td>{banquet.bookedfrom.split("T")[0]}</td>
                  <td>{banquet.bookedupto.split("T")[0]}</td>
                  <td>{banquet.occasion}</td>
                  <td>{banquet.phone}</td>
                  <td>
                    <button onClick={() => handleCheckout(banquet)}>Checkout</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {modalOpen && selectedBanquet && (
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

export default CurrentBanquetsTable;
