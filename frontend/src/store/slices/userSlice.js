import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    email: localStorage.getItem("email") || null,
    token: localStorage.getItem("token") || null,
    id: localStorage.getItem("id") || null,
    role: localStorage.getItem("role") || null,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.email = action.payload.email;
            state.token = action.payload.token;
            state.id = action.payload.id;
            state.role = action.payload.role;

            // Сохранение данных в localStorage
            localStorage.setItem("email", action.payload.email);
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("id", action.payload.id);
            localStorage.setItem("role", action.payload.role);
        },
        removeUser(state) {
            state.email = null;
            state.token = null;
            state.id = null;
            state.role = null;

            // Очистка localStorage при выходе
            localStorage.removeItem("email");
            localStorage.removeItem("token");
            localStorage.removeItem("id");
            localStorage.removeItem("role");
        },
    },
});

export const {setUser, removeUser} = userSlice.actions;

export default userSlice.reducer;