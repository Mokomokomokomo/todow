import { useDispatch, useSelector } from "react-redux";
import { StoreDispatch, StoreState } from "../../store";
import {login} from '../../contexts/userContext';
import { User } from "../../../types/client/contexts";
import { useLayoutEffect, useState } from "react";

function Login () {
    let initUser = useSelector<StoreState, User>(state => state.user);
    let dispatch = useDispatch<StoreDispatch>();
    let [user, setUser] = useState({username: "", password: ""});
    let [isTextHidden, setIsTextHidden] = useState(true);

    let {username, password} = user;

    useLayoutEffect(() => {
        console.log(initUser.userid);
        // if(initUser.userid > 0) {
        //     location.href = '/notes'
        // }
    }, [initUser.userid]);

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

    return (
        <div className="cw-center fill-parent">
            {initUser.userid <= 0 && <form id="login-form">
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
            </form>}
        </div>
    )
}

export default Login;