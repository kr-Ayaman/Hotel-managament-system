import React, { useState } from "react";
import "./ProfileCard.css"; // Import the updated CSS file
import { AuthContext } from "../../context/auth-context";
import { useContext } from "react";

const ProfileCard = ({
  staff_id,
  first_name,
  last_name,
  position,
  email,
  hire_date,
  salary,
  contact_number,
  onRemove,
  onChangeSalary,
}) => {
  const auth = useContext(AuthContext);
  const isManager = auth.position === "Manager" && position != "Manager";
  
  // State to handle salary editing
  const [isEditing, setIsEditing] = useState(false);
  const [newSalary, setNewSalary] = useState(salary);

  const handleSaveSalary = () => {
    onChangeSalary(newSalary);
    setIsEditing(false); // Disable editing after saving
  };

  const handleCancelEdit = () => {
    setNewSalary(salary); // Reset to original salary
    setIsEditing(false); // Cancel editing
  };

  return (
    <div className="profile-card">
      <h2>Staff Profile</h2>
      <div className="profile-details">
        <div>
          <label>Staff ID:</label>
          <p>{staff_id}</p>
        </div>
        <div>
          <label>Name:</label>
          <p>{`${first_name} ${last_name}`}</p>
        </div>
        <div>
          <label>Position:</label>
          <p>{position}</p>
        </div>
        <div>
          <label>Email:</label>
          <p>{email}</p>
        </div>
        <div>
          <label>Hire Date:</label>
          <p>{new Date(hire_date).toLocaleDateString()}</p>
        </div>
        <div>
          <label>Salary:</label>
          {isEditing ? (
            <input
              type="number"
              value={newSalary}
              onChange={(e) => setNewSalary(e.target.value)}
              placeholder="Enter new salary"
            />
          ) : (
            <p>{salary}</p>
          )}
        </div>
        <div>
          <label>Contact Number:</label>
          <p>{contact_number}</p>
        </div>
      </div>

      {isManager && (
        <div className="profile-actions">
          <button onClick={onRemove}>Remove Employee</button>
          {isEditing ? (
            <>
              <button onClick={handleSaveSalary}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}>Change Salary</button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
