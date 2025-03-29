// EditReservation.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import { RestaurantSchema } from "elements/RestaurantLayout/restaurantSchema";
import { BasicInput, BasicSelect, DateField, Tooltip } from "elements/BaseElements/baseElements";
import { toast } from 'react-toastify';

const EditReservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservation } = location.state || {};


  // Initialize the form state with the current booking data
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [reservationId, setReservationId] = useState("");

  const [additionalServices, setAdditionalServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", posX: 0, posY: 0 });

  // New states for table data
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableNumber, setTableNumber] = useState("");

// States for working with the restaurant working hours
    const [restaurantHours, setRestaurantHours] = useState([]);
    const [restSpecialDays, setRestSpecialDays] = useState([]);

  const today = new Date().toISOString().split("T")[0];


 // Loading restaurant schedule (working hours and special days)
  useEffect(() => {
    const fecthSchedule = async () => {
// Working hours
      try {
        const resHours = await fetch("http://localhost:5002/getRestaurantHours");
        const dataHours = await resHours.json();
        setRestaurantHours(dataHours.hours);
      } catch (error) {
        console.error("Error fetching restaurant hours:", error);
      }
// Special days
      try {
        const resSpec = await fetch("http://localhost:5002/get-special-days");
        const dataSpec = await resSpec.json();
        setRestSpecialDays(dataSpec.special_days);
      } catch (error) {
        console.error("Error fetching restaurant special days:", error);
      }
    };
    fecthSchedule();
  }, []);

    // Loading additional services
    useEffect(() => {
      const fetchAdditionalServices = async () => {
        try {
          const response = await fetch("http://localhost:5002/getAdditionalServices");
          const services = await response.json();
          setAdditionalServices(services);
        } catch (error) {
          console.error("Error fetching additional services:", error);
        }
      };
      fetchAdditionalServices();
    }, []);


// Loading booking data when editing
  useEffect(() => {
    if (reservation && reservation.booking_start) {
      //console.log("Edit reservation data:", reservation);
      // Convert time from UTC to local time for Helsinki
      const localTime = moment.tz(reservation.booking_start, 'Europe/Helsinki');
      setDate(new Date(localTime.format('YYYY-MM-DD')));    // for example, "2025-03-24"
      setTime(localTime.format('HH:mm'));           // for example, "11:50"
      setCapacity(String(reservation.number_of_guests));
      setReservationId(reservation.id_reservation);
      // Convert the table id to a string so that it matches the value type in the options
      const tableStr = reservation.id_table !== undefined ? String(reservation.id_table) : "";
      setSelectedTable(tableStr);
      //console.log("Selected table set to:", tableStr);
      // Save the table data if it is returned by the server
      setTableCapacity(reservation.table_capacity ? String(reservation.table_capacity) : "");
      setTableNumber(reservation.table_number ? String(reservation.table_number) : "");
      //console.log("Selected table set to:", tableStr);
  
      setSelectedServices(
        reservation.additional_services
          ? reservation.additional_services.split(",").map(s => s.trim())
          : []
      );
    }
  }, [reservation]);

    // Additional log before returning the component
    //console.log("Current time state:", time);


  // Функция для генерации доступных временных слотов (шаг 10 минут) на основе выбранной даты и графика работы
  const getAvailableTimes = (selectedDate) => {
    if (!selectedDate || restaurantHours.length === 0) return [];
    // Определяем день недели (например, "Monday")
    const dayOfWeek = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });
    const hoursForDay = restaurantHours.find((item) => item.day === dayOfWeek);
    // Проверяем специальные дни
    const spDay = restSpecialDays.find((day) => new Date(day.day).toISOString() === new Date(selectedDate).toISOString());
    if (!hoursForDay || hoursForDay.is_closed || spDay?.is_closed) return [];
    // Если есть специальный день, берем его время, иначе стандартное время
    const { open_time, close_time } = spDay ? spDay : hoursForDay;
    const timesArray = [];
    // Создаем объекты Date для начала и конца рабочего времени
    const start = new Date(selectedDate);
    const [openHour, openMin] = open_time.split(":").map(Number);
    start.setHours(openHour, openMin, 0, 0);
    const end = new Date(selectedDate);
    const [closeHour, closeMin] = close_time.split(":").map(Number);
    end.setHours(closeHour, closeMin, 0, 0);
    // Генерируем временные слоты
    const current = new Date(start);
    while (current <= end) {
      timesArray.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + 10);
    }
    return timesArray;
  };

  const availableTimes = getAvailableTimes(date);

 // Loading available tables after selecting date, time and number of guests
 useEffect(() => {
  if (date && time && capacity) {
    fetchAvailableTables();
  }
}, [date, time, capacity]);


const fetchAvailableTables = async () => {
  try {
    const response = await fetch("http://localhost:5002/getAvailableTables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, time, capacity }),
    });
    if (!response.ok) throw new Error("Failed to fetch tables");
    const availableTables = await response.json();
    //console.log("Fetched tables:", availableTables);
  // If the selected table is already set (e.g. from a pre-filled reservation)
  // check if it is present in the received list
  if (selectedTable && !availableTables.some(table => String(table.id_table) === selectedTable)) {
    // If not, add it manually.
    // Let's try to use data from the reservation object, if it is available.
    const customTable = {
      id_table: selectedTable,
      number: reservation?.table_number || selectedTable,
      capacity:  reservation?.table_capacity !== undefined
      ? String(reservation.table_capacity)
      : "Unknown"
    };
    //console.log("Adding custom table:", customTable);
    setTables([...availableTables, customTable]);
  } else {
    setTables(availableTables);
  }
  setSelectedTable(selectedTable); // save the selected value
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
  
  // Service Selection Change Handler
  const handleServiceChange = (id) => {
    const serviceId = String(id);
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        //console.log("Removing service:", serviceId);
        return prev.filter(s => s !== serviceId);
      } else {
        //console.log("Adding service:", serviceId);
        return [...prev, serviceId];
      }
    });
  };

  const setPosition = (event) => {
    setTooltip({
      posX: event.clientX + 10,
      posY: event.clientY + 10,
    });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, text: "", posX: 0, posY: 0 });
  };

  const handleTableClick = (e, id_table) => {
    console.log("Table clicked:", id_table);
    setSelectedTable(id_table);
  };

  // Updated Booking Send Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

// Check: if there are no available time slots for the selected date,
    if (getAvailableTimes(date).length === 0) {
      setMessage("Cannot book on a day when the restaurant is closed. Please select an open day.");
      setLoading(false);
      return;
    }

    // Validation of required fields
    if (!date || !time || !capacity || !selectedTable) {
      setMessage("Please fill in all required fields: date, time, number of guests, and table.");
      setLoading(false);
      return;
    }

    // Combine date and time for sending
    const booking_start = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${time}:00`;

    const newData = {
      booking_start,
      number_of_guests: Number(capacity),
      id_table: selectedTable,
      additional_services: selectedServices.length > 0 ? selectedServices.join(",") : null,
    };

    //console.log("Sending updated reservation data:", newData);

    // Update reservation
    fetch("http://localhost:5002/updateReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservation.id_reservation, newData })
    })
    .then((response) => response.json())
    .then((data) => {
      toast.success("Your reservation has been updated successfully!");
      setTableCapacity("");
      setTableNumber("");
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
        <h2 className="text-center title">Edit Reservation</h2>
        <form onSubmit={handleSubmit}>
          <DateField
            name="date"
            label="Select a day:"
            value={date}
            onChange={(date) => setDate(date)}
            minDate={today}
            isDayDisabled={isDayDisabled}
            dayClassName={dayClassName}
          />
          <BasicSelect
            name="time"
            label="Time, when booking starts:"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            options={getAvailableTimes(date).map((t) => ({ value: t, label: t }))}
            emptyOption={"--"}
          />
          <BasicInput
            name="capacity"
            label="Number of people:"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min="1"
          />
          <div className="service-wrapper">
            <h4 className="text-center">Additional Services:</h4>
            <div className="service-container">
              {additionalServices.map((service) => (
               <div
               className="tooltip-activator service-item"
               key={service.id_additional_services}
               onMouseMove={(e) => setPosition(e)}
               onMouseLeave={hideTooltip}
              >
               <label style={{ color: "#000" }}>
                 <input
                   type="checkbox"
                   name={`service-${service.id_additional_services}`}
                   value={String(service.id_additional_services)}
                   checked={selectedServices.includes(String(service.id_additional_services))}
                   onChange={() => handleServiceChange(service.id_additional_services)}
                 />
                 {`${service.service_name} - ${service.price}€`}
               </label>
               <Tooltip posX={tooltip.posX} posY={tooltip.posY}>
                 {service.description}
               </Tooltip>
              </div>
              ))}
            </div>
          </div>
          {tables.length > 0 && (
            <BasicSelect
              name="table"
              label="Choose a table:"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              options={tables.map((table) => {
                const tableIdStr = String(table.id_table);
                return {
                  value: tableIdStr,
                  label: tableIdStr === selectedTable 
                    ? `Table #${table.number}` 
                    : `Table #${table.number} - Capacity: ${table.capacity}`
                };
              })}
              emptyOption={"--"}
            />
          )}
          {tables.length === 0 && date && time && capacity !== "" && <p>No tables available.</p>}
          <button className="action-button" type="submit" disabled={loading || !selectedTable}>
            {loading ? "Updating..." : "Update Reservation"}
          </button>
          {message && <p style={{ color: "#fff" }}>{message}</p>}
        </form>
      </div>
      <div className="schema-container">
        <RestaurantSchema
          availableTables={tables}
          activeTables={[{ id_table: selectedTable }]}
          handleClick={handleTableClick}
        />
      </div>
    </>
  );
};


export default EditReservation;
