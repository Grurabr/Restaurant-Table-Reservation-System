import React, { useState, useEffect } from "react";
import { CheckBoxField, InputField, SelectField } from "../BaseElements/baseElements";


// Widjet for creating rooms
const CreateRoomWidget = ({ createRoom }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [floor, setFloor] = useState("1");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim() !== "") {
      createRoom(floor, name );
      setIsOpen(false);
      setFloor("1");
      setName("");
    }
  };

  return (
    <>
      <button className="add-table-btn" onClick={() => setIsOpen(true)}>
        Add room
      </button>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content new-room-popup">
            {/* Close button */}
            <button className="close-icon" onClick={() => setIsOpen(false)}>
              ✖
            </button>
            <h2>Uusi sali</h2>
            <div className="list-of-tables">
              <SelectField
                label="Floor"
                value={floor}
                onChange={(event) => setFloor(event.target.value)}
                options={Array.from({ length: 12 }, (_, i) => i - 1).map((num) => ({
                  value: num.toString(),
                  label: num === -1 ? "Basement (-1)" : `Floor ${num}`,
                }))}
                className={'floor-selector'}
              />
              <InputField
                label="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={'room-input'}
              />
            </div>

            <div className="actions">
              <button
                className="action-button"
                onClick={handleSubmit}
                disabled={name.trim() === ""}
              >
                Create room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// Widjet for adding tables into room
const TableWidget = ({ tables, elements, room, addTables }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);
  const [tableElements, setTableElements] = useState({});
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (step === 2) {
      setTableElements((prev) => {
        const updated = { ...prev };
        selectedTables.forEach((id_table) => {
          if (!updated[id_table]) {
            const table = tables.find((t) => t.id_table === id_table);
            const els = elements.filter((el) => el.capacity >= table.capacity);
            updated[id_table] = els[0]?.id_element || "";
          }
        });
        return updated;
      });
    }
  }, [step, selectedTables, tables, elements]);

  const toggleTableSelection = (id_table) => {
    setSelectedTables((prev) =>
      prev.includes(id_table) ? prev.filter((id) => id !== id_table) : [...prev, id_table]
    );
  };

  const handleElementSelection = (id_table, id_element) => {
    console.log('handle change');
    setTableElements((prev) => ({ ...prev, [id_table]: id_element }));
  };

  const handleSubmit = () => {
    const result = selectedTables.map((id_table) => {
      const table = tables.find((t) => t.id_table === id_table);
      return {
        table: table,
        id_element: tableElements[id_table] || elements[0]?.id_element,
      };
    });
    addTables(result, room.id_room);
    setIsOpen(false);
    setSelectedTables([]);
    setTableElements({});
    setStep(1);
  };

  return (
    <>
      <button className="add-table-btn" onClick={() => setIsOpen(true)}>Add tables</button>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            {/* Кнопка закрытия */}
            <button className="close-icon" onClick={() => setIsOpen(false)}>✖</button>
            <h4>Add tables in the room {room.floor} - {room.name}</h4>

            {step === 1 && (
              <div>
                {tables.length === 0 ? (
                  <p>All tables are already in the schema</p>
                ) : (
                  <div className="list-of-tables">
                    {tables.map((table) => (
                      <div className="table-item" key={table.id_table}>
                        <CheckBoxField 
                          label={`Table ${table.number} (cap. ${table.capacity})`}
                          checked={selectedTables.includes(table.id_table)}
                          onChange={() => toggleTableSelection(table.id_table)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {tables.length > 0 && (
                  <div className="actions">
                    <button
                      className="action-button"
                      onClick={() => setStep(2)}
                      disabled={selectedTables.length === 0}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="list-of-tables-elements">
                {selectedTables.map((id_table) => {
                  const table = tables.find((t) => t.id_table === id_table);
                  const els = elements.filter((el) => el.capacity >= table.capacity);

                  return (
                      <div key={id_table} className="element-selection">
                        <span>{`Table ${id_table} (capacity: ${table.capacity}) >`}</span>
                        <SelectField
                          label="elementti"
                          value={tableElements[id_table] || ""}
                          onChange={(event) => handleElementSelection(id_table, event.target.value)}
                          options={els.map((el) => ({ value: el.id_element, label: `Element ${el.id_element} (cap. ${el.capacity})` }))}
                          className={'element-selector'}
                        />
                        </div>
                  );
                })}
                </div>
                <div className="actions">
                  <button className="cancel-button" onClick={() => setStep(1)}>Previous</button>
                  <button className="action-button" onClick={handleSubmit}>Add tables</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Widjet for set scale
function ScaleWidjet({scale, setScale}) {
    return (
        <div className='scale'>
            <div className='dropdown'>
                <div className='scale-text'>{Math.round(scale * 100)}%</div>
                <div className='dropdown-content scale-content'>
                    <button className='dropdown-item scale-value' onClick={() => setScale(0.5)}>50%</button>
                    <button className='dropdown-item scale-value' onClick={() => setScale(1)}>100%</button>
                    <button className='dropdown-item scale-value' onClick={() => setScale(1.5)}>150%</button>
                    <button className='dropdown-item scale-value' onClick={() => setScale(2)}>200%</button>
                </div>
            </div>
         </div>
    );
}
  
// Delete room
const DeleteRoom = ({room, deleteRoom}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (e) => {
    deleteRoom(room);
    setIsOpen(false);
  }

  return (
    <>
      <button className="delete-button" onClick={() => setIsOpen(true)}>
        Delete
      </button>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            {/* Close button */}
            <button className="close-icon" onClick={() => setIsOpen(false)}>
              ✖
            </button>
            <h4>{`Room "${room.name}" (id:${room.id_room})`}</h4>
            <span>After deleting, all tables in the room will switch to unused mode. They can be added to another room using the "Add tables" button</span>
            <div className="actions">
              <button
                className="action-button delete-button"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Delete table window
const DeleteTable = ({element, table, deleteFromSchema, deleteAtAll}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (action) => {
    if (action === 'all') deleteAtAll(element, table);
    else deleteFromSchema(element);
    setIsOpen(false);
  };

  return (
    <>
      <button className="delete-button" onClick={() => setIsOpen(true)}>
        Remove
      </button>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            {/* Close button */}
            <button className="close-icon" onClick={() => setIsOpen(false)}>
              ✖
            </button>
            <h4>{`Table ${table.number} (id:${table.id_table})`}</h4>
            <div className="actions">
              <button
                className="action-button"
                onClick={() => handleSubmit()}
              >
                Remove from schema
              </button>
              <button
                className="action-button delete-button"
                onClick={() => handleSubmit('all')}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Elements settings
const ElementSettings = ({ element, elementsList, tablesList, updateElement, saveElement, deleteFromSchema, deleteAtAll }) => {
    const [tempElement, setTempElement] = useState(element);
    const [table, setTable] = useState();
    const [tableSettings, setTableSettings] = useState({
      id_table: null,
      number: null,
      capacity: null,
      neighboring_tables: []
    })

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      
      const newTempElement = { ...tempElement, [name]: Number(value) };
      setTempElement(newTempElement);
      updateElement(newTempElement, tableSettings);
    };

    const handleTableSettChange = (e) => {
      const { name, value } = e.target;
      let newValue;

      // Neighbouring tables
      if (name === "neighboring_tables") {newValue = value.split(",").map(s => s.trim())}
      else if (name === "capacity") {newValue = Number(value)}
      else (newValue = value)

      const newTableSettings = { ...tableSettings, [name]: newValue };
      setTableSettings(newTableSettings);
      updateElement(tempElement, newTableSettings);
    };

    const resetChanges = () => {
      setTempElement(element);
      setTableSettings(table);
      updateElement(element, table);
    }
    
    // Set temp element
    useEffect(() => {
      setTempElement(element);
      if (element?.id_table) {
        const table = tablesList.find((table) => table.id_table == element.id_table);
        setTable(table);
        setTableSettings(table);
      }
    }, [element]);

    if (!element || !tempElement) return <div className="settings-content">Valitse elementti</div>;
    return (
        <div className="settings-content">
        {"id_table" in element ? (
            <>
            <SelectField
                label="Element"
                name="id_element"
                value={tempElement.id_element}
                options={elementsList.map((el) => ({ value: el.id_element, label: `Element ${el.id_element}` }))}
                onChange={handleInputChange}
            />
            <InputField label="Number" name="number" value={tableSettings.number || ""} onChange={handleTableSettChange} />
            <InputField label="Capacity" type="number" name="capacity" value={tableSettings.capacity || ""} onChange={handleTableSettChange} />
            <InputField label="Neighboring tables" name="neighboring_tables" value={tableSettings.neighboring_tables?.join(", ") || ""} onChange={handleTableSettChange} />
            </>
        ) : (
            <>
            <InputField label="Width" type="number" name="width" value={tempElement.width || 0} onChange={handleInputChange} />
            <InputField label="Height" type="number" name="height" value={tempElement.height || 0} onChange={handleInputChange} />
            </>
        )}
        <InputField label="X" type="number" name="coor_x" value={tempElement.coor_x} onChange={handleInputChange} />
        <InputField label="Y" type="number" name="coor_y" value={tempElement.coor_y} onChange={handleInputChange} />
        <InputField label="Rotation" type="number" name="rotation" value={tempElement.rotation} min="-180" max="180" onChange={handleInputChange} />
        <button className="save-button" onClick={() => saveElement(tempElement, tableSettings)}>Save changes</button>
        <button className="cancel-button" onClick={resetChanges}>Undo changes</button>
        <DeleteTable element={element} table={tableSettings} deleteFromSchema={deleteFromSchema} deleteAtAll={deleteAtAll} />
        </div>
    );
};
// Room settings
const RoomSettings = ({ room, saveRoom, deleteRoom }) => {
    const [tempRoom, setTempRoom] = useState(room);

    useEffect(() => {
      setTempRoom(room);
    }, [room])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempRoom({ ...tempRoom, [name]: value });
    };

    const resetChanges = () => setTempRoom(room);

    return (
        <div className="settings-content">
        <SelectField
            label="Floor"
            name="floor"
            value={tempRoom.floor}
            options={Array.from({ length: 12 }, (_, i) => i - 1).map((floor) => ({ value: floor, label: floor }))}
            onChange={handleInputChange}
        />
        <InputField label="Name" name="name" value={tempRoom.name} onChange={handleInputChange} />
        <button className="save-button" onClick={() => saveRoom(tempRoom)}>Save changes</button>
        <button className="cancel-button" onClick={resetChanges}>Undo changes</button>
        <DeleteRoom room={room} deleteRoom={deleteRoom} />
        </div>
    );
};
// Widjet for setting the element and the room
const SettingsWidget = ({ element, elementsList, room, updateElement, saveElement, deleteFromSchema, deleteAtAll, saveRoom, deleteRoom, tablesList }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState("element");

    return (
      <div className="settings">
        <div className="settings-btn-wrapper">
          <button className="settings-btn" onClick={() => setIsOpen(!isOpen)}>
            ...
          </button>
        </div>
        {isOpen && (
            <div className="settings-wrapper">
            <div className="tabs">
                <button className={`tab ${tab === "element" ? "active" : ""} settings-tab`} onClick={() => setTab("element")}>Elementti</button>
                <button className={`tab ${tab === "room" ? "active" : ""} settings-tab`} onClick={() => setTab("room")}>Sali</button>
            </div>
            {tab === "element" ? <ElementSettings element={element} elementsList={elementsList} tablesList={tablesList} updateElement={updateElement} saveElement={saveElement} deleteFromSchema={deleteFromSchema} deleteAtAll={deleteAtAll} /> : <RoomSettings room={room} saveRoom={saveRoom} deleteRoom={deleteRoom}/>}
            </div>
        )}
      </div>
    );
};

export {TableWidget, ScaleWidjet, SettingsWidget, CreateRoomWidget};
