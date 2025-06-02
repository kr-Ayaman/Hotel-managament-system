import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useHttpClient } from '../hooks/http-hook';
import ErrorModal from '../components/UIElements/ErrorModal';
import { AuthContext } from '../context/auth-context';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import './Invoice.css';

const GST_RATE = 0.18; // 18% GST

const Invoice = () => {
  const { bookingType, bookingId } = useParams();
  const { token } = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [invoiceData, setInvoiceData] = useState(null);
  const SERVICE_GST_RATE = 0.18;
  const RESTAURANT_GST_RATE = 0.05;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint =
          bookingType === 'room'
            ? `http://localhost:5000/guestportal/room-booking/${bookingId}`
            : `http://localhost:5000/guestportal/hall-booking/${bookingId}`;
        const data = await sendRequest(endpoint, 'GET', null, {
          Authorization: `Bearer ${token}`,
        });
        setInvoiceData(data);
      } catch (err) { }
    };

    if (token) fetchData();
  }, [sendRequest, bookingType, bookingId, token]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const calculateGST = (amount, rate) => parseFloat((amount * rate).toFixed(2));
  return (
    <div className="invoice-container">
      <ErrorModal error={error} onClear={clearError} />
      <h1 className="invoice-heading">Invoice</h1>
      {invoiceData && (
        <>
          <h2 className="section-heading ">Booking Details</h2>
          <div className="section booking-details">
            {bookingType === 'room' ? (
              <>
                <p><b>{bookingType == "room" ? "Room" : "Banquet"}   Booking ID:</b> {invoiceData.booking[0].booking_id}</p>
                <p><b>Room No.:</b> {invoiceData.booking[0].room_id}</p>
                <p><b>Room Type:</b> {invoiceData.booking[0].room_type}</p>
                <p><b>Check-In:</b> {invoiceData.booking[0].check_in_date.split('T')[0]}</p>
                <p><b>Check-Out:</b> {invoiceData.booking[0].check_out_date.split('T')[0]}</p>
              </>
            ) : (
              <>
                <p><b>Booking ID:</b> {invoiceData.banquetBooking[0].hall_booking_id}</p>
                <p><b>Hall ID:</b> {invoiceData.banquetBooking[0].hall_id}</p>
                <p><b>Capacity:</b> {invoiceData.banquetBooking[0].capacity}</p>
                <p><b>Occasion:</b> {invoiceData.banquetBooking[0].occasion}</p>
                <p><b>Check-In:</b> {invoiceData.banquetBooking[0].check_in_date.split('T')[0]}</p>
                <p><b>Check-Out:</b> {invoiceData.banquetBooking[0].check_out_date.split('T')[0]}</p>
              </>
            )}
          </div>

          <div className="section">
            <h2 className="section-heading">Services Bill</h2>
            {invoiceData.orders && invoiceData.services.length > 0 ? (<table className="grid-table">
              <thead>
                <tr>
                  <th>Service ID</th>
                  <th>Service</th>
                  <th>Price</th>
                  <th>GST {SERVICE_GST_RATE * 100}%</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.services.map((service) => {
                  const price = parseInt(service.services_price, 10);
                  const gst = calculateGST(price, SERVICE_GST_RATE);
                  const total = price + gst;
                  return (
                    <tr key={service.service_id}>
                      <td>{service.service_id}</td>
                      <td>{service.service_name}</td>
                      <td>Rs {price}</td>
                      <td>Rs {gst}</td>
                      <td>Rs {total}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="4" className="highlight-total">Order Total</td>
                  <td className="highlight-total">Rs {invoiceData.payments[0].services_price}</td>
                </tr>
              </tbody>
            </table>) :  (
              <p>No service order found.</p>
            )}
          </div>

          <div className="section">
            <h2 className="section-heading">Restaurant Bill</h2>
            {invoiceData.orders && invoiceData.orders.length > 0 ? (
              invoiceData.orders.map((order) => (
                <div key={order.order_id}>
                  <h3 className='order-head'>Order ID: {order.order_id}</h3>
                  <table className="grid-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Item</th>
                        <th>Cost</th>
                        <th>Qty</th>
                        <th>GST {RESTAURANT_GST_RATE * 100}%</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => {
                        const cost = parseInt(item.price, 10);
                        const quantity = parseInt(item.quantity, 10);
                        const totalCost = cost * quantity;
                        const gst = calculateGST(totalCost, RESTAURANT_GST_RATE);
                        const total = totalCost + gst;
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.item}</td>
                            <td>Rs {cost}</td>
                            <td>{quantity}</td>
                            <td>Rs {gst}</td>
                            <td>Rs {total}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td colSpan="5" className='highlight-total'>Order Total</td>
                        <td className='highlight-total'>Rs {parseFloat(order.total_cost, 10)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p>No restaurant orders found.</p>
            )}
          </div>

          <div className="section">
            <h2 className="section-heading">Total Bill</h2>
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {bookingType === 'room' ? 'Room Charges' : 'Banquet Hall Rent'}
                  </td>
                  <td>
                    Rs{' '}
                    {bookingType === 'room'
                      ? parseInt(invoiceData.booking[0].total_room_amount, 10)
                      : parseInt(invoiceData.banquetBooking[0].total_banquet_hall_rent, 10)}
                  </td>
                </tr>
                <tr>
                  <td>Services Bill</td>
                  <td>Rs {invoiceData.payments[0].services_price}</td>
                </tr>
                <tr>
                  <td>Restaurant Bill</td>
                  <td>Rs {(invoiceData.payments[0].total_restaurant_cost)}</td>
                </tr>
                <tr>
                  <td className='highlight-total'>Total Payable Amount</td>
                  <td className='highlight-total'>Rs {parseInt(invoiceData.payments[0].total_amount, 10)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Invoice;
