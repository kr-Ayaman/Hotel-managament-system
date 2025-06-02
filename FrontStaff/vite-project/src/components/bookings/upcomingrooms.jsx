import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/auth-context";
import { useHttpClient } from "../../hooks/http-hook";

function UpcomingRoomsTable() {
  const { token } = useContext(AuthContext); // Get token from AuthContext
  const { sendRequest, isLoading, error, clearError } = useHttpClient(); // Custom hook for HTTP requests
  const [rooms, setRooms] = useState([]); // Original data fetched from API
  const [filteredRooms, setFilteredRooms] = useState([]); // Filtered data
  const [search, setSearch] = useState({}); // State for search filters

  // Fetch rooms data on component mount
  useEffect(() => {
    const fetchUpcomingRooms = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/staffportal/up-booking/rooms",
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        const fetchedRooms = responseData.result.map((room) => ({
          bookingid: room.booking_id,
          guestid: room.guest_id,
          roomno: room.room_id,
          bookedfrom: room.check_in_date.split("T")[0], // Format date
          bookedupto: room.check_out_date.split("T")[0], // Format date
          phone: room.phone_number,
        }));
        setRooms(fetchedRooms);
        setFilteredRooms(fetchedRooms); // Initially, all rooms are displayed
      } catch (err) {
        console.error(err);
      }
    };

    fetchUpcomingRooms();
  }, [sendRequest, token]);

  // Handle dynamic filtering
  useEffect(() => {
    const searchKeyMap = {
      "room booking id": "bookingid",
      "guest id": "guestid",
      "room number": "roomno",
      "booked from": "bookedfrom",
      "booked upto": "bookedupto",
      "phone number": "phone",
    };

    const filtered = rooms.filter((room) =>
      Object.entries(search).every(([key, value]) => {
        const column = searchKeyMap[key];
        if (!value) return true; // Ignore empty filters
        if (["booked from", "booked upto"].includes(key)) {
          // Handle date filters
          const roomDate = new Date(room[column]);
          const searchDate = new Date(value);
          return key === "booked from"
            ? roomDate >= searchDate
            : roomDate <= searchDate;
        }
        return room[column]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    );
    setFilteredRooms(filtered);
  }, [search, rooms]);

  return (
    <div className="room-search-table">
      {isLoading && <p>Loading...</p>}
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      {!isLoading && !error && (
        <>
          <table>
            <thead>
              <tr>
                {[
                  "room booking id",
                  "guest id",
                  "room number",
                  "booked from",
                  "booked upto",
                  "phone number",
                ].map((col) => (
                  <th key={col}>
                    {col.toUpperCase()}
                    {["booked from", "booked upto"].includes(col) ? (
                      <input
                        type="date"
                        onChange={(e) =>
                          setSearch((prev) => ({
                            ...prev,
                            [col]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={`Search ${col}`}
                        onChange={(e) =>
                          setSearch((prev) => ({
                            ...prev,
                            [col]: e.target.value,
                          }))
                        }
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.bookingid}>
                  <td>{room.bookingid}</td>
                  <td>{room.guestid}</td>
                  <td>{room.roomno}</td>
                  <td>{room.bookedfrom}</td>
                  <td>{room.bookedupto}</td>
                  <td>{room.phone}</td>
                </tr>
              ))}
              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default UpcomingRoomsTable;
