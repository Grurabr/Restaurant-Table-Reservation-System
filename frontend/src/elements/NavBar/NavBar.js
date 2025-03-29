import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "store/slices/userSlice";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/navbar.css"; // Import styles

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const { email, role } = useSelector((state) => state.user);
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        signOut(auth)
            .then(() => {
                dispatch(removeUser());
                localStorage.removeItem("email");
                localStorage.removeItem("token");
                localStorage.removeItem("id");
                localStorage.removeItem("role");
                navigate("/");
            })
            .catch((error) => {
                console.error("Error signing out: ", error);
            });
    };

    return (
        <nav className="navbar">
            {/* Navigation container */}
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="logo">My Restaurant</Link>

                {/* Navigation menu */}
                <ScrollableNavbar email={email} role={role} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                {email && 
                <div className="logout-button-wrapper">
                    <button className="logout-button" onClick={handleLogoutClick}>Logout</button>
                </div>}

                {/* Burger button */}
                <button className="burger-menu" onClick={() => setMenuOpen(!menuOpen)}>
                </button>
            </div>
        </nav>
    );
}

function ScrollableNavbar({email, role, menuOpen, setMenuOpen}) {
  const scrollContainerRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  useEffect(() => {
    const updateScrollButtons = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setCanScroll({
          left: container.scrollLeft > 0,
          right: container.scrollLeft < container.scrollWidth - container.clientWidth,
        });
      }
    };

    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, []);

  const scroll = (direction) => {
    scrollContainerRef.current?.scrollBy({ left: direction * 200, behavior: "smooth" });
  };

  return (
    <div className={`navbar-scroll-wrapper ${menuOpen ? "open" : ""}`}>
      {canScroll.left && (
        <button onClick={() => scroll(-2)} className="scroll-button left">
        </button>
      )}
      <div
        ref={scrollContainerRef}
        onScroll={() => setCanScroll({
          left: scrollContainerRef.current.scrollLeft > 0,
          right: scrollContainerRef.current.scrollLeft < scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth,
        })}
        className="navbar-scroll-container"
      >
        {/* Navigation menu */}
        <ul className={`nav-links`}>
            {!email ? (
                <>
                    <li onClick={() => setMenuOpen(false)}><Link to="/login?tab=login">Login</Link></li>
                    <li onClick={() => setMenuOpen(false)}><Link to="/login?tab=register">Sign Up</Link></li>
                </>
            ) : (
                <>
                    <li onClick={() => setMenuOpen(false)}><Link to="/home">Home</Link></li>
                    <li onClick={() => setMenuOpen(false)}><Link to="/edit">My information</Link></li>
                    <li onClick={() => setMenuOpen(false)}><Link to="/reservation">Book a table</Link></li>
                    {role === "admin" && <li onClick={() => setMenuOpen(false)}><Link to="/admin">Admin Panel</Link></li>}
                    {role === "admin" && <li onClick={() => setMenuOpen(false)}><Link to="/layout">Restaurant Schema</Link></li>}
                    {role === "admin" && <li onClick={() => setMenuOpen(false)}><Link to="/aukiolo">Manage schedule</Link></li>}
                    {role === "admin" && <li onClick={() => setMenuOpen(false)}><Link to="/raportointi">Analytics</Link></li>}
                </>
            )}
        </ul>
      </div>
      {canScroll.right && (
        <button onClick={() => scroll(2)} className="scroll-button right">
        </button>
      )}
    </div>
  );
}


export {NavBar};