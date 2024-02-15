import { useDispatch } from "react-redux";
// import FlowSVG from "../../../components/UseSVG";
import { CNDispatch, setForm } from "./store";
import { useEffect, useState } from "react";

function SelectTime({sched_date}: {sched_date: string}) {
    let dateObj = new Date(sched_date);
    let dispatch = useDispatch<CNDispatch>();
    const [meridiem, setMeridiem] = useState<"am"|"pm">(dateObj.getHours() < 12 ? "am" : "pm");
    const [time, setTime] = useState(() => {
        let binaryHour = dateObj.getHours() - (meridiem == "pm" ? 12 : 0); 

        return {
            hour: String(binaryHour).padStart(2,'0'),
            minutes: String(dateObj.getMinutes()).padStart(2,'0')
        }
    });


    useEffect(() => {
        // parse to Date object
        let newDate = new Date(sched_date);
        
        let {hour, minutes} = time;
        if (hour == '') {
            hour = '01'
        }
        if (minutes == '') {
            minutes = '00';
        }

        // convert meridiem hours to military hours
        let intHour = parseInt(hour);
        if (meridiem == 'pm' && intHour < 12) { //military time can't be 24:00
            intHour += 12;
        }
        else if (meridiem == 'am' && intHour == 12) { // 12am (midnight) converts to 00:00
            intHour = 0;
        }

        let intMinutes = parseInt(minutes);

        newDate.setHours(intHour);
        newDate.setMinutes(intMinutes);

        dispatch(setForm({
            field: 'sched_date',
            value: newDate.toISOString()
        }));
    }, [time, meridiem]);

    const selectMeridiem = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let {value} = e.currentTarget;
        setMeridiem(value as "am" | "pm");
    }

    const handleInput = (e: React.SyntheticEvent<HTMLInputElement, InputEvent>) => {
        let {name, value} = e.currentTarget;

        let intVal = parseInt(value);
        
        if (isNaN(intVal) && value != '') {
            return;
        }
        if (value.length > 2) {
            return;
        }
        
        if (name == 'hour' && value == '00') {
            value = '01';
        }
        else if (name == 'hour' && intVal > 12) {
            value = '12'
        }
        else if (name == 'minutes' && intVal > 59) {
            value = '59'
        }

        setTime(prevTime => {
            return {
                ...prevTime,
                [name]: value
            }
        });
    }

    return (
        <div className="todo-time">
            {/* <div className="flow">
                <FlowSVG color={color} />
            </div> */}
            <div className="time-from">
                <span>Schedule Time: </span>
                <input type="text" className="time-input" value={time.hour} name="hour" placeholder="HH" onInput={handleInput}/>
                <span className="seperator">:</span>
                <input type="text" className="time-input" value={time.minutes} name="minutes" placeholder="MM" onInput={handleInput} />
                <select className="time-cycle" name="timecycle" value={meridiem} onChange={selectMeridiem}>
                    <option value="am">am</option>
                    <option value="pm">pm</option>
                </select>
            </div>
            {/* <div className="time-to">
                <input type="text" className="time-input" value={time_to.hour || ''} name="hour" placeholder="HH" onInput={setTime}/>
                <span className="seperator">:</span>
                <input type="text" className="time-input" value={time_to.minute || ''} name="minute" placeholder="MM" onInput={setTime} />
                <select className="time-cycle" name="timecycle" value={time_to.tc} onChange={setTC}>
                    <option value="am">am</option>
                    <option value="pm">pm</option>
                </select>
            </div> */}
        </div>
    )
}

export default SelectTime;
