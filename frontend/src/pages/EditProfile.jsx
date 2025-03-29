import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BasicInput } from "elements/BaseElements/baseElements";
import { toast } from "react-toastify";
import "../styles/page.css";


const EditPage = () => {
    const { email } = useSelector((state) => state.user);

    // Define state for form fields and submission status
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [phone, setPhone] = useState("");
    const [userData, setUserData] = useState("");


    //we get user data
    useEffect(() => {
        if (!email) {
            return;
        }

        const fetchUserData = async () => {
            try {

                const response = await fetch("http://localhost:5002/getUserParams", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json();
                //console.log(data)
                setFirstname(data.first_name);
                setLastname(data.last_name);
                setPhone(data.phone);
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [email]);


    // authentication check
    if (!email) {
        return <Navigate to="/login" />;
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        const formData = { firstname, lastname, phone, email };

        try {
            const response = await fetch("http://localhost:5002/updateUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            console.log(response);
            if (response.ok) toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again later.');
        }
    };



    return (
        <div className="content">
            <div className="info-wrapper">
                <h2 className="text-center title">My information</h2>
                {userData ? (
                    <div className="info-container">
                        <BasicInput className="info-email" label={"Email (read only):"} type="text" value={email} onChange={() => {}} readOnly />
                        <form onSubmit={handleProfileUpdate}>
                            <BasicInput label="First name:" type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
                            <BasicInput label="Last name:" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
                            <BasicInput label="Phone:" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            <button className="action-button fnt-22" type="submit">Change</button>
                        </form>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default EditPage;