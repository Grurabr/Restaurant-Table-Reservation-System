import "../styles/auth.css";
import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "store/slices/userSlice";
import { InputField } from "elements/BaseElements/baseElements";
import { toast } from "react-toastify";

const AuthPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");

    const auth = getAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Defining the tab when loading the page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab === "register") {
            setActiveTab("register");
        } else if (tab === "reset") {
            setActiveTab("reset");
        } else {
            setActiveTab("login");
        }
    }, [location]);

    // Handle login
    const handleLogin = async () => {
        try {
            // Check if there is such an email in the system.
            const response = await fetch("http://localhost:5002/getUserRole", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email }),
            });

            if (!response.ok) {
                setErrorMessage("No user found with this email");
                return;
            };
            
            // Check users password match
            const { user } = await signInWithEmailAndPassword(auth, email, password);

            // Get user role
            const data = await response.json();
            const userRole = data.role;

            dispatch(setUser({ email: user.email, id: user.uid, token: user.accessToken, role: userRole }));

            localStorage.setItem("email", user.email);
            localStorage.setItem("token", user.accessToken);
            localStorage.setItem("id", user.uid);
            localStorage.setItem("role", userRole);

            navigate("/home");
        } catch (error) {
            if (error.code === "auth/invalid-credential") {
                setErrorMessage("Incorrect password");
            } else if (error.code === "auth/missing-password") {
                setErrorMessage("Password required!")
            } else {
                setErrorMessage("Login failed, try again later");
            }
        }
    };

    // Handle registration
    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        if (!name || !surname || !phone) {
            setErrorMessage("All fields are required.");
            return;
        }

        try {
            // Create new user
            const formData = { firstname: name, lastname: surname, phone, email };

            const response = await fetch('http://localhost:5002/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            // Duplicate email
            if (!response.ok) {
                const data = await response.json();
                if (data.error.code === "ER_DUP_ENTRY") setErrorMessage("User with this email already exists");
                return;
            }

            // Add user-password pair
           const { user } = await createUserWithEmailAndPassword(auth, email, password);

           // Get role
            const roleResponse = await fetch("http://localhost:5002/getUserRole", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!roleResponse.ok) throw new Error("Failed to fetch user role");

            const { role } = await roleResponse.json();

            dispatch(setUser({ email: user.email, id: user.uid, token: user.accessToken, role }));

            // Success message
            toast.success('Profile submitted successfully');
            navigate('/home');

        } catch (error) {
            setErrorMessage("Register failed, try again later");
        }
    };

    // Handle password reset
    const handleReset = () => {
        sendPasswordResetEmail(auth, email)
        .then(() => alert("Check your email for password reset instructions."))
        .catch((error) => {
            setErrorMessage("Something went wrong. Plese try again later");
        });
    };

    return (
        <div className="auth-container">
            {/* Tabs */}
            <div className="auth-tabs">
                <div className={`auth-tab ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>
                    Sign In
                </div>
                <div className={`auth-tab ${activeTab === "register" ? "active" : ""}`} onClick={() => setActiveTab("register")}>
                    Sign Up
                </div>
                <div className={`auth-tab ${activeTab === "reset" ? "active" : ""}`} onClick={() => setActiveTab("reset")}>
                    Reset Password
                </div>
            </div>

            {/* Login Form */}
            <div className={`auth-form ${activeTab === "login" ? "active" : ""}`}>
                <h2 className="tab-title">Sign In</h2>
                <InputField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button className="action-button" onClick={handleLogin}>Login</button>
            </div>

            {/* Registration Form */}
            <div className={`auth-form ${activeTab === "register" ? "active" : ""}`}>
                <h2 className="tab-title">Sign Up</h2>
                <InputField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <InputField type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <InputField type="text" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <InputField type="text" label="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                <InputField type="tel" label="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button className="action-button" onClick={handleRegister}>Register</button>
            </div>

            {/* Password Reset Form */}
            <div className={`auth-form ${activeTab === "reset" ? "active" : ""}`}>
                <h2 className="tab-title">Reset Password</h2>
                <InputField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button className="action-button" onClick={handleReset}>Reset Password</button>
            </div>
        </div>
    );
};

export default AuthPage;
