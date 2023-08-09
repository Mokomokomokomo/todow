import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "../../types/client/contexts";

const register = createAsyncThunk(
    'user/register',
    async (user: User) => {
        const res = await fetch('/api/user/register', {
            headers: {
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify(user)
        })
        .then(dat => dat.json());
        
        if(res.success) {
            localStorage.setItem('uuid', res.uuid);

            return {userid: res.userid};
        }
        else {
            return {userid: -1}
        }
    }
);

const login = createAsyncThunk(
    'user/login',
    async (user: User) => {
        const res = await fetch('/api/user/login', {
            headers: {
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify(user)
        })
        .then(dat => dat.json());

        if(res.success) {
            localStorage.setItem('uuid', res.uuid);

            return {userid: res.userid};
        }
        else {
            return {userid: -1}
        }
    }
)

const userContext = createSlice({
    name: "user",
    initialState: {
        userid: -1,
        username: "",
        email: "",
    } as User,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(register.fulfilled, (state, action) => {
            state.userid = action.payload.userid;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.userid = action.payload.userid;
        });
    },
});

export {register, login};
export default userContext.reducer; 