import React, { useEffect, useState, useContext } from "react";
import { useHttpClient } from "../hooks/http-hook";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { AuthContext } from "../context/auth-context";
import LoadingSpinner from "../components/UIElements/LoadingSpinner";
import { useForm } from "../hooks/form-hook";
import Input from "../components/FormElements/Input";
import ErrorModal from "../components/UIElements/ErrorModal";
import Button from "../components/FormElements/Button"; // Assuming a reusable button component
import Modal from "../components/UIElements/Modal"; // Assuming a reusable modal component
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "../util/validators";
import "./Staff.css";

const Staff = () => {
  const [staffData, setStaffData] = useState([]);
  const history = useHistory();
  const [filteredData, setFilteredData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchPosition, setSearchPosition] = useState("");
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const { sendRequest, isLoading, error, clearError } = useHttpClient();
  const { token } = useContext(AuthContext);

  const [formState, inputHandler, setFormData] = useForm(
    {
      first_name: { value: "", isValid: false },
      last_name: { value: "", isValid: false },
      position: { value: "", isValid: false },
      email: { value: "", isValid: false },
      salary: { value: "", isValid: false },
      contact_number: { value: "", isValid: false },
      password: { value: "", isValid: false }
    },
    false
  );

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/staffportal/staff/getstaffdetails",
          "GET",
          null,
          { Authorization: `Bearer ${token}` }
        );
        setStaffData(responseData.result);
        setFilteredData(responseData.result);
      } catch (err) {}
    };

    fetchStaffDetails();
  }, [sendRequest, token]);

  // Filter logic
  useEffect(() => {
    const lowercasedName = searchName.toLowerCase();
    const lowercasedPosition = searchPosition.toLowerCase();
    const filtered = staffData.filter((staff) => {
      const fullName = `${staff.first_name} ${staff.last_name}`.toLowerCase();
      return (
        fullName.includes(lowercasedName) &&
        staff.position.toLowerCase().includes(lowercasedPosition)
      );
    });
    setFilteredData(filtered);
  }, [searchName, searchPosition, staffData]);

  const handleViewProfile = (staffId) => {
    history.push(`/staff/${staffId}/profile`);
  };

  const openAddStaffModal = () => {
    setIsAddStaffModalOpen(true);
  };

  const closeAddStaffModal = () => {
    setIsAddStaffModalOpen(false);
  };

  const handleAddStaffSubmit = async (event) => {
    event.preventDefault();
    if (!formState.isValid) {
      return;
    }
    try {
      const newStaff = {
        firstName: formState.inputs.first_name.value,
        lastName: formState.inputs.last_name.value,
        position: formState.inputs.position.value,
        email: formState.inputs.email.value,
        salary: formState.inputs.salary.value,
        contactNumber: formState.inputs.contact_number.value,
        password: formState.inputs.password.value,
      };
      const responseData = await sendRequest(
        "http://localhost:5000/staffportal/staff/add",
        "POST",
        JSON.stringify(newStaff),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );
      closeAddStaffModal();
      window.location.reload()
    } catch (err) {}
  };

  return (
    <div className="staff-container">
      <h2>Staff Management</h2>
      <ErrorModal error={error} onClear={clearError} />

      <Button onClick={openAddStaffModal}>Add Staff</Button>

      <Modal
        show={isAddStaffModalOpen}
        onCancel={closeAddStaffModal}
        header="Add New Staff"
        footer={
          <Button onClick={handleAddStaffSubmit} disabled={!formState.isValid}>
            Add Staff
          </Button>
        }
      >
        <form onSubmit={handleAddStaffSubmit}>
          <Input
            id="first_name"
            element="input"
            label="First Name"
            type="text"
            errorText="Please enter a valid first name."
            validators={[VALIDATOR_REQUIRE]}
            onInput={inputHandler}
          />
          <Input
            id="last_name"
            element="input"
            label="Last Name"
            type="text"
            errorText="Please enter a valid last name."
            validators={[VALIDATOR_REQUIRE]}
            onInput={inputHandler}
          />
          <Input
            id="position"
            element="input"
            label="Position"
            type="text"
            errorText="Please enter a valid position."
            validators={[VALIDATOR_REQUIRE]}
            onInput={inputHandler}
          />
          <Input
            id="email"
            element="input"
            label="Email"
            type="email"
            errorText="Please enter a valid email."
            validators={[VALIDATOR_EMAIL]}
            onInput={inputHandler}
          />
          <Input
            id="salary"
            element="input"
            label="Salary"
            type="number"
            errorText="Please enter a valid last name."
            validators={[VALIDATOR_REQUIRE]}
            onInput={inputHandler}
          />
          <Input
            id="contact_number"
            type="number"
            element="input"
            label="Contact Number"
            validators={[VALIDATOR_REQUIRE]}
            onInput={inputHandler}
            errorText="Please enter a valid last name."
          />
          <Input
            id="password"
            element="input"
            label="Password"
            type="password"
            validators={[VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH(5)]}
            onInput={inputHandler}
            errorText="Please enter a valid last name."
          />
        </form>
      </Modal>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by position"
          value={searchPosition}
          onChange={(e) => setSearchPosition(e.target.value)}
        />
      </div>

      {isLoading && <LoadingSpinner />}
      <table className="staff-table">
        <thead>
          <tr>
            <th>Staff ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((staff) => (
            <tr key={staff.staff_id}>
              <td>{staff.staff_id}</td>
              <td>{staff.first_name}</td>
              <td>{staff.last_name}</td>
              <td>{staff.position}</td>
              <td>{staff.salary}</td>
              <td>
                <button
                  className="view-profile-btn"
                  onClick={() => handleViewProfile(staff.staff_id)}
                >
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Staff;
