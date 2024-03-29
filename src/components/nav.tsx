import { useEffect, useRef, useState } from 'react';
import {expandSidebar} from '../contexts/layoutContext';
import { useDispatch, useSelector } from 'react-redux';
import { getDateTime } from '../assets/javascript/Time';
import { Datetime } from '../assets/javascript/Time';

import '../assets/components.css';
import { StoreDispatch, StoreState } from '../store';
import { User } from '../../types/client/contexts';
import { logout } from '../contexts/userContext';

function Nav() {
    let user = useSelector<StoreState, User>(state => state.user);
    let dispath = useDispatch<StoreDispatch>();

    const [time, setTime] = useState<Datetime>({
        year: "2000",
        month: "Jan",
        day_of_month: "01",
        hour: "00",
        minute: "00",
        second: "00",
        time_of_day: 'am',
        day: "Monday"
    });
    let timeInterval = useRef<NodeJS.Timer>();

    useEffect(() => {
        setTime(getDateTime());
        
        timeInterval.current = setInterval(() => {
            setTime(getDateTime());
        }, 1000);
    }, []);

    const redirect = (url: string) => {
        location.href = url
    }

    let userActions = 
        (user.userid > 0)
        ? <button className='nav_button' onClick={() => dispath(logout(user))}>Log out</button>
        : [
            <button key={'login'} className='login' onClick={() => redirect('/user/login')}>Login</button>,
            <button key={'logout'} className='signup' onClick={() => redirect('/user/register')}>Sign Up</button>
        ];

    return (
        <div className="nav">
            <div className="nav_icon" id="expand-sidebar" onClick={() => dispath(expandSidebar())}>
                <img src='toggle_sidebar.svg' alt='Toggle Sidebar' />
            </div>
            <div className="timedate">
                <div className= "date">
                    <span className=''>{time?.year ?? ""}</span>
                    <span className=''>{time?.month ?? ""}</span>
                    <span className=''>{time?.day_of_month ?? ""}</span>
                </div>
                <div className="time">
                    <span className=''>{time?.hour ?? ""}</span>
                    <span className=''>{time?.minute ?? ""}</span>
                    <span className=''>{time?.second ?? ""}</span>
                    <span className=''>{time?.time_of_day ?? ""}</span>
                </div>
            </div>
            <div className="user_actions">
                {userActions}
            </div>
        </div>
    )    
}

export default Nav;