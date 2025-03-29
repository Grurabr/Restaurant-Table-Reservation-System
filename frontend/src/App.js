import HomePage from 'pages/HomePage';
import Reservation from 'pages/ReservationPage';
import WelcomePage from 'pages/WelcomePage';
import AuthPage from 'pages/AuthPage';
import EditPage from 'pages/EditProfile';
import AdminPage from 'pages/AdminPage';
import RestaurantSchemaPage from 'pages/RestaurantSchema';
import Aukiolo from 'pages/AukioloaikojenHallinta'
import RaportointiAnalytiikka from 'pages/RaportointiAnalytiikka';
import EditReservation from './pages/EditReservation';

import { Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Layout from './elements/Layout/Layout';

import { useDispatch } from "react-redux";
import { setUser, removeUser } from "store/slices/userSlice";
import { Bounce, Flip, Slide, ToastContainer, Zoom } from "react-toastify";

function App() {

  const dispatch = useDispatch();
  //const { email } = useSelector((state) => state.user);
  const auth = getAuth();

  // Subscribe to change of authorization status in Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Проверяем локальное хранилище для роли
        const storedRole = localStorage.getItem("role") || "client";

        // Сохраняем данные пользователя в Redux
        dispatch(setUser({
          email: firebaseUser.email,
          id: firebaseUser.uid,
          token: firebaseUser.accessToken,
          role: storedRole
        }));

        // Сохраняем в localStorage
        localStorage.setItem("email", firebaseUser.email);
        localStorage.setItem("id", firebaseUser.uid);
        localStorage.setItem("token", firebaseUser.accessToken);
        localStorage.setItem("role", storedRole);
      } else {
        // Если пользователь выходит - очищаем Redux и localStorage
        dispatch(removeUser());
        localStorage.clear();
      }
    });

    return () => unsubscribe();
  }, [dispatch, auth]);

  return (
    <Layout>
      <Routes>
        <Route exact path="/" element={<WelcomePage />} />
        <Route exact path="/home" element={<HomePage />} />
        <Route exact path="/login" element={<AuthPage />} />
        <Route exact path='/edit' element={<EditPage />} />
        <Route exact path="/reservation" element={<Reservation />} />
        <Route exact path='/admin' element={<AdminPage />} />
        <Route exact path='/layout' element={<RestaurantSchemaPage />} />
        <Route exact path='/aukiolo' element={<Aukiolo />} />
        <Route exact path='/raportointi' element={<RaportointiAnalytiikka />} />
        <Route path="/editReservation" element={<EditReservation />} />
      </Routes>
      <ToastContainer
        className='toast-container'
        toastStyle={{ marginBottom: "10px" }}
        position='top-center'
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
        />
    </Layout>
  );
}

export default App;

