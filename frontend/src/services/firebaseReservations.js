import { db, auth } from "../firebase"; 
import { collection, addDoc } from "firebase/firestore";

export const addReservation = async (Date_booking, Time_booking, Capacity, First_name, Last_name, Phone) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Пользователь не авторизован");

    const reservationRef = await addDoc(collection(db, "ReservationID"), {
      UserId: user.uid, 
      Date_booking,
      Time_booking,
      Capacity,
      First_name,
      Last_name,
      Phone,
      status: "confirmed",
      createdAt: new Date(),
    });

    console.log("Бронирование добавлено, ID:", reservationRef.id);
    return reservationRef.id;
  } catch (error) {
    console.error("Ошибка при добавлении бронирования:", error);
    throw error;
  }
};
