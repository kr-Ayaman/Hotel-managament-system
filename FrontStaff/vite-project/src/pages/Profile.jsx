import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { useHttpClient } from "../hooks/http-hook";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ProfileCard from "../components/UIElements/ProfileCard";
import ErrorModal from "../components/UIElements/ErrorModal";
import LoadingSpinner from "../components/UIElements/LoadingSpinner";

const Profile = () => {
  const { token } = useContext(AuthContext);
  const { staffid } = useParams(); // Get staffid from the URL params
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [staffDetails, setStaffDetails] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/staffportal/staff/${staffid}`,
          "GET",
          null,
          { Authorization: `Bearer ${token}` }
        );
        if(token){
            setStaffDetails(responseData.result[0]);
        }
      } catch (err) {
        console.error("Error fetching staff details:", err);
      }
    };
    fetchStaffDetails();
  }, [sendRequest, token, staffid]);

  const removeEmployeeHandler = async () => {
    try {
      await sendRequest(
        `http://localhost:5000/staffportal/staff/${staffid}`,
        "DELETE",
        null,
        { Authorization: `Bearer ${token}` }
      );
      history.push("/manager/staff")
      setStaffDetails(null);
    } catch (err) {
      console.error("Error removing employee:", err);
    }
  };

  const changeSalaryHandler = async (newSalary) => {
    try {
      await sendRequest(
        `http://localhost:5000/staffportal/staff/${staffid}/salary`,
        "PATCH",
        JSON.stringify({ newSalary }),
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );
      setStaffDetails((prevDetails) => ({
        ...prevDetails,
        salary: newSalary,
      }));
    } catch (err) {
      console.error("Error changing salary:", err);
    }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      <div className="profile-page">
        <h1>Staff Profile</h1>
        {staffDetails ? (
          <ProfileCard
            {...staffDetails}
            onRemove={removeEmployeeHandler}
            onChangeSalary={changeSalaryHandler}
          />
        ) : (
          <p>No staff details found or staff has been removed.</p>
        )}
      </div>
    </>
  );
};

export default Profile;
