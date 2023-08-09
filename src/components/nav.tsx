import { useEffect, useRef, useState } from 'react';
import {expandSidebar} from '../contexts/layoutContext';
import { useDispatch } from 'react-redux';
import { getDateTime } from '../assets/javascript/Time';
import { Datetime } from '../../types/client/Time';

import '../assets/components.css';

function Nav() {
    let dispath = useDispatch();
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
                <button className='theme'>Theme</button>
                <div className='search'>Search</div>
                <button className='login' onClick={() => redirect('/user/login')}>Login</button>
                <button className='signup'>Sign Up</button>
            </div>
        </div>
    )    
}

export default Nav;