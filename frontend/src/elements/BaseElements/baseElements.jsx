import { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";


const BasicInput = ({ label, type = "text", name, value, onChange, min, max, style, className, readonly}) => {
  return (
    <div className={`basic-input-container ${className}`} style={style}>
      <label htmlFor={name}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} min={min} max={max} placeholder=" " required readOnly={readonly} />
    </div>
  );
};

const InputField = ({ label, type = "text", name, value, onChange, min, max, style, className, readonly }) => {
  const inputRef = useRef(null); // link to input

  const handleLabelClick = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // Transferring focus programmatically
    }
  };

  return (
    <div className={`input-container ${className}`} style={style}>
      <input ref={inputRef} type={type} name={name} value={value} onChange={onChange} min={min} max={max} placeholder=" " required readOnly={readonly}/>
      <label htmlFor={name} onClick={handleLabelClick}>{label}</label>
    </div>
  );
};

const BasicSelect = ({ label, name, value, options, emptyOption, onChange, style, className }) => {
  return (
    <div className={`basic-input-container ${className}`} style={style}>
      <label htmlFor={name}>{label}</label>
      <div className="select-container">
        <select name={name} value={value} onChange={onChange} className="select-field">
          {emptyOption && <option value={null}>{emptyOption}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const SelectField = ({ label, name, value, options, onChange, style, className }) => {
  const inputRef = useRef(null);

  const handleLabelClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  return (
    <div className={`input-container select-container ${className}`} style={style}>
      <select ref={inputRef} name={name} value={value} onChange={onChange} className="select-field">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label htmlFor={name} onClick={handleLabelClick}>{label}</label>
    </div>
  );
};

const CheckBoxField = ({ label, name, checked, onChange, style, className }) => {
  return (
    <div
      className={`checkbox-container ${className}`}
      style={style}
      onClick={onChange} 
    >
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={(e) => e.stopPropagation()}
        className="checkbox-input"
      />
      <label htmlFor={name} className="checkbox-label">
        <span className="custom-checkbox"></span>
        {label}
      </label>
    </div>
  );
};

const DateField = ({ label, name, value, onChange, isDayDisabled = () => false, dayClassName = () => "", minDate, maxDate, style, className, readonly }) => {
  const [date, setDate] = useState(null);

  return (
    <div className={`basic-input-container ${className}`} style={style}>
      <label htmlFor={name}>{label}</label>
      <DatePicker
        showIcon
        closeOnScroll={true}
        showMonthDropdown
        useShortMonthInDropdown
        isClearable
        selected={value ? value : date}
        onChange={(date) => {onChange ? onChange(date) : setDate(date)}}
        filterDate={(date) => !isDayDisabled(date)}
        minDate={minDate} 
        maxDate={maxDate}
        dateFormat="dd.MM.yyyy"
        placeholderText="Click to select a date"
        className="custom-datepicker"
        dayClassName={dayClassName}
        calendarStartDay={1}
      />
    </div>
  );
};

const DateFieldRange = ({ label, name, startValue = null, endValue = null, onChange, isDayDisabled = () => false, minDate, maxDate, style, className, readonly }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  return (
    <div className={`basic-input-container ${className}`} style={style}>
      <label htmlFor={name}>{label}</label>
      <DatePicker
        showIcon
        closeOnScroll={true}
        selectsRange={true}
        showMonthDropdown
        useShortMonthInDropdown
        isClearable
        startDate={startValue ? startValue : startDate}
        endDate={endValue ? endValue : endDate}
        onChange={(update) => {onChange ? onChange(update) : setDateRange(update)}}
        filterDate={(date) => !isDayDisabled(date)}
        minDate={minDate} 
        maxDate={maxDate}
        dateFormat="dd.MM.yyyy"
        placeholderText="Click to select a date"
        className="custom-datepicker"
        calendarStartDay={1}
      />
    </div>
  );
};



const List = ({items}) => {
  return (
    <ul className="list-container">
      {items ? items.map((el, index) => <li key={index} className="list-item">{el}</li>) : ""}
    </ul>
  );
}

const Tooltip = ({children, posX, posY, visible}) => {
  return (
    <div 
    className="tooltip-container"
    style={{
      left: posX,
      top: posY
    }}
    >
      {children}
    </div>
  );
}
export {BasicInput, InputField, BasicSelect, SelectField, CheckBoxField, DateField, DateFieldRange, List, Tooltip}