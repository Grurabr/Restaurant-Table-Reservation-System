import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/page.css";
import { DateField, List } from "elements/BaseElements/baseElements";

const AdminPage = () => {
    const navigate = useNavigate();
    const { email, role } = useSelector((state) => state.user);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedReservation, setExpandedReservation] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [unconfirmedReservations, setUnconfirmedReservations] = useState([]);
    const [confirmedReservations, setConfirmedReservations] = useState([]);
    const dateNow = new Date();

    useEffect(() => {
        if (!email || role !== "admin") {
            navigate("/home");
        }
    }, [email, role, navigate]);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                //console.log("Date:" + date);

                const [reservationsResponse, servicesResponse] = await Promise.all([
                    fetch("http://localhost:5002/getReservationsByDate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}` : null }),
                    }),
                    fetch("http://localhost:5002/getAdditionalServices")
                ]);
                //console.log("res:", reservationsResponse, ", serv:", servicesResponse)
    
                if (!reservationsResponse.ok) throw new Error("Failed to fetch reservations");
                if (!servicesResponse.ok) throw new Error("Failed to fetch services");
    
                const reservationsData = await reservationsResponse.json();
                const servicesData = await servicesResponse.json();
    
                const servicesMap = {};
                servicesData.forEach(service => {
                    servicesMap[service.id_additional_services] = service;
                });
    

    
                const updatedReservations = reservationsData.map(res => ({
                    ...res,
                    additional_services: res.additional_services
                        ? res.additional_services.split(",").map(id => servicesMap[Number(id.trim())]?.service_name || `Service ${id}`)
                        : null
                }));
    
                const unconfirmed = updatedReservations.filter(r => r.confirmation === 0);
                const confirmed = updatedReservations.filter(r => r.confirmation === 1);

                setReservations(updatedReservations);
                setUnconfirmedReservations(unconfirmed);
                setConfirmedReservations(confirmed);

                //console.log(unconfirmedReservations);
                //console.log(confirmedReservations);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [selectedDate])



    const handleApprove = async (id) => {
        try {
            const response = await fetch("http://localhost:5002/approveReservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error("Failed to approve reservation");

            const reservation = unconfirmedReservations.find(r => r.id_reservation === id);
            if (reservation) {
                const updatedReservations = reservations.map((r) => r.id_reservation === id ? {...r, confirmation: 1} : r);
                setReservations(updatedReservations);
                setConfirmedReservations(updatedReservations.filter(r => r.confirmation === 1));
                setUnconfirmedReservations(updatedReservations.filter(r => r.confirmation === 0));
            }
            //console.log(`Reservation ${id} approved and notification sent!!`);

        } catch (error) {
            console.error("Error approving reservation:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch("http://localhost:5002/deleteReservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error("Failed to delete reservation");

            setUnconfirmedReservations(unconfirmedReservations.filter(r => r.id_reservation !== id));
            setConfirmedReservations(confirmedReservations.filter(r => r.id_reservation !== id));

            //console.log(`Reservation ${id} deleted!`);
        } catch (error) {
            console.error("Error deleting reservation:", error);
        }
    };

    const UncCard = ({res}) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
        <div className="card-item unconfirmed"  onClick={async() => setExpandedReservation(res.id_reservation)}>
            <div className={`card-container ${expandedReservation === res.id_reservation ? "open" : ""}`}> 
                <div className={`card-content ${isOpen ? "open" : ""}`}>
                    <div><strong>Date:</strong> {new Date(res.booking_start).toLocaleString()}</div>
                    <div><strong>Name:</strong> {res.first_name} {res.last_name}</div>
                    <div><strong>Email:</strong> {res.email}</div>
                    <div><strong>Phone:</strong> {res.phone}</div>
                    <div><strong>Table:</strong> #{res.id_table}</div>
                    <div><strong>Capacity:</strong> {res.number_of_guests}</div>
                    {res.additional_services && (
                    <div>
                    <strong>Additional Services:</strong>
                    <List items={res.additional_services} />
                    </div>)}
                </div>
            </div>
            
            {expandedReservation === res.id_reservation && (
                <div className="card-button-wrapper">
                    <button className="save-button" onClick={() => handleApprove(res.id_reservation)}>Approve</button>
                    <button className="delete-button" onClick={() => handleDelete(res.id_reservation)}>Delete</button>
                </div>
            )}
        </div>
        );
    }

    const ConfCard = ({res}) => {
        const res_date = new Date(res.booking_start);

        return (
        <div className={`card-item ${res_date.toISOString().split("T")[0] === dateNow.toISOString().split("T")[0] ? "today" : ""}`} onClick={() => setExpandedReservation(res.id_reservation)}>
            <div className={`card-container ${expandedReservation === res.id_reservation ? "open" : ""}`}>
                <div className={`card-content ${expandedReservation === res.id_reservation ? "open" : ""}`}>
                    <div><strong>Date:</strong> {new Date(res.booking_start).toLocaleString()}</div>
                    <div><strong>Name:</strong> {res.first_name} {res.last_name}</div>
                    <div><strong>Email:</strong> {res.email}</div>
                    <div><strong>Phone:</strong> {res.phone}</div>
                    <div><strong>Table:</strong> #{res.id_table}</div>
                    <div><strong>Capacity:</strong> {res.number_of_guests}</div>
                    {res.additional_services && (
                    <div>
                    <strong>Additional Services:</strong>
                    <List items={res.additional_services} />
                    </div>)}
                </div>
            </div>
            {expandedReservation === res.id_reservation && (
                <div className="card-button-wrapper">
                    <button className="delete-button" onClick={() => handleDelete(res.id_reservation)}>Delete</button>
                </div>
            )}
        </div>
        );
    }

    //console.log(confirmedReservations, unconfirmedReservations)

    return (
        <div className="content admin-page">
            <h2 className="text-center title">Admin Panel</h2>
            <DateField className="admin-panel-date-picker" label="Select date:" value={selectedDate} onChange={(date) => {setSelectedDate(date)}} />

            {loading ? <p>Loading...</p> : (
                <div className="admin-panel-cards">
                    <div className="cards-block unconfirmed">
                        <h3 className="text-center">Unconfirmed Reservations</h3>
                        <div className="cards-wrapper">
                            {unconfirmedReservations.map(res => (<UncCard key={res.id_reservation} res={res} />))}
                        </div>
                    </div>
                    <div className="cards-block confirmed">
                        <h3 className="text-center">Confirmed Reservations</h3>
                        <div className="cards-wrapper">
                            {confirmedReservations.map(res => (<ConfCard key={res.id_reservation} res={res}/>))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
