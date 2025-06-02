import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import BookingCard from '../components/UIElements/BookingCard';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import './ProfileGuest.css';
import ErrorModal from '../components/UIElements/ErrorModal';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';

const ProfileGuest = () => {
  const {guestId} = useParams()
  const {token} = useContext(AuthContext)
  const { isLoading, sendRequest, error, clearError } = useHttpClient();
  const [currentBookings, setCurrentBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [profileData, setProfileData] = useState(null);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await sendRequest(
          `http://localhost:5000/guestportal/${guestId}`,
          'GET',
          null,
          { Authorization: `Bearer ${token}` }
        );
        setProfileData(profileResponse.guestData[0]);

        const bookingResponse = await sendRequest(
          `http://localhost:5000/guestportal/bookings/${guestId}`,
          'GET',
          null,
          { Authorization: `Bearer ${token}` }
        );

        const today = new Date();
        const current = [];
        const past = [];

        bookingResponse.roomBookings.forEach((booking) => {
          const checkOutDate = new Date(booking.check_out_date);
          if (checkOutDate >= today) {
            current.push({ ...booking, bookingType: 'Room' });
          } else {
            past.push({ ...booking, bookingType: 'Room' });
          }
        });

        bookingResponse.banquetBookings.forEach((booking) => {
          const checkOutDate = new Date(booking.check_out_date);
          if (checkOutDate >= today) {
            current.push({ ...booking, bookingType: 'Hall' });
          } else {
            past.push({ ...booking, bookingType: 'Hall' });
          }
        });

        setCurrentBookings(current);
        setPastBookings(past);
      } catch (err) {}
    };

    fetchProfileData();
  }, [sendRequest, guestId, token]);

  if (isLoading) {
    return <LoadingSpinner asOverlay />;
  }

  return (

      <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
    <div className="profile-container">
      <div className="profile-header">
        <h2>Customer Profile</h2>
        {profileData && (
          <div className="profile-details">
            <p><strong>Name:</strong> {profileData.first_name} {profileData.last_name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Phone:</strong> {profileData.phone_number}</p>
            <p><strong>Address:</strong> {profileData.address}</p>
          </div>
        )}
      </div>
        <div className="booking-section">
          <h3>Current Bookings</h3>
          {currentBookings.length > 0 ? (
            currentBookings.map((booking) => (
              <BookingCard
                key={`${booking.bookingType}-${booking.booking_id||booking.hall_booking_id}`}
                bookingType={booking.bookingType}
                bookingId={booking.booking_id||booking.hall_booking_id}
                roomNumber={booking.room_id||booking.hall_id}
                roomType={booking.room_type}
                hallCapacity={booking.capacity}
                checkIn={booking.check_in_date}
                checkOut={booking.check_out_date}
                occasion={booking.occasion}
              />
            ))
          ) : (
            <p>No current bookings</p>
          )}
        </div>

        <div className="booking-section">
          <h3>Past Bookings</h3>
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard
                key={`${booking.bookingType}-${booking.booking_id||booking.hall_booking_id}`}
                bookingType={booking.bookingType}
                bookingId={booking.booking_id||booking.hall_booking_id}
                roomNumber={booking.room_id||booking.hall_id}
                roomType={booking.room_type}
                hallCapacity={booking.capacity}
                checkIn={booking.check_in_date}
                checkOut={booking.check_out_date}
                occasion={booking.occasion}
              />
            ))
          ) : (
            <p>No past bookings</p>
          )}
        </div>
    </div>
      </React.Fragment>
  );
};

export default ProfileGuest;
