import React, { useState, useEffect } from "react";
import { useHttpClient } from "../hooks/http-hook";
import { AuthContext } from "../context/auth-context";
import LoadingSpinner from "../components/UIElements/LoadingSpinner";
import { useContext } from "react";
import ErrorModal from "../components/UIElements/ErrorModal";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import './Order.css'; 
const Order = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { guestId, token } = useContext(AuthContext);
  const { bookingType, bookingId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [filters, setFilters] = useState({
    menu_item: "",
    price: "",
    veg_or_non_veg: "",
    category: "",
  });
  const [orderList, setOrderList] = useState({});
  const [submitted, setsubmitted] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const responseData = await sendRequest("http://localhost:5000/guestportal/getmenu");
        setMenuItems(responseData.result);
      } catch (err) {}
    };
    fetchMenuItems();
  }, [sendRequest]);

  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const handleQuantityChange = (menuItem, quantity) => {
    setOrderList((prevOrder) => {
      const updatedOrder = { ...prevOrder };
      if (quantity > 0) {
        updatedOrder[menuItem] = quantity;
      } else {
        delete updatedOrder[menuItem];
      }
      return updatedOrder;
    });
  };

  const handleOrderSubmit = async () => {
    const orderString = Object.entries(orderList)
      .map(([item, qty]) => `${qty}x ${item}`)
      .join(", ");
    try {
        if(token){
            await sendRequest(`http://localhost:5000/guestportal/${bookingType}-booking/${bookingId}/order-food`, "POST", JSON.stringify({ menu_items_ordered: orderString }), 
            { Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
            setOrderList({});
            setsubmitted(true)
        }
    } catch (err) {
      setsubmitted(true)
    }
  };

const filteredItems = menuItems.filter((item) => {
    const matchesMenuItem = item.menu_item.toLowerCase().includes(filters.menu_item.toLowerCase());
    
    const itemPrice = parseFloat(item.price); 
    const maxPrice = parseFloat(filters.price);
    
    const matchesPrice = filters.price ? itemPrice <= maxPrice : true;
    const matchesVeg = filters.veg_or_non_veg ? item.veg_or_non_veg === filters.veg_or_non_veg : true;
    const matchesCategory = item.category.toLowerCase().includes(filters.category.toLowerCase());
  
    return matchesMenuItem && matchesPrice && matchesVeg && matchesCategory;
  });
  if(isLoading){
    return ( <LoadingSpinner />)
  }
  return (
    <div className="Order">
        <ErrorModal error={error} onClear={clearError} />
      <h1>Order Page</h1>
      {submitted && <p className="submittted">Order submitted</p>}

      <div className="filters-row">
        <input
          type="text"
          name="menu_item"
          placeholder="Search Menu Item"
          value={filters.menu_item}
          onChange={handleFilterChange}
        />
        
        <input
          type="number"
          name="price"
          placeholder="Max Price"
          value={filters.price}
          onChange={handleFilterChange}
        />
        
        <select
          name="veg_or_non_veg"
          value={filters.veg_or_non_veg}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
        </select>
        
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={filters.category}
          onChange={handleFilterChange}
        />
      </div>

      {/* Menu Items Table */}
      <table>
        <thead>
          <tr>
            <th>Menu Item</th>
            <th>Price</th>
            <th>Veg/Non-Veg</th>
            <th>Category</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.menu_item}>
              <td>{item.menu_item}</td>
              <td>{item.price}</td>
              <td>{item.veg_or_non_veg}</td>
              <td>{item.category}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={orderList[item.menu_item] || ""}
                  onChange={(e) =>
                    handleQuantityChange(item.menu_item, parseInt(e.target.value, 10) || 0)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Submit Order */}
      <button onClick={handleOrderSubmit}>Submit Order</button>
    </div>
  );
};

export default Order;
