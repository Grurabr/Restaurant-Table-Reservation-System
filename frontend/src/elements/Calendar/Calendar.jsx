import React, { useState, useEffect } from "react";
import { BasicSelect, DateField, BasicInput, DateFieldRange } from "../BaseElements/baseElements";
import "../../styles/calendar.css";
import { toast } from "react-toastify";


// Get Week number
function getWeekNumber(date) {
    // Create a copy of the date to avoid modifying the original one
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
  
    // Set the date to the nearest Thursday (ISO week starts from Monday, so Thursday is always in the correct week)
    d.setDate(d.getDate() + 3 - (d.getDay() || 7));
  
    // Get the first Thursday of the year
    const firstThursday = new Date(d.getFullYear(), 0, 1);
  
    // Calculate the number of weeks by dividing the days between the date and the first Thursday by 7
    const weekNumber = Math.ceil(((d - firstThursday) / 86400000 + 1) / 7);
  
    return weekNumber;
}

// Get weeks in month
function getWeeksInMonth(year, month) {
    // Array to store the week numbers
    const weekNumbers = [];
  
    // First day of the month
    const firstDay = new Date(year, month - 1, 1);
    
    // Last day of the month
    const lastDay = new Date(year, month, 0);
  
    // Loop through each day of the month
    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
      const weekNumber = getWeekNumber(d);
      // Add the week number if it isn't already in the array
      if (!weekNumbers.includes(weekNumber)) {
        weekNumbers.push(weekNumber);
      }
    }
  
    return weekNumbers;
}

const SetSpecialDays = ({day = null, workHours, specialDays, setIsOpen, onUpdate, onDelete}) => {
    const [date, setDate] = useState(setDateFromDay(day)); // Date
    const [dateRange, setDateRange] = useState([null, null]); // Date Range
    const [startDate, endDate] = dateRange;
    const [activeTab, setActiveTab] = useState("day");
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [tempDay, setTempDay] = useState({
        id_restaurant: 1,
        day: date,
        is_closed: 0,
        open_time: "",
        close_time: ""
    });

    // When date changes
    useEffect(()=> {
        if (date) {
            const dayWorkHours = workHours.find((workDay) => (workDay.day === weekDays[new Date(date).getDay()]));
            const specialDay = specialDays.find((spDay) => (date ? (spDay.day.split("T")[0] === date.toISOString().split("T")[0]) : false));
            console.log('special day', specialDay, 'date\n',date.toISOString());
            setTempDay({
                id_restaurant: dayWorkHours?.id_restaurant,
                day: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                is_closed: specialDay ? specialDay.is_closed : dayWorkHours?.is_closed,
                open_time: specialDay ? specialDay.open_time : dayWorkHours?.open_time,
                close_time: specialDay ? specialDay.close_time : dayWorkHours?.close_time
            });
        }
    }, [date]);

    // Set date
    function setDateFromDay (day) {
        const d = new Date(day);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // Input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "is_closed" || name === "is_special" ) newValue = Number(value);
        setTempDay({ ...tempDay, [name]: newValue });
    }

    const getValues = () => {
        let values = [];

        if (activeTab === "day" && date) {
            console.log(date.getDate());
            values.push(tempDay);
        }
        else if (activeTab === "period" && startDate && endDate) {
            // Loop through each day of the period
            for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                const day_ = new Date(d);
                day_.setHours(0, 0, 0, 0);
                values.push({...tempDay, day: `${day_.getFullYear()}-${day_.getMonth() + 1}-${day_.getDate()}`});
            }
        }

        return values;
    }

    // Update
    const handleUpdate = (e) => {
        e.preventDefault();
        onUpdate(getValues());
    }

    // Delete
    const handleDelete = (e) => {
        e.preventDefault();
        onDelete(getValues());

    }

    return (
        <div className="popup-overlay">
          <div className="popup-content">
            {/* Close button */}
            <button className="close-icon" onClick={() => setIsOpen(false)}>
              ✖
            </button>
            <h4>Add special days</h4>
            <div className="day-selector-wrapper tabs">
                <div className={`tab ${activeTab === "day" ? "active" : ""}`} onClick={() => setActiveTab("day")}>Date</div>
                <div className={`tab ${activeTab === "period" ? "active" : ""}`} onClick={() => setActiveTab("period")}>Period</div>
            </div>
            {activeTab === "day" && <DateField value={date} onChange={setDate} className="calendar-input-field" /> }
            {activeTab === "period" && <DateFieldRange startValue={startDate} endValue={endDate} onChange={setDateRange} className="calendar-input-field" /> }
            <BasicSelect className="calendar-input-field" label="State" name="is_closed" value={tempDay.is_closed} onChange={handleInputChange} options={[{value: 0, label: "Open"}, {value: 1, label: "Closed"}]}/>
            {!tempDay.is_closed && 
            <>
                <p>Hours:</p>
                <BasicInput className="calendar-input-field" type="time" name="open_time" value={tempDay.open_time} onChange={handleInputChange} label="from" />
                <BasicInput className="calendar-input-field" type="time" name="close_time" value={tempDay.close_time} onChange={handleInputChange} label="to" />
            </>}
            <div className="actions">
                <button
                    className="action action-button"
                    onClick={handleDelete}
                >
                    Back to normal
                </button>
                <button
                    className="action save-button"
                    onClick={handleUpdate}
                >
                    Confirm
                </button>
            </div>
          </div>
        </div>
    );
}

const CalendarWidget = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState("");
    const [day, setDay] = useState(null);
    const [workHours, setWorkHours] = useState([]);
    const [specialDays, setSpecialDays] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
  
    // On load
    useEffect(() => {
      getWorkHours();
      getSpecialDays();
    }, []);
  
    // Get restaurant work hours
    const getWorkHours = async () => {
        fetch("http://localhost:5002/getRestaurantHours")
        .then((response) => response.json())
        .then((data) => {
            setWorkHours(data.hours);
        })
        .catch((error) => console.error("Error fetching special days:", error));
    }

    // Get special days
    const getSpecialDays = async () => {
        fetch("http://localhost:5002/get-special-days")
        .then((response) => response.json())
        .then((data) => {
            setSpecialDays(data.special_days)})
        .catch((error) => console.error("Error fetching special days:", error));
    }

    // Send query
    const sendQuery = (query, values) => {
        fetch(query, {
            method: 'POST',
            body: JSON.stringify({special_days: values}),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
        .then((response) => response.json())
        .then((data) => {
            setIsOpen(false);
            toast.success('The work calendar has been successfully updated');
            getSpecialDays();
        })
        .catch((error) => toast.error('Something went wrong. Please try again later'));

    }

    // Update
    const handleUpdate = (values) => {
        sendQuery("http://localhost:5002/update-special-days", values);
    };
    // Delete
    const handleDelete = (values) => {
        sendQuery("http://localhost:5002/delete-special-days", values);
    }
  
    return (
      <div className="calendar-widget">
        <div className="calendar-controls">
            <div className="calendar-control-container">
                <BasicSelect
                className={"calendar-control"}
                label="Year"
                name="year"
                value={year}
                options={Array.from({ length: 10 }, (_, i) => ({
                value: new Date().getFullYear() + i - 5,
                label: new Date().getFullYear() + i - 5,
                }))}
                onChange={(e) => setYear(e.target.value)}
                />
            </div>
            <div className="calendar-control-container">
                <BasicSelect
                className={"calendar-control"}
                label="Month"
                name="month"
                value={month}
                options={[
                { value: "", label: "All months" },
                ...Array.from({ length: 12 }, (_, i) => ({
                    value: i,
                    label: new Date(0, i).toLocaleString("en", { month: "long" }),
                })),
                ]}
                onChange={(e) => setMonth(e.target.value)}
                />
            </div>
            <div className="calendar-control-container button">
            <button onClick={() => setIsOpen(true)} className="save-button">Change calendar</button>
            </div>
            
        </div>
        <div className="calendar-display">
          {Array.from({ length: 12 }, (_, i) =>
            month === "" || parseInt(month) === i ? (
              <Month key={i} month={i} year={year} specialDays={specialDays} workHours={workHours} setDay={setDay} setIsOpen={setIsOpen} />
            ) : null
          )}
        </div>
        {isOpen && <SetSpecialDays day={day} workHours={workHours} specialDays={specialDays} setIsOpen={setIsOpen} onUpdate={handleUpdate} onDelete={handleDelete} />}
      </div>
    );
  };
  
const Month = ({ month, year, specialDays, workHours, setDay, setIsOpen }) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const weekNumbers = getWeeksInMonth(year, month + 1);
    const weeks = {};
    const days = [];
  
    weekNumbers.map((week) => {
        weeks[week] = new Array(7).fill("");
    });

    // Days
    // Loop through each day of the month
    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
        const day = new Date(d);
        const weekNumber = getWeekNumber(day);
        const weekDay = (day.getDay() + 6) % 7;
        weeks[weekNumber][weekDay] = day;
        //console.log(day);
        //days.push({ day: day});
    }
  
    return (
      <div className="calendar-month-container">
        <h3 className="calendar-month-name">{new Date(year, month).toLocaleString("en", { month: "long" })}</h3>
        <table className="calendar-table">
          <thead>
            <tr className="calendar-week-days">
              <th>#</th>
              <th>Mo</th>
              <th>Tu</th>
              <th>We</th>
              <th>Th</th>
              <th>Fr</th>
              <th>Sa</th>
              <th>Su</th>
            </tr>
          </thead>
          <tbody>
            {weekNumbers.map((week) => (
              <tr key={week}>
                <td className="calendar-week-number">{week}</td>
                {weeks[week].map((day, index) => {
                    const dayWorkHours = workHours.find((workDay) => (workDay.day === weekDays[index]));
                    const specialDay = specialDays.find((spDay) => (day ? (spDay.day.split("T")[0] === day.toISOString().split("T")[0]) : false));

                    return(
                    <td key={index} className={index == 5 || index == 6 ? "calendar-weekend-day" : ""}>
                        {day ? 
                        <Day {...day} 
                        index={index}
                        day={day}
                        is_closed={specialDay ? specialDay.is_closed : dayWorkHours?.is_closed}
                        is_special={specialDay ? 1 : 0}
                        open_time={specialDay ? specialDay.open_time : dayWorkHours?.open_time}
                        close_time={specialDay ? specialDay.close_time : dayWorkHours?.close_time}
                        setDay={setDay}
                        setIsOpen={setIsOpen}
                        /> : ""}
                    </td>);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
};
  
const Day = ({ index, day, is_closed = 0, is_special = 0, open_time, close_time, setDay, setIsOpen }) => {
    const [showPopup, setShowPopup] = useState(false);

    const handleButtonClick = () => {
        setDay(day);
        setIsOpen(true);
    }

    return (
        <div 
        className={`calendar-day-container ${is_closed ? "calendar-closed-day" : is_special ? "calendar-special-day" : ""}`}
        onClick={() => setShowPopup(!showPopup)} onMouseLeave={() => setShowPopup(false)}>
            <div className="calendar-day-button">{day.getDate()}</div>
            {showPopup && 
            <div className={`calendar-day-popup ${index == 0 ? 'start' : index == 6 ? 'end' : ''}`}>
                <p>{`Day: ${day.toDateString()}`}</p>
                <p>{`Status: ${is_closed ? "Closed" : is_special ? "Special" : "Open"}`}</p>
                {!is_closed && 
                <>
                    <p>Hours:</p>
                    <p>{` ${open_time.slice(0, -3)} - ${close_time.slice(0, -3)}`}</p>
                </>
                }
                <button className="action-button" onClick={handleButtonClick} >Edit</button>
            </div>
            }
        </div>
    );
};

export  {CalendarWidget};
