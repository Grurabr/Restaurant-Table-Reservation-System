import "../../styles/restaurantLayout.css";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState, useRef, useEffect, forwardRef } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { TableWidget, ScaleWidjet, SettingsWidget, CreateRoomWidget } from './boardComponents';
import { SelectField } from '../BaseElements/baseElements';
import elementsSVG  from './elementsSVG.json'; // Json file with elements svgs

// SVG component to render SVG elements with text
const ElementSVG = forwardRef(({svgCode, text, color, style, interaction=true, disabled, active}, ref) => {
    let styleClass; // Styles class
    if (disabled) styleClass = 'element-svg-wrapper-disabled';
    else if (active) styleClass = 'element-svg-wrapper-active';
    else styleClass = 'element-svg-wrapper';

    return (
        <div ref={ref} className={`${styleClass}` + ((interaction && !disabled) ? ' element-for-interaction' : '')} >
            <div  className='element-svg' style={style} preserveAspectRatio="xMidYMid meet" dangerouslySetInnerHTML={{ __html: svgCode }} />
            <span className='element-svg-text' color={color}>{text}</span>
        </div>
    );
});

// Button to drag and drop elements onto the board
function ElementBtn({id_el, name}) {
    const svg = elementsSVG.svgs.find((el) => el.id === name)?.svg;
    const svgCode = svg ? svg.join("\n"): ""; // Svg from json file

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
        type: "ELEMENT", // Draggable element type
        item: { id_el }, // Item being dragged
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(), // Monitoring dragging state
        })
        }),
        []
    );

    return (
        <div className='element-btn'>
            <ElementSVG ref={dragRef} text={id_el} color={'brown'} svgCode={svgCode} interaction={false}/>
        </div>
    );
}

// Board element
function Element({ number, id_element, name, id_table, number_table, x, y, rotation, width, height, onMouseDown, onDoubleClick, disabled=false, active=false }) {
    const svg = elementsSVG.svgs.find((el) => el.id === name)?.svg;
    const svgCode = svg?.join("\n"); // Svg from json file

    return (
        <div
            onMouseDown={(e) => onMouseDown(e, number)}
            className='element'
            style={{
                width: width,
                left: x,
                top: y,
            }}
        >
           <ElementSVG text={number_table} color={'brown'} svgCode={svgCode} style={{transform: `rotate(${rotation}deg)`}} disabled={disabled} active={active} />
        </div>
    );
}

// User schema Element
function ElementState({ number, id_element, name, id_table, number_table, x, y, rotation, width, height, onClick, disabled = false, active=false }) {
    const svg = elementsSVG.svgs.find((el) => el.id === name)?.svg;
    const svgCode = svg?.join("\n"); // Svg from json file

    const handleClick =(e) => {
        if (disabled) return;
        onClick(e, id_table);
    }

    return (
        <div
            onClick={handleClick}
            className='element-state'
            style={{
                width: width,
                left: x,
                top: y,
            }}
        >
           <ElementSVG text={number_table} color={'brown'} svgCode={svgCode} style={{transform: `rotate(${rotation}deg)`}} disabled={disabled} active={active}/>
        </div>
    );
}

// Canva
const Canva = forwardRef(({boardElements, handleMouseDown, handleMouseMove, handleMouseUp, handleClick, availableTables, activeTables, elements, tables}, ref) => {
    // Get state element
    const getStateElement = (element) => {
        if (!element) return(<></>);
        const available = availableTables?.find((table) => table.id_table == element.id_table);
        const active = activeTables?.find((table) => table.id_table == element.id_table);
        const el = elements.find((el) => el.id_element == element.id_element);
        const table = tables?.find((table) => table.id_table == element.id_table);

        return (
            <ElementState
            key={element.number}
            number={element.number}
            id_element={element.id_element}
            name={el ? el.name : ""}
            id_table={element.id_table}
            number_table={table ? table.number : ""}
            x={element.coor_x}
            y={element.coor_y}
            rotation={element.rotation}
            width={element.width}
            height={element.height}
            onClick={handleClick}
            disabled={available ? false : true}
            active={active ? true : false}
        />);
    }

    // get darggable element
    const getElement = (element) => {
        if (!element) return(<></>);
        const el = elements.find((el) => el.id_element == element.id_element);
        const table = tables?.find((table) => table.id_table == element.id_table);
                
        return (
            <Element
            key={element.number}
            number={element.number}
            id_element={element.id_element}
            name={el ? el.name : ""}
            id_table={element.id_table}
            number_table={table ? table.number : ""}
            x={element.coor_x}
            y={element.coor_y}
            rotation={element.rotation}
            width={element.width}
            height={element.height}
            onMouseDown={handleMouseDown}
        />);
    }

    return (
        <div
            ref={ref}
            className='canvas'
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            { availableTables ? 
            boardElements.map((element) => getStateElement(element)): 
            boardElements.map((element) => getElement(element))
            }
        </div>
    );
});

// Board that holds elements and handles their drag and drop
function Board({ scale, position, id_room, elements, tables, roomElements, setRoomElements, setAddedTables, lastTableId, setEditableElement}) {
    const boardRef = useRef(null);
    const [nro, setNro] = useState(0);
    const [dragging, setDragging] = useState(null);

    // Set last numero of element
    useEffect(() => {
        //console.log(roomElements);
        setNro(roomElements.length);
    }, [roomElements]);

    // Drop
    const [{}, drop] = useDrop({
        accept: "ELEMENT",
        drop: (item, monitor) => {
            // The boardRef is not ready yet
            if (!boardRef.current) {return;}
        
            const offset = monitor.getSourceClientOffset();
            const boardRect = boardRef.current.getBoundingClientRect();
        
            if (!offset) return;

            // Coordinates
            const x = (offset.x - boardRect.left) / scale;
            const y = (offset.y - boardRect.top) / scale;
            
            // New element
            let element = { number: nro, id_room: id_room, id_element: item.id_el, id_table: null, coor_x: x, coor_y: y, rotation: 0, width: 150, height: 150};
            setNro(nro + 1);
  
            // Set new Table
            const el = elements.find((element) => element.id_element === item.id_el);
                if (el.role === 'table') {
                    element.id_table = lastTableId;
                    setAddedTables(element);// Add in added table list
                }
            setRoomElements(id_room, [...roomElements, element]); // Set elements
        },
    });

    // Handler for the start of dragging an element
    const handleMouseDown = (event, number) => {
        event.stopPropagation();
        setEditableElement(number); // Edit element on click

        const element = roomElements.find(el => el.number == number);
        setDragging({
            number: number,
            offsetX: (event.clientX - position.x) / scale - element.coor_x,
            offsetY: (event.clientY - position.y) / scale - element.coor_y,
            lastX: event.clientX,
            lastY: event.clientY,
            width: element.width,
            height: element.height
        });
    };

    // The movement handler
    const handleMouseMove = (event) => {
        if (!dragging) return;
        event.stopPropagation();
        setEditableElement(-1); // Prevent edit on dragging 

        // Calculate new positions
        let newX = (event.clientX - position.x) / scale - dragging.offsetX;
        let newY = (event.clientY - position.y) / scale - dragging.offsetY;

        // Get board's boundaries
        const boardRect = boardRef.current.getBoundingClientRect(); // Get the size and position of the board
        const elementWidth = dragging.width;  // element width
        const elementHeight = dragging.height; // element height

        // Restrict newX to be within the board's left and right bounds
        newX = Math.max(0, Math.min(newX, (boardRect.width/scale - elementWidth)));

        // Restrict newY to be within the board's top and bottom bounds
        newY = Math.max(0, Math.min(newY, (boardRect.width/scale - elementHeight)));

        setRoomElements(id_room, roomElements.map((el) => el.number === dragging.number ? { ...el, coor_x: newX, coor_y: newY } : el));

        setDragging(prev => ({ ...prev, lastX: event.clientX, lastY: event.clientY }));
    };

    // Completing the dragging
    const handleMouseUp = () => {
        setDragging(null);
    };

    return (
        <Canva 
            ref={(node) => {
            boardRef.current = node;
            drop(node);
            }} 
            elements={elements}
            tables={tables}
            boardElements={roomElements}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
        />
    );
}

// Wrapper for the board that handles scaling and dragging the board itself
function BoardWrapper(props) {
    return (
        <div
            className='canvas'
            style={{
                transform: `scale(${props.scale}) translate(${props.position.x}px, ${props.position.y}px)`,
                transformOrigin: "0 0",
            }}
            onMouseDown={props.handleBoardMouseDown}
            onMouseMove={props.handleBoardMouseMove}
            onMouseUp={props.handleBoardMouseUp}
            onMouseLeave={props.handleBoardMouseUp}
        >
            {props.draggableElements ? 
            <Board scale={props.scale} position={props.position} id_room={props.id_room} roomElements={props.roomElements} setRoomElements={props.setRoomElements} setAddedTables={props.setAddedTables} elements={props.elements} tables={props.tables} lastTableId={props.lastTableId} setEditableElement={props.setElement}/> :
            <Canva elements={props.elements} tables={props.tables} boardElements={props.roomElements} availableTables={props.availableTables} activeTables={props.activeTables} handleClick={props.handleClick}/>}
        </div>
    );
}

// Board Widjet
function BoardWidjet(props) {
    const [scale, setScale] = useState(1); // Scale of the board
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Position of the board
    const [draggingBoard, setDraggingBoard] = useState(false); // Is the board being dragged?
    const [boardPosition, setBoardPosition] = useState({ x: 0, y: 0 }); // Board drag position
    const [element, setElement] = useState(null); // Element for editing
    const layoutRef = useRef(null);

    // Initial board position calculation after first render
    useEffect(() => {
        const layoutRect = layoutRef.current.getBoundingClientRect();
        const boardWidth = 5000 * scale;
        const boardHeight = 5000 * scale;

        const initialX = (layoutRect.width - boardWidth) / 2;
        const initialY = (layoutRect.height - boardHeight) / 2;

        setPosition({
            x: initialX,
            y: initialY,
        });
    }, []); // Only on first render

    // Wheel event handler for scaling
    const handleWheel = (event) => {
        if (event.cancelable) {
            event.preventDefault();
        }

        setScale((prevScale) => {
            const newScale = prevScale - event.deltaY * 0.001; // Scale adjustment
            return Math.max(0.5, Math.min(3, newScale)); // Limit scale to 0.5 - 3
        });
    };

    // Handle dragging of the board
    const handleBoardMouseDown = (event) => {
        setDraggingBoard(true);
        setBoardPosition({
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        });
    };

    const handleBoardMouseMove = (event) => {
        if (!draggingBoard) return;

        const layoutRect = layoutRef.current.getBoundingClientRect();
        const boardWidth = 5000; // Width 
        const boardHeight = 5000; // Height

        // Constraints to prevent moving the board out of bounds
        let newX = event.clientX - boardPosition.x;
        let newY = event.clientY - boardPosition.y;

        // Horizontal restriction
        if (newX > 0) newX = 0; // Cannot move beyond the right edge
        if (newX < layoutRect.width / scale - boardWidth) newX = layoutRect.width / scale - boardWidth;

        // Vertical restriction
        if (newY > 0) newY = 0; // Cannot move beyond the bottom edge
        if (newY < layoutRect.height / scale - boardHeight) newY = layoutRect.height / scale - boardHeight;

        setPosition({ x: newX, y: newY });
    };

    const handleBoardMouseUp = () => {
        setDraggingBoard(false);
    };

    // Set editable element
    const setEditableElement = (number) => {
        const el = (number != -1) ? props.roomElements.find((element) => element.number === number) : null;
        setElement(el);
    }

    // Update Element's data
    const updateElementData = (element_, table_) => {
        // Room elements
        const roomElements = props.roomElements.map((el) => ((el.number == element_.number) ? element_ : el));
        props.setRoomElements(props.room.id_room, roomElements);
        // Table elements
        const tables = props.tables.map((table) => ((table.id_table == table_.id_table) ? table_ : table));
        props.setTables(tables);
    }

    // Save Element's data 
    const saveElementData = async (element_, table_) => {
        try {
            // Room elements
            await props.saveSchema();
            // Table elements
            const response = await axios.post("http://localhost:5002/update-table", table_);
            toast.success(response.data.message || `The data of the table ${table_.number} (id:${table_.id_table}) has been updated`);
        } catch (error) {
            console.error("Error during table's data update:", error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again later.');     
        }
        
    }

    // Save new Rooms's data
    const updateRoomData = async (room) => {
        try {
            // Update rooms data
            const response = await axios.post("http://localhost:5002/update-room", room);
            //console.log(response);
            props.editRoom(room);
            toast.success(response.data.message || `The data of the "${room.name}" room has been updated`);
        } catch (error) {
            console.error("Error during room's data update:", error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again later.');     
        }
    }

    // Delete room
    const deleteRoom = async (room) => {
        try {
            // Delete room from db
            const response = await axios.post("http://localhost:5002/delete-room", {id_room: room.id_room});
            // Load schema
            await props.loadSchema();
            toast.info(response.data.message || `The room ${room.name} (id:${room.id_room}) has been deleted`);
        } catch (error) {
            console.error('Error during deleting room:', error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again later.');     
        }
    }

    // Delete table from schema
    const deleteFromSchema = (element) => {
        //console.log('Delete from schema');
        props.deleteTable(props.room.id_room, element);
        setElement(null);
    }

    // Delete table at all
    const deleteAtAll = async (element, table) => {
        try {
            // Delete from db
            const response = await axios.post("http://localhost:5002/delete-table", {id_table: table.id_table, number: table.number });
            deleteFromSchema(element); // Delete from schema
            toast.info(response.data.message || `The table ${table.number} (id:${table.id_table}) has been deleted`);
        } catch (error) {
            console.error('Error during deleting table:', error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again later.');     
        }
    }

    if (props.roomElements === undefined) return (<div>Loading ...</div>);

    return (
        <div
            ref={layoutRef}
            onWheel={handleWheel}
            className='canvas-container'
        >
            {props.role == 'admin' ? (
            <>
                <BoardWrapper 
                    handleBoardMouseDown={handleBoardMouseDown}
                    handleBoardMouseMove={handleBoardMouseMove}
                    handleBoardMouseUp={handleBoardMouseUp}
                    setElement={setEditableElement}
                    draggableElements={true} 
                    scale={scale} 
                    position={position} 
                    id_room={props.room.id_room} 
                    roomElements={props.roomElements} 
                    setRoomElements={props.setRoomElements} 
                    setAddedTables={props.setAddedTables} 
                    elements={props.elements} 
                    tables={props.tables} 
                    lastTableId={props.lastTableId} 
                />
                <SettingsWidget room={props.room} element={element} elementsList={props.elements} tablesList={props.tables} updateElement={updateElementData} saveElement={saveElementData} deleteFromSchema={deleteFromSchema} deleteAtAll={deleteAtAll} saveRoom={updateRoomData} deleteRoom={deleteRoom}/>
            </>
            ) : (
                <BoardWrapper 
                    handleBoardMouseDown={handleBoardMouseDown}
                    handleBoardMouseMove={handleBoardMouseMove}
                    handleBoardMouseUp={handleBoardMouseUp}
                    scale={scale} 
                    position={position} 
                    id_room={props.room.id_room} 
                    elements={props.elements}
                    tables={props.tables}
                    roomElements={props.roomElements} 
                    availableTables={props.availableTables}
                    activeTables={props.activeTables}
                    handleClick={props.handleClick}
                />
            )}
            <ScaleWidjet scale={scale} setScale={setScale} />
        </div>
    );
}

// Admin widjet for editing schema
function RestaurantLayoutWidjet() {
    // List of floors and elements
    const [rooms, setRooms] = useState([{id_room: 1, floor: 1, name: 'First floor'}]);
    const [elements, setElements] = useState([]);
    const [tables, setTables] = useState([]);
    const [layoutSchema, setLayoutSchema] = useState([]);
    const [roomElements, setRoomElements] = useState({1: []});
    const [unusedTables, setUnusedTables] = useState([]);
    const [room, setRoom] = useState(rooms[0]);
    const [addedTables, setAddedTables] = useState([]);
    const [tableId, setTableId] = useState(1);

    useEffect(() => {
        loadElements();
        loadSchema();
    }, []);

    // Load elements
    const loadElements = async () => {
        const response = await axios.get("http://localhost:5002/load-elements");
        setElements(response.data.elements);
        //console.log(response.data.elements);
        setTables(response.data.tables);
        setTableId(response.data.tables ? response.data.tables[response.data.tables.length - 1].id_table + 1 : 1);
    };

    // Load schema, rooms and unusedTables
    const loadSchema = async () => {
        const response = await axios.get("http://localhost:5002/load-schema");
        setLayoutSchema(response.data.layoutSchema);
        setRooms(response.data.rooms);
        setUnusedTables(response.data.unusedTables);
        setData(response.data.layoutSchema, response.data.rooms);
    };


    // Set data
    const setData = (layoutSchema_, rooms_) => {
        setRoomElements(() => {
            let roomElements = {};

            rooms_.map((room) => {
                let nro = 0;

                const elements = layoutSchema_.filter((element) => (element.id_room == room.id_room)).map((element) => {
                    const el = {...element, number: nro};
                    nro = nro + 1;
                    return el;
                })
                roomElements[room.id_room] = elements;
                return room;
            });

            return roomElements;
        });
        setRoom(rooms_[0]);
        setAddedTables([]);
    }

    // Save schema
    const saveSchema = async () => {
        let layoutElements = [];
        rooms.map((room) => {
            layoutElements = [...layoutElements, ...roomElements[room.id_room]];
        });
        //console.log(layoutElements);
        try {
            const response = await axios.post("http://localhost:5002/save-schema", { layoutElements, addedTables });
            setAddedTables([]);
            toast.success(response.data.message || 'The scheme is saved!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again later.');     
        }
        
    };


    const handleRoomElementsChange = (id_room, elements) => {
        setRoomElements({...roomElements, [id_room] : elements});
    }

    const addTable = (element) => {
        const table = {id_table: element.id_table, number:element.id_table, capacity: elements.find((el) => el.id_element === element.id_element).capacity, neighboring_tables: '', is_deleted: false};
        setAddedTables([...addedTables, table]);
        setTables([...tables, table]);
        setTableId(tableId + 1);
    }

    const deleteTableFromSchema = (id_room, element) => {
        const adTable = addedTables.find((table) => table.id_table === element.id_table);
        if (!adTable) {
            const table_ = tables.find((table) => table.id_table === element.id_table);
            setUnusedTables((prev) => [...prev, table_]); // Add into unused tables list
        }
        setAddedTables(addedTables.filter((table) => table.id_table !== element.id_table)); // delete from added tables

        // Modify list of elements
        let nro = 0;
        const roomEls = roomElements[id_room]
        .filter((el) => el.number !== element.number)
        .map((el) => {
            const newEl = {...el, number: nro};
            nro = nro + 1;
            return newEl
        });
        
        setRoomElements((prev) => ({...prev, [id_room] : roomEls})); // delete from schema
    }

    const addRoom = async (floor, name) => {
        const response = await axios.post("http://localhost:5002/create-room", { floor, name });
        setRooms((prev) => ([...prev, {id_room: response.data.id, floor: Number(floor), name: name}]));
        setRoomElements((prev) => ({...prev, [response.data.id] : []}));
    }

    const editRoom = (room) => {
        const rooms_ = rooms.map((r) => r.id_room === room.id_room ? room : r);
        setRooms(rooms_);
        setRoom(room);
    }

    const addTables = (tables, id_room) => {
        // List of rooms elements
        const existedElements = roomElements[id_room];
        // Params for new elements
        let nro = existedElements.length;
        let x = 5000/2 - 300;
        let y = 5000/2 - 300;

        // List of delted tables
        let deletedTables = [];

        // List of new elements
        const addedTables = tables.map((element) => {
            const table = element.table;
            // List of deleted tables
            if(table.is_deleted) deletedTables.push(table); 
            // element {number, id_room, id_element, id_table, coor_x, coor_y, rotation, width, height}
            const el = {number: nro, id_room: room.id_room, id_element: element.id_element, id_table: table.id_table, coor_x:x, coor_y:y, rotation: 0, width: 150, height: 150 };
            nro = nro + 1;
            x = x + 150;
            if (x > 5000/2 + 300) {
                y = y + 150;
                x = 5000/2 - 300;
            }
            return el;
        });

        // Add new elements
        setRoomElements((prev) => ({ ...prev, [room.id_room]: [...existedElements, ...addedTables] }));
        // Delete tables from unused tables list
        setUnusedTables((prev) => prev.filter((unTable) => {
            const exists = tables.find((table) => table.id_table === unTable.id_table);
            return exists ? false : true;
        }));
        // Add delted tables into added tables list
        setAddedTables((prev) => ([...prev, ...deletedTables]));
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className='canvasWidjet-wrapper'>
                <div className='elements-wrapper'>
                    <div className='elements-text cl-4'>Elements</div>
                    <div className='elements-content'>
                        {elements ? (
                        elements.map((element) => (
                        <ElementBtn
                            key={element.id_element}
                            id_el={element.id_element}
                            name={element.name}
                        /> ))) : (
                            <h2>Loading...</h2>
                        )
                        }
                    </div>
                </div>
                <div className='controlPanel-wrapper'>
                    <div className='controlPanel-content'>
                        <div className='room-tables-controls'>
                            <SelectField 
                                value={room.id_room}
                                options={rooms.map((room) => ({value: room.id_room, label: `${room.floor}. ${room.name}`}))}
                                onChange={(event) => setRoom(rooms.find((room) => (room.id_room == event.target.value)))}
                                className={'room-selector'}
                            />
                            <TableWidget tables={unusedTables} room={room} elements={elements} addTables={addTables}/>
                            <CreateRoomWidget createRoom={addRoom}/>
                        </div>
                        <div className='schema-controls'>
                            <button className='save-button' onClick={saveSchema}>Save schema</button>
                            <button className='save-button' onClick={loadSchema}>Load schema</button>
                        </div>
                    </div>
                </div>
                <div className='canvas-wrapper'>
                    <div className='canvas-content'>
                        <BoardWidjet role='admin' room={room} roomElements={roomElements[room.id_room]} setRoomElements={handleRoomElementsChange} editRoom={editRoom} deleteTable={deleteTableFromSchema} setAddedTables={addTable} elements={elements} tables={tables} setTables={setTables} lastTableId={tableId} saveSchema={saveSchema} loadSchema={loadSchema}/>
                    </div>
                </div>
            </div>
        </DndProvider>  
    );
}

// User function
function RestaurantSchema({availableTables, activeTables, handleClick}) {
    // List of floors and elements
    const [rooms, setRooms] = useState([{id_room: 1, floor: 1, name: 'First floor'}]);
    const [room, setRoom] = useState(rooms[0]);
    const [elements, setElements] = useState([]);
    const [tables, setTables] = useState([]);
    const [layoutSchema, setLayoutSchema] = useState([]);
    const [roomElements, setRoomElements] = useState({1: []});

    useEffect(() => {
        loadElements();
        loadSchema();
    }, []);

    // Load elements
    const loadElements = async () => {
        const response = await axios.get("http://localhost:5002/load-elements");
        setElements(response.data.elements);
        setTables(response.data.tables);
    };

    // Load schema, rooms
    const loadSchema = async () => {
        const response = await axios.get("http://localhost:5002/load-schema");
        setLayoutSchema(response.data.layoutSchema);
        setRooms(response.data.rooms);
        setData(response.data.layoutSchema, response.data.rooms);
    };

    // Set data
    const setData = (layoutSchema_, rooms_) => {
        setRoomElements(() => {
            let roomElements = {};

            rooms_.map((room) => {
                let nro = 0;

                const elements = layoutSchema_.filter((element) => (element.id_room == room.id_room)).map((element) => {
                    const el = {...element, number: nro};
                    nro = nro + 1;
                    return el;
                })
                roomElements[room.id_room] = elements;
                return room;
            });

            return roomElements;
        });
        setRoom(rooms_[0]);
    }

    return (
        <div className='restaurantSchema-wrapper'>
            <div className='controlPanel-wrapper'>
                <div className='controlPanel-content'>
                    <div className='room-tables-controls'>
                        <SelectField 
                            value={room.id_room}
                            options={rooms.map((room) => ({value: room.id_room, label: `${room.floor}. ${room.name}`}))}
                            onChange={(event) => setRoom(rooms.find((room) => (room.id_room == event.target.value)))}
                            className={'room-selector'}
                        />
                    </div>
                    <div className='schema-controls'>
                        <button className='save-button' onClick={loadSchema}>Load schema</button>
                    </div>
                </div>
            </div>
            <div className='canvas-wrapper'>
                <div className='canvas-content'>
                    <BoardWidjet room={room} roomElements={roomElements[room.id_room]} elements={elements} tables={tables} availableTables={availableTables} activeTables={activeTables} handleClick={handleClick}/>
                </div>
            </div>
        </div>
    );

}

export {ElementBtn, RestaurantLayoutWidjet, RestaurantSchema};