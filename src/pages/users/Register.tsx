import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User } from '../../../types/client/contexts';
import { StoreState, StoreDispatch } from '../../store';
import { register } from '../../contexts/userContext';


function Register() {
    let initUser = useSelector<StoreState, User>(state => state.user);
    let dispatch = useDispatch<StoreDispatch>();
    let [user, setUser] = useState<User>({
        ...initUser, 
        password: "",
        username: "",
        email: ""
    });
    let [isTextHidden, setIsTextHidden] = useState(true);

    let {username, password, email} = user;

    const inputHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let {name, value} = e.currentTarget;
        
        setUser(prev => {
            return {
                ...prev,
                [name]: value
            }
        });
    }
    const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsTextHidden(!isTextHidden);
    }

    const submitHandler = (e: React.MouseEvent<HTMLButtonElement>) =>{ 
        e.preventDefault();
        for(let field in user) {
            if(user[field as keyof User] == '') {
                alert(`Field ${field} is missing`);
                return;
            }
        }

        dispatch(register(user));
    }

    let passTitle = `${isTextHidden ? "Show" : "Hide"} Password`;
    let passText = isTextHidden ? '*' : 'A';
    let passStyle = {
        lineHeight: isTextHidden ? '38px' : '28px',
    } as React.CSSProperties;

    return(
        <div className="cw-center fill-parent">
            {
                (user.userid <= 0)
                ? (
                    <form id="login-form">
                        <div className="header">Register</div>
                        <div className="cwc fill-parent" id="body">
                            <div className='cw text-input' id="username">
                                <input type="text" name='username' placeholder="Username" value={username} onInput={inputHandler} required />
                            </div>
                            <div className='cw text-input' id="password">
                                <input type={isTextHidden ? "password" : "text"} name='password' placeholder="Password" value={password} onInput={inputHandler} required />
                                <button className="hide-text" title={passTitle} onClick={togglePassword} style={passStyle}>{passText}</button>
                            </div>
                            <div className='cw text-input' id="email">
                                <input type="text" name='email' placeholder='Email' value={email} onInput={inputHandler} required />
                            </div>
                            <div className="cw button-input" style={{marginTop: 30}}>
                                <button onClick={submitHandler}>Create Account</button>
                            </div>
                        </div>
                    </form>
                )
                : (
                    <div id="logged-in">
                        <span>You are already Logged In. <a href="/notes">Click here to return to Main Page</a></span>
                    </div>
                )
            }
        </div>
    )
}

export default Register;