import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { useHttpClient } from "../hooks/http-hook";
import { AuthContext } from "../context/auth-context";
import LoadingSpinner from "../components/UIElements/LoadingSpinner";
import ErrorModal from "../components/UIElements/ErrorModal";
import { useForm } from "../hooks/form-hook";
import Input from "../components/FormElements/Input";
import Select from "../components/FormElements/Select";
import { VALIDATOR_REQUIRE } from "../util/validators";
import "./MenuItems.css";

const MenuItems = () => {
  const { token } = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [menuItems, setMenuItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editPriceItem, setEditPriceItem] = useState(null); // Track which item is being edited
  const [newPrice, setNewPrice] = useState("");

  const [filtersState, filterInputHandler] = useForm(
    {
      menu_item: { value: "", isValid: true },
      price: { value: "", isValid: true },
      veg_or_non_veg: { value: "", isValid: true },
      category: { value: "", isValid: true },
    },
    true
  );

  const [newItemState, newItemInputHandler, newItemFormIsValid] = useForm(
    {
      menu_item: { value: "", isValid: false },
      price: { value: "", isValid: false },
      veg_or_non_veg: { value: "", isValid: false },
      category: { value: "", isValid: false },
    },
    false
  );

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/guestportal/getmenu"
        );
        setMenuItems(responseData.result);
      } catch (err) {}
    };
    fetchMenuItems();
  }, [sendRequest]);

  const updatePrice = async (menu_item, newPrice) => {
    try {
      await sendRequest(
        "http://localhost:5000/staffportal/menu/price",
        "PATCH",
        JSON.stringify({ menu_item, price: newPrice }),
        { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.menu_item === menu_item ? { ...item, price: newPrice } : item
        )
      );
      setEditPriceItem(null); // Close the edit price input after saving
    } catch (err) {}
  };

  const cancelEditPrice = () => {
    setEditPriceItem(null); // Close the edit price input without saving
    setNewPrice(""); // Reset the new price input
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!newItemFormIsValid) return; // Only proceed if the form is valid

    try {
      const newItem = {
        menu_item: newItemState.inputs.menu_item.value,
        price: newItemState.inputs.price.value,
        veg_or_non_veg: newItemState.inputs.veg_or_non_veg.value,
        category: newItemState.inputs.category.value,
      };

      await sendRequest(
        "http://localhost:5000/staffportal/menu/additem",
        "POST",
        JSON.stringify(newItem),
        { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      setMenuItems((prevItems) => [...prevItems, newItem]);
      setShowAddForm(false); // Hide form after adding item
      // Reset form fields after adding
      newItemInputHandler("menu_item", "", false);
      newItemInputHandler("price", "", false);
      newItemInputHandler("veg_or_non_veg", "", false);
      newItemInputHandler("category", "", false);
    } catch (err) {}
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesMenuItem = item.menu_item
      .toLowerCase()
      .includes(filtersState.inputs.menu_item.value.toLowerCase());
    const itemPrice = parseFloat(item.price);
    const maxPrice = parseFloat(filtersState.inputs.price.value);
    const matchesPrice = filtersState.inputs.price.value
      ? itemPrice <= maxPrice
      : true;
    const matchesVeg = filtersState.inputs.veg_or_non_veg.value
      ? item.veg_or_non_veg === filtersState.inputs.veg_or_non_veg.value
      : true;
    const matchesCategory = item.category
      .toLowerCase()
      .includes(filtersState.inputs.category.value.toLowerCase());
    return matchesMenuItem && matchesPrice && matchesVeg && matchesCategory;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="MenuItems">
      <ErrorModal error={error} onClear={clearError} />
      <div className="Orders">
        <h1>Menu Items</h1>
        <div className="filters-row">
          <Input
            id="menu_item"
            element="input"
            type="text"
            placeholder="Search Menu Item"
            validators={[]}
            onInput={filterInputHandler}
            value={filtersState.inputs.menu_item.value}
          />
          <Input
            id="price"
            element="input"
            type="number"
            placeholder="Max Price"
            validators={[]}
            onInput={filterInputHandler}
            value={filtersState.inputs.price.value}
          />
          <Select
            id="veg_or_non_veg"
            validators={[]}
            onInput={filterInputHandler}
            options={[
              { value: "", label: "All" },
              { value: "Veg", label: "Veg" },
              { value: "Non-Veg", label: "Non-Veg" },
            ]}
            initialValue={filtersState.inputs.veg_or_non_veg.value}
          />
          <Input
            id="category"
            element="input"
            type="text"
            placeholder="Category"
            validators={[]}
            onInput={filterInputHandler}
            value={filtersState.inputs.category.value}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Menu Item</th>
              <th>Price</th>
              <th>Veg/Non-Veg</th>
              <th>Category</th>
              <th>Change Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.menu_item}>
                <td>{item.menu_item}</td>
                <td>
                  {editPriceItem === item.menu_item ? (
                    <>
                      <input
                        className="price-input"
                        type="number"
                        defaultValue={newPrice || item.price}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </>
                  ) : (
                    <span>{item.price}</span>
                  )}
                </td>
                <td>{item.veg_or_non_veg}</td>
                <td>{item.category}</td>
                <td>
                  {editPriceItem === item.menu_item ? (
                    <>
                      <button
                        className="price-change"
                        onClick={() => updatePrice(item.menu_item, newPrice)}
                      >
                        Save
                      </button>
                      <button className="price-change" onClick={cancelEditPrice}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditPriceItem(item.menu_item);
                        setNewPrice(item.price);
                      }}
                    >
                      Change Price
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="add-item-btn"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? "- Cancel" : "+ Add Menu Item"}
        </button>
        {showAddForm && (
          <form className="add-item-form" onSubmit={addMenuItem}>
            <Input
              id="menu_item"
              element="input"
              type="text"
              placeholder="Menu Item Name"
              validators={[VALIDATOR_REQUIRE()]}
              onInput={newItemInputHandler}
              value={newItemState.inputs.menu_item.value}
              errorText="Please input item name"
            />
            <Input
              id="price"
              element="input"
              type="number"
              placeholder="Price"
              validators={[VALIDATOR_REQUIRE()]}
              onInput={newItemInputHandler}
              value={newItemState.inputs.price.value}
              errorText="Please input price"
            />
            <Select
              id="veg_or_non_veg"
              validators={[VALIDATOR_REQUIRE()]}
              onInput={newItemInputHandler}
              options={[
                { value: "", label: "--SELECT--" },
                { value: "Veg", label: "Veg" },
                { value: "Non-Veg", label: "Non-Veg" },
              ]}
              initialValue={newItemState.inputs.veg_or_non_veg.value}
              errorText="Please select Veg or Non-Veg"
            />
            <Input
              id="category"
              element="input"
              type="text"
              placeholder="Category"
              validators={[VALIDATOR_REQUIRE()]}
              onInput={newItemInputHandler}
              value={newItemState.inputs.category.value}
              errorText="Please input category"
            />
            <button type="submit" disabled={!newItemFormIsValid}>
              Add Item
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MenuItems;
