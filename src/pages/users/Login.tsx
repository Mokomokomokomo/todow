import { useDispatch, useSelector } from "react-redux";
import { StoreDispatch, StoreState } from "../../store";
import {login} from '../../contexts/userContext';
import { User } from "../../../types/client/contexts";
import { useState } from "react";
import Redirect from "../../components/Redirect";

function Login () {
    let initUser = useSelector<StoreState, User>(state => state.user);
    let dispatch = useDispatch<StoreDispatch>();
    let [user, setUser] = useState({username: "", password: ""});
    let [isTextHidden, setIsTextHidden] = useState(true);

    let {username, password} = user;

    const inputHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let {name, value} = e.currentTarget;
        
        setUser(prev => {
            return {
                ...prev,
                [name]: value
            }
        });
    }

    const loginHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(username == '') {
            alert("Please fill out username");
            return;
        }
        if(password == '') {
            alert("Please fill out password");
            return;
        }

        dispatch(login(user as User));
    }

    const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsTextHidden(!isTextHidden);
    }

    let passTitle = `${isTextHidden ? "Show" : "Hide"} Password`;
    let passText = isTextHidden ? '*' : 'A';
    let passStyle = {
        lineHeight: isTextHidden ? '38px' : '28px',
    } as React.CSSProperties;

    let form = (
        <form id="login-form">
            <div className="header">Login</div>
            <div className="cwc fill-parent" id="body">
                <div className='cw text-input' id="username">
                    <input type="text" name='username' placeholder="Username" value={username} onInput={inputHandler} required />
                </div>
                <div className='cw text-input' id="password">
                    <input type={isTextHidden ? "password" : "text"} name='password' placeholder="Password" value={password} onInput={inputHandler} required />
                    <button className="hide-text" title={passTitle} onClick={togglePassword} style={passStyle}>{passText}</button>
                </div>
                <div className="cw button-input">
                    <button onClick={loginHandler}>Login</button>
                    <button onClick={() => {location.href = './register'}}>Register</button>
                </div>
            </div>
        </form>
    )
    let loggedIn = (
        <div id="logged-in">
            <span>You are already Logged In. <a href="/notes">Click here to return to Main Page</a></span>
        </div>
    )
    let redirect = <Redirect url="/notes" />

    let children: JSX.Element;
    if(initUser.userid > 0 && username.length > 0 && password.length > 0) {
        children = redirect;
    }
    else if (initUser.userid > 0) {
        children = loggedIn
    }
    else {
        children = form
    }

    return (
        <div className="cw-center fill-parent">
            {children}
        </div>
    )
}

export default Login;