import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import "../styles/page.css";

import { BasicInput, DateField } from "elements/BaseElements/baseElements";
import { TableSortLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';


const RaportointiAnalytiikka = () => {
    const navigate = useNavigate()
    const { email, role } = useSelector((state) => state.user)

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [tableNumber, setTableNumber] = useState("")
    const [clientName, setClientName] = useState("")
    const [result, setResult] = useState([])
    const [sortConfig, setSortConfig] = useState({ key: "booking_start", direction: "asc" })
    const [top, setTop] = useState(5)


    useEffect(() => {
        if (!email || role !== "admin") {
            navigate("/home");
        }
    }, [email, role, navigate]);

    const handleStats = async () => {
        try {
            let sDate = startDate
            let eDate = endDate

            if (startDate){
                sDate = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
            }

            if (endDate){
                eDate = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
            } 


            const response = await fetch("http://localhost:5002/stats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate : sDate,
                    endDate : eDate,
                    tableNumber,
                    clientName
                })
            })

            if (!response.ok) throw new Error("Failed to handle stats")

            const data = await response.json();
            setResult(data);

        } catch (error) {
            console.error("Error fetching stats", error)
        }
    }

    // sorting the result array based on the selected sorting key and direction
    const sortedResults = useMemo(() => {
        return [...result].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? -1 : 1
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? 1 : -1
            }
            return 0
        })
    }, [result, sortConfig])

    //toggles sorting direction when clicking on the same column, otherwise sets a new sorting key
    const requestSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }))
    }

    const analyzeData = (data) => {
        const tableCounts = {} // Stores the count of reservations per table
        const clientCounts = {}
        const timeCounts = {}
        const dateCounts = {}

        data.forEach(({ booking_start, id_table, first_name, last_name }) => {
            const time = booking_start ? booking_start.slice(11, 16) : "Unknown" // booking time HH:MM
            const date = booking_start ? booking_start.slice(0, 10) : "Unknown" // booking date YYYY-MM-DD
            const client = `${first_name} ${last_name}`

            // Count occurrences for each category
            tableCounts[id_table] = (tableCounts[id_table] || 0) + 1 // If id_table is already in tableCounts, get the current count. If it is not, set the initial value to 0.
            clientCounts[client] = (clientCounts[client] || 0) + 1
            timeCounts[time] = (timeCounts[time] || 0) + 1
            dateCounts[date] = (dateCounts[date] || 0) + 1
        });

        // Get the top N most frequent occurrences in each category
        const topTables = Object.entries(tableCounts).sort((a, b) => b[1] - a[1]).slice(0, top)
        const topClients = Object.entries(clientCounts).sort((a, b) => b[1] - a[1]).slice(0, top)
        const topTimes = Object.entries(timeCounts).sort((a, b) => b[1] - a[1]).slice(0, top)
        const topDates = Object.entries(dateCounts).sort((a, b) => b[1] - a[1]).slice(0, top)

        return { topTables, topClients, topTimes, topDates }
    };

    // Memoizes analytics results to prevent unnecessary recalculations when dependencies change
    const analytics = useMemo(() => analyzeData(result), [result, top])


    return (
        <div className="analytic-page">
            <div className="filters-wrapper">
                <h3 className="title text-center">Filters</h3>
                <div className="filters-content">
                    <div className="filter-item"><DateField label="Start date" value={startDate} onChange={setStartDate} /></div>
                    <div className="filter-item"><DateField label="End date" value={endDate} onChange={setEndDate} /></div>
                    <div className="filter-item"><BasicInput label="Table number" type="number" value={tableNumber} onChange={e => setTableNumber(Number(e.target.value))} /></div>
                    <div className="filter-item"><BasicInput label="Client name" type="text" value={clientName} onChange={e => setClientName(e.target.value)} /></div>
                    <div className="filter-item button"><button className="action-button fnt-22" onClick={handleStats}>Search</button></div>
                </div>
                
                
            </div>
            <div className="report-analytic-wrapper">
                <div className="analytic-wrapper">
                    <div className="top-wrapper title">
                        <h3>Analytics Top-</h3>
                        <div className="top-input-wrapper">
                            <BasicInput type="number" className="top-input" value={top} onChange={e => setTop(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="analytic-content">
                        <div className="analytic-block">
                            <h4>Top most booked tables</h4>
                            <ul>{analytics.topTables.map(([table, count]) => <li key={table}>Table {table}: {count} times</li>)}</ul>
                        </div>
                        <div className="analytic-block">
                            <h4>Top clients</h4>
                            <ul>{analytics.topClients.map(([client, count]) => <li key={client}>{client}: {count} times</li>)}</ul>
                        </div>
                        <div className="analytic-block">
                            <h4>Top booking times</h4>
                            <ul>{analytics.topTimes.map(([time, count]) => <li key={time}>{time}: {count} times</li>)}</ul>
                        </div>
                        <div className="analytic-block">
                            <h4>Top booking dates</h4>
                            <ul>{analytics.topDates.map(([date, count]) => <li key={date}>{date}: {count} times</li>)}</ul>
                        </div>
                    </div>
                </div>

                <div className="report-wrapper">
                    <h3 className="title">Report</h3>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel active={sortConfig.key === "booking_start"} direction={sortConfig.direction} onClick={() => requestSort("booking_start")}>
                                            Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel active={sortConfig.key === "id_table"} direction={sortConfig.direction} onClick={() => requestSort("id_table")}>
                                            Table
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel active={sortConfig.key === "first_name"} direction={sortConfig.direction} onClick={() => requestSort("first_name")}>
                                            Client
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedResults.map((item, index) => {
                                    const bookingDate = item.booking_start ? item.booking_start.replace("T", " ").slice(0, 16) : "N/A";
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{bookingDate}</TableCell>
                                            <TableCell>{item.id_table}</TableCell>
                                            <TableCell>{`${item.first_name} ${item.last_name}`}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    )
}

export default RaportointiAnalytiikka;