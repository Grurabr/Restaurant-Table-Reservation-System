import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RestaurantSchema } from "elements/RestaurantLayout/restaurantSchema";
import { BasicInput, BasicSelect, CheckBoxField, DateField, Tooltip } from "elements/BaseElements/baseElements";
import { toast } from "react-toastify";

const Reservation = () => {
  const { email } = useSelector((state) => state.user);

  const location = useLocation();
  const navigate = useNavigate();
  const reservation = location.state?.reservation || null;

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reservationId, setReservationId] = useState("")

  const [additionalServices, setAdditionalServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [tooltip, setTooltip] = useState({ visible: false, text: "", posX: 0, posY: 0 });

  const [restaurantHours, setRestaurantHours] = useState([]);
  const [restSpecialDays, setRestSpecialDays] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  // On load
  useEffect(() => {
    fecthSchedule();
    fetchAdditionalServices();
  }, []);

  // Getting user data from Azure
  useEffect(() => {
    if (email) {
      fetchUserInfo();
    }
  }, [email]);

  // If you are editing a booking
  useEffect(() => {
    if (reservation) {
      console.log("edit data:",  reservation)
      setDate(reservation.booking_start.split("T")[0]);
      setTime(reservation.booking_start.split("T")[1].substring(0, 5));
      setCapacity(reservation.number_of_guests);
      setReservationId(reservation.id_reservation);
      setSelectedServices(reservation.additional_services ? reservation.additional_services.split(",").map(Number) : []);
    }
  }, [reservation]);

  // we load available tables after selecting the date, time and number of people
  useEffect(() => {
    if (date && time && capacity) {
      fetchAvailableTables();
    }
  }, [date, time, capacity]);

  // fetches
  const fetchUserInfo = async () => { // User info
    try {
      const response = await fetch("http://localhost:5002/getUserParams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to fetch user info");

      const data = await response.json();
      setUserId(data.id_user);
      //console.log("User info:", data)
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fecthSchedule = async () => { // Work schedule
    // Work hours
    fetch("http://localhost:5002/getRestaurantHours")
    .then((res) => res.json())
    .then((data) => setRestaurantHours(data.hours))
    .catch((error) => console.error("Error fetching restaurant hours:", error));

    // Special days
    fetch("http://localhost:5002/get-special-days")
    .then((res) => res.json())
    .then((data) => setRestSpecialDays(data.special_days))
    .catch((error) => console.error("Error fetching restaurant special days:", error));
  };

  const fetchAdditionalServices = async () => { // Additional services
    try {
      const response = await fetch("http://localhost:5002/getAdditionalServices");
      const services = await response.json();
      setAdditionalServices(services);
    } catch (error) {
      console.error("Error fetching additional services:", error);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const response = await fetch("http://localhost:5002/getAvailableTables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, time, capacity }),
      });

      if (!response.ok) throw new Error("Failed to fetch tables");

      const availableTables = await response.json();
      setTables(availableTables);
      setSelectedTable("");
      console.log(availableTables)
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  // Methods
  // Disabled days
  const isDayDisabled = (date) => {
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const workHours = restaurantHours.find((day) => day.day === weekDays[date.getDay()]);
    const spDay = restSpecialDays.find((day) => day.day === date.toISOString());
    return spDay ? spDay.is_closed : workHours.is_closed;
  }

  // Special days 
  const dayClassName = (date) => {
    const spDay = restSpecialDays.find((day) => day.day === date.toISOString());
    return spDay ? (spDay.is_closed ? "res-close-day" : "res-spec-day") : "";
  }

  const handleServiceChange = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id)
        ? prev.filter((serviceId) => serviceId !== id)
        : [...prev, id]
    );
  };

  // Show a pop-up window above the cursor
  const setPosition = (event) => {
    setTooltip({
      posX: event.clientX + 10, // Move it a little to the right
      posY: event.clientY + 10, // Move it down a little
    });
  };

  // Function for generating available time slots in 10 minute increments based on selected date and opening hours
  const getAvailableTimes = (selectedDate) => {
    if (!selectedDate || restaurantHours.length === 0) return [];

    // We define the day of the week, the format must match the data from restaurantHours (for example, "Monday")
    const dayOfWeek = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });
    const hoursForDay = restaurantHours.find((item) => item.day === dayOfWeek);
    const spDay = restSpecialDays.find((day) => new Date(day.day).toISOString() === new Date(selectedDate).toISOString());

    if (!hoursForDay || hoursForDay.is_closed || spDay?.is_closed) return [];

    const { open_time, close_time } = spDay ? spDay : hoursForDay;
    const timesArray = [];

    // Parsing opening and closing times
    const [openHour, openMin] = open_time.split(":").map(Number);
    const [closeHour, closeMin] = close_time.split(":").map(Number);

    // Create Date objects for the start and end of working hours
    const start = new Date(selectedDate);
    start.setHours(openHour, openMin, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(closeHour, closeMin, 0, 0);

    // Generate time slots with a step of 10 minutes
    const current = new Date(start);
    while (current <= end) {
      timesArray.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + 10);
    }
    return timesArray;
  };

  // When the date changes, we regenerate the list of available times
  const availableTimes = getAvailableTimes(date);

  // Handle table click
  const handleTableClick = (e, id_table) => {
    console.log('table', id_table);
    setSelectedTable(id_table);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const reservationData = {
      id_restaurant: 1,
      id_table: Number(selectedTable),
      id_user: Number(userId),
      date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      time,
      duration: 2, // Duration of booking
      number_of_guests: Number(capacity),
      additional_services: selectedServices.length > 0 ? selectedServices.join(",") : null,
    };

    console.log("Sending reservation data:", reservationData);

    // Create new reservation
    fetch("http://localhost:5002/addReservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservationData),
    })
    .then((response) => response.json())
    .then((data) => {
      toast.success('Your table has been booked successfully!');
      setDate("");
      setTime("");
      setCapacity("");
      setSelectedTable("");
      setSelectedServices([]);
      navigate("/home");
    })
    .catch((error) => toast.error('Something went wrong. Please try again later'))
    .finally(() => setLoading(false));
  };

  return (
    <>
      <div className="reservation-container">
        <h2 className="text-center title">Book a table</h2>
        <form onSubmit={handleSubmit}>
          <DateField
            label="Select a day:"
            value={date}
            onChange={(selectedDate) => setDate(selectedDate)}
            minDate={today}
            isDayDisabled={isDayDisabled}
            dayClassName={dayClassName}
          />
          <BasicSelect
            label="Time, when booking starts:"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            options={availableTimes.map((t) => ({ value: t, label: t }))}
            emptyOption={"--"}
          />
          <BasicInput label="Number of people:" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" />

          <div className="service-wrapper">
            <h4 className="text-center">Additional Services:</h4>
            <div className="service-container">
              {additionalServices.map((service) => (
                <div
                  className="tooltip-activator service-item"
                  key={service.id_additional_services}
                  onMouseMove={(e) => setPosition(e)}
                >
                  <CheckBoxField
                    label={`${service.service_name} - ${service.price}€`}
                    value={service.id_additional_services}
                    checked={selectedServices.includes(service.id_additional_services)}
                    onChange={() => handleServiceChange(service.id_additional_services)}
                  />
                  <Tooltip posX={tooltip.posX} posY={tooltip.posY}>{service.description}</Tooltip>
                </div>
              ))}
            </div>
          </div>

          {tables.length > 0 && (
            <BasicSelect
              label="Choose a table:"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              options={tables.map((table) => ({
                value: table.id_table,
                label: `Table #${table.number} - Capacity: ${table.capacity}`
              }))}
              emptyOption={"--"}
            />
          )}

          {tables.length === 0 && date && time && capacity && <p>No tables available.</p>}

          <button className="action-button" type="submit" disabled={loading || !selectedTable}>
            {loading ? "Booking..." : "Book a table"}
          </button>

          {message && <p style={{ color: "#fff" }}>{message}</p>}
        </form>
      </div>
      <div className="schema-container">
        <RestaurantSchema availableTables={tables} activeTables={[{ id_table: selectedTable }]} handleClick={handleTableClick} />
      </div>
    </>
  );
};

export { Reservation };
