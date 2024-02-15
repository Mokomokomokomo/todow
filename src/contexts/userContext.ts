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
            return {userid: res.userid};
        }
        else {
            return {userid: -1, error: res.error}
        }
    }
)

const logout = createAsyncThunk(
    'user/logout',
    async ({userid}: User) => {
        try {
            const res = await fetch('/api/user/logout', {
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({userid}),
                method: "post",
            })
            .then(dat => dat.json());
    
            if(res.success) {
                return {userid: -1, error: null}
            }
            else {
                return {error: res.error}
            }
        }
        catch (e) {
            return {error: e}
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
        builder.addCase(register.fulfilled, (state, {payload}) => {
            state.userid = payload.userid;
        });
        builder.addCase(login.fulfilled, (_, {payload}) => {
            if (payload.userid != -1) {
                location.href = "/notes";
            }
            else if (payload.error.name == 'PasswordMatchError') {
                alert("Username and Password doesn't match")
            }
        });
        builder.addCase(logout.fulfilled, () => {
            window.location.href = '/user/login';
        });
    },
});

export {register, login, logout};
export default userContext.reducer; 