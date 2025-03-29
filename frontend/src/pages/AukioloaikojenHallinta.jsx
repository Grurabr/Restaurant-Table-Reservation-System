import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/page.css";
import { BasicInput, CheckBoxField } from "elements/BaseElements/baseElements";
import {CalendarWidget} from "elements/Calendar/Calendar";


const AdminRestaurantHours = () => {
    const navigate = useNavigate();
    const { email, role } = useSelector((state) => state.user);
    const [restaurantHours, setRestaurantHours] = useState([]);

    useEffect(() => {
        if (!email || role !== "admin") {
            navigate("/home");
        }
    }, [email, role, navigate]);

    useEffect(() => {
        fetchRestaurantHours();
    }, []);

    const fetchRestaurantHours = async () => {
        try {
            const response = await fetch("http://localhost:5002/getRestaurantHours");
            const data = await response.json();

            setRestaurantHours(data.hours);
            
        } catch (error) {
            console.error("Error fetching restaurant hours:", error);
        }
    };

    const handleTimeChange = (day, field, value) => {
        setRestaurantHours(prev =>
            prev.map(item => (item.day === day ? { ...item, [field]: value } : item))
        );
    };

    const handleDayToggle = (day) => {
        setRestaurantHours(prev =>
            prev.map(item => item.day === day ? { ...item, is_closed: !item.is_closed } : item)
        );
    };

    const handleSave = async () => {
        try {
            const response = await fetch("http://localhost:5002/updateRestaurantHours", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_restaurant: 1, hours: restaurantHours }),
            });

            if (!response.ok) throw new Error("Failed to update restaurant hours");
        } catch (error) {
            console.error("Error updating restaurant hours:", error);
        }
    };

    return (
        <div className="content">
            <h2 className="text-center title">Manage schedule</h2>
            <h3 className="text-center title">Week hours</h3>
            <div className="days-container">
                <form className="form-container">
                    {restaurantHours.map(({ day, open_time, close_time, is_closed }) => (
                        <div 
                        className="day-row-container" 
                        key={day}>
                            <div className="day-container"><strong>{day}</strong></div>
                            <div className="close-chbox-container"><CheckBoxField className="close-checkbox" label="closed" checked={is_closed} onChange={() => handleDayToggle(day)} /></div>
                            {!is_closed ? (
                                <div className="time-wrapper">
                                    <div className="time-container"><BasicInput className="time-input" label="from:" type="time" value={open_time} onChange={(e) => handleTimeChange(day, "open_time", e.target.value)} /></div>
                                    <div className="time-container"><BasicInput className="time-input" label="to:" type="time" value={close_time} onChange={(e) => handleTimeChange(day, "close_time", e.target.value)} /></div>
                                </div>
                            ) : <div className="close-indicator"><span>Closed</span></div>}
                        </div>
                    ))}
                    <button className="action-button" onClick={handleSave}>Save Changes</button>
                </form>
            </div>
            <h3 className="text-center title">Calendar schedule</h3>
            <CalendarWidget />
            
        </div>
    );
};

export default AdminRestaurantHours;
