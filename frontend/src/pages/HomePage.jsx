import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/page.css";

const HomePage = () => {
  const { email } = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [expandedReservation, setExpandedReservation] = useState(null);
  const dateNow = new Date();

  useEffect(() => {
    if (email) {
      fetchUserData();
    }
  }, [email]);

  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:5002/getUserParams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      setUserData(data);
      fetchUserReservations(data.id_user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Loading user bookings
  const fetchUserReservations = async (id_user) => {
    try {
      const response = await fetch("http://localhost:5002/getUserReservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_user }),
      });

      if (!response.ok) throw new Error("Failed to fetch reservations");

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const handleClick = (id_res, res_date) => {
    if (res_date > dateNow) setExpandedReservation(id_res);
  }
  const handleDelete = async (id) => {
    try {
      const response = await fetch("http://localhost:5002/deleteClientReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete reservation");

      //console.log(`Reservation ${id} deleted!`);
      fetchUserReservations(userData.id_user);
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  // Handler for editing a reservation:
  // Redirects the user to the editing page, where the form is filled with the current reservation data.
  // On the editing page, after confirming the changes, a request is sent to the /updateReservation endpoint.
  const handleEdit = (reservation) => {
    navigate("/editReservation", { state: { reservation } });
  };

  return (
    <div className="content">
      {userData ? (
        <>
          <h1 className="text-center">Hello, {userData.first_name} {userData.last_name}!</h1>
          <h2 className="text-center title">Your books</h2>
          {reservations.length > 0 ? (
            <div className="cards-wrapper">
              {reservations.map((res) => {
                const res_date = new Date(res.booking_start);

                return (
                  <div className={`card-item ${res_date > dateNow ? "active" : ""}`} key={res.id_reservation} onClick={() => handleClick(res.id_reservation, res_date)}>
                    <div className="card-container">
                      <div className="card-content">
                        <div><strong>Date:</strong> {res_date.toLocaleString()}</div>
                        <div><strong>Table:</strong> #{res.id_table}</div>
                        <div><strong>Capasity:</strong> {res.number_of_guests}</div>
                        {expandedReservation === res.id_reservation && (
                          <div className="card-button-wrapper">
                            <button className="save-button" onClick={() => handleEdit(res)}>Edit</button>
                            <button className="delete-button" onClick={() => handleDelete(res.id_reservation)}>Delete</button>
                          </div>
                        )}
                      </div> 
                    </div>
                </div>
                );
              })}
            </div>
          ) : (
            <p>You don't have any reservations yet.</p>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HomePage;
