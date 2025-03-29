import { React, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  const [user, setUser] = useState(null);

  // Subscribe to change of authorization status in Firebase
  useEffect(() => {
    const auth = getAuth();

    // onAuthStateChanged is triggered on any change (login, logout,
    // session recovery, etc.)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? firebaseUser : null);
    });

    // Unsubscribe on unmount
    return () => unsubscribe();
  }, []);

  return (
    <>

      <h1 className="cl-1">Table reservaition</h1>
      {/* A button that leads to either /sign up or /login */}
      <div className="action-button fnt-26" > 
        <Link className="link" to={user ? '/reservation' : '/login'}>Reserve my table today</Link>
      </div>

    </>
  )
}

export default WelcomePage;