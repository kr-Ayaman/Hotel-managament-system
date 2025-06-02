import React, { useEffect, useState, useContext } from 'react';
import { useHttpClient } from '../hooks/http-hook'; // Custom hook for HTTP requests
import { AuthContext } from '../context/auth-context';
import './RestaurantOrders.css';
import ErrorModal from '../components/UIElements/ErrorModal';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';

const RestaurantOrders = () => {
  const { token } = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [notCompletedOrders, setNotCompletedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [filters, setFilters] = useState({
    roomNumber: '',
    hallNumber: '',
    menuItem: '',
    orderDate: '',
    minPrice: '', 
    maxPrice: '', 
  });


  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const responseData = await sendRequest(
          'http://localhost:5000/staffportal/getorders',
          'GET',
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        setNotCompletedOrders(responseData.notCompletedOrders || []);
        setCompletedOrders(responseData.completedOrders || []);
      } catch (err) {
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token, sendRequest]);

  // Mark order as complete
  const markAsComplete = async (orderId) => {
    try {
      await sendRequest(
        `http://localhost:5000/staffportal/${orderId}/complete`,
        'PATCH',
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      setNotCompletedOrders((prevOrders) =>
        prevOrders.filter((order) => order.order_id !== orderId)
      );

      const completedOrder = notCompletedOrders.find(
        (order) => order.order_id === orderId
      );

      if (completedOrder) {
        setCompletedOrders((prevOrders) => [
          ...prevOrders,
          { ...completedOrder, mark_as_complete: true },
        ]);
      }
    } catch (err) {
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };


  const filterOrders = (orders) => {
    return orders.filter((order) => {
      const matchesRoom = filters.roomNumber
        ? order.room_id && order.room_id.toString().includes(filters.roomNumber)
        : true;

      const matchesHall = filters.hallNumber
        ? order.hall_id && order.hall_id.toString().includes(filters.hallNumber)
        : true;

      const matchesMenu = filters.menuItem
        ? order.menu_items_ordered.toLowerCase().includes(filters.menuItem.toLowerCase())
        : true;
      let orderDate = new Date(order.order_date);
      orderDate.setHours(orderDate.getHours() + 5);
      orderDate.setMinutes(orderDate.getMinutes() + 30);
      const matchesDate = filters.orderDate
        ? orderDate.toISOString().split('T')[0] === filters.orderDate
        : true;

      const matchesPriceRange = filters.minPrice || filters.maxPrice
        ? order.total_restaurant_cost &&
        (!filters.minPrice || order.total_restaurant_cost >= parseFloat(filters.minPrice)) &&
        (!filters.maxPrice || order.total_restaurant_cost <= parseFloat(filters.maxPrice))
        : true;

      return matchesRoom && matchesHall && matchesMenu && matchesDate && matchesPriceRange;
    });
  };


  return (
    <div className="restaurant-orders-container">
      <ErrorModal error={error} onClear={clearError} />
      <h2>Restaurant Orders</h2>

      <div className="restaurant-orders-filters">
        <input
          type="text"
          name="roomNumber"
          placeholder="Filter by Room No."
          value={filters.roomNumber}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="hallNumber"
          placeholder="Filter by Hall No."
          value={filters.hallNumber}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="menuItem"
          placeholder="Filter by Menu Items"
          value={filters.menuItem}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="orderDate"
          value={filters.orderDate}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
      </div>

      {isLoading && <LoadingSpinner className="restaurant-orders-spinner" />}

      <h3>Not Completed Orders</h3>
      {notCompletedOrders.length === 0 ? (
        <p className="restaurant-orders-error">No not completed orders found.</p>
      ) : (
        <table className="restaurant-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Place</th>
              <th>Menu Items Ordered</th>
              <th>Order Date</th>
              <th>Restaurant Cost</th>
              <th>Total Restaurant Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterOrders(notCompletedOrders).map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.room_id ? `Room ${order.room_id}` : `Hall ${order.hall_id}`}</td>
                <td>{order.menu_items_ordered}</td>
                <td>{new Date(order.order_date).toLocaleString()}</td>
                <td>{order.restaurant_cost}</td>
                <td>{order.total_restaurant_cost}</td>
                <td>{order.mark_as_complete ? 'Completed' : 'Pending'}</td>
                <td>
                  {!order.mark_as_complete && (
                    <button
                      className="restaurant-orders-button"
                      onClick={() => markAsComplete(order.order_id)}
                    >
                      Mark as Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Completed Orders</h3>
      {completedOrders.length === 0 ? (
        <p className="restaurant-orders-error">No completed orders found.</p>
      ) : (
        <table className="restaurant-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Place</th>
              <th>Menu Items Ordered</th>
              <th>Order Date</th>
              <th>Restaurant Cost</th>
              <th>Total Restaurant Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filterOrders(completedOrders).map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.room_id ? `Room ${order.room_id}` : `Hall ${order.hall_id}`}</td>
                <td>{order.menu_items_ordered}</td>
                <td>{new Date(order.order_date).toLocaleString()}</td>
                <td>{order.restaurant_cost}</td>
                <td>{order.total_restaurant_cost}</td>
                <td>Completed</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RestaurantOrders;
