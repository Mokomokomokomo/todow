import { useDispatch, useSelector } from "react-redux";
import FlowSVG from "../../../components/UseSVG";
import { CNDispatch, CNState, setContent } from "./store";
import { NoteState } from ".";

function SelectTime({s_id}: {s_id: number}) {
    let {content, color} = useSelector<CNState, NoteState>(state => state.form);
    let section = content[s_id];
    let dispatch = useDispatch<CNDispatch>();

    const setTC = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let {value, parentElement} = e.currentTarget;
        let range = parentElement?.className.replace('-', '_') as 'time_from' | 'time_to';

        dispatch(setContent({
            id: s_id, 
            params: {
                field: range,
                value: { ...section[range], tc: value }
            }
        }));
    }

    const setTime = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let {value, parentElement} = e.currentTarget;

        if(value.length > 2) {
            return;
        }

        
        let range = parentElement!.className.replace('-','_') as 'time_from' | 'time_to';
        let name = e.currentTarget.name as 'hour' | 'minute';        
        let toInt = parseInt(value) || 0;

        
        if(!isNaN(toInt) || value == '') {
            let limitVal = Math.min((name == 'hour' ? 12 : 59), toInt);
            
            dispatch(setContent({
                id: s_id,
                params: {
                    field: range,
                    value: { ...section[range], [name]: limitVal }
                }
            }));
        }
    }


    let {time_from, time_to} = section;

    return (
        <div className="todo-time">
            <div className="flow">
                <FlowSVG color={color} />
            </div>
            <div className="time-from">
                <input type="text" className="time-input" value={time_from.hour || ''} name="hour" placeholder="HH" onInput={setTime}/>
                <span className="seperator">:</span>
                <input type="text" className="time-input" value={time_from.minute || ''} name="minute" placeholder="MM" onInput={setTime} />
                <select className="time-cycle" name="timecycle" value={time_from.tc} onChange={setTC}>
                    <option value="am">am</option>
                    <option value="pm">pm</option>
                </select>
            </div>
            <div className="time-to">
                <input type="text" className="time-input" value={time_to.hour || ''} name="hour" placeholder="HH" onInput={setTime}/>
                <span className="seperator">:</span>
                <input type="text" className="time-input" value={time_to.minute || ''} name="minute" placeholder="MM" onInput={setTime} />
                <select className="time-cycle" name="timecycle" value={time_to.tc} onChange={setTC}>
                    <option value="am">am</option>
                    <option value="pm">pm</option>
                </select>
            </div>
        </div>
    )
}

export default SelectTime;
