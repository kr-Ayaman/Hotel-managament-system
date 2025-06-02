import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/auth-context";
import { useHttpClient } from "../../hooks/http-hook";

function UpcomingBanquetsTable() {
  const { token } = useContext(AuthContext); // Token for authentication
  const { sendRequest, isLoading, error, clearError } = useHttpClient(); // Custom hook for HTTP requests
  const [banquets, setBanquets] = useState([]); // Original data fetched from the backend
  const [filteredBanquets, setFilteredBanquets] = useState([]); // Filtered data
  const [search, setSearch] = useState({}); // State for search filters

  // Fetch banquet data on component mount
  useEffect(() => {
    const fetchUpcomingBanquets = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/staffportal/up-booking/banquets",
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        const fetchedBanquets = responseData.result.map((banquet) => ({
          bookingid: banquet.hall_booking_id,
          guestid: banquet.guest_id,
          banquetno: banquet.hall_id,
          bookedfrom: banquet.check_in_date.split("T")[0],
          bookedupto: banquet.check_out_date.split("T")[0], 
          occasion: banquet.occasion,
          phone: banquet.phone_number,
        }));
        setBanquets(fetchedBanquets);
        setFilteredBanquets(fetchedBanquets); 
      } catch (err) {
        console.error(err);
      }
    };

    fetchUpcomingBanquets();
  }, [sendRequest, token]);

  // Handle dynamic filtering
  useEffect(() => {
    const searchKeyMap = {
      "hall booking id": "bookingid",
      "guest id": "guestid",
      "hall number": "banquetno",
      "booked from": "bookedfrom",
      "booked upto": "bookedupto",
      "occasion": "occasion",
      "phone number": "phone",
    };

    const filtered = banquets.filter((banquet) =>
      Object.entries(search).every(([key, value]) => {
        const column = searchKeyMap[key];
        if (!value) return true; 
        if (["booked from", "booked upto"].includes(key)) {
          const banquetDate = new Date(banquet[column]);
          const searchDate = new Date(value);
          return key === "booked from"
            ? banquetDate >= searchDate
            : banquetDate <= searchDate;
        }
        return banquet[column]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    );
    setFilteredBanquets(filtered);
  }, [search, banquets]);

  return (
    <div className="banquet-search-table">
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
                  "hall booking id",
                  "guest id",
                  "hall number",
                  "booked from",
                  "booked upto",
                  "occasion",
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
              {filteredBanquets.map((banquet) => (
                <tr key={banquet.bookingid}>
                  <td>{banquet.bookingid}</td>
                  <td>{banquet.guestid}</td>
                  <td>{banquet.banquetno}</td>
                  <td>{banquet.bookedfrom}</td>
                  <td>{banquet.bookedupto}</td>
                  <td>{banquet.occasion}</td>
                  <td>{banquet.phone}</td>
                </tr>
              ))}
              {filteredBanquets.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
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

export default UpcomingBanquetsTable;
