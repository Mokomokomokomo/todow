import FlowSVG from "../../components/UseSVG";
import { section } from "./NoteContent";

interface SelectTimeProps {
    color: string,
    content: section[],
    setContent: (section_id: number, new_section: section, remove?: boolean) => void
    /**
     * unique identifier to get content section
     */
    s_id: number,
}

function SelectTime({color, content, s_id, setContent}: SelectTimeProps) {

    const setTC = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let {value, parentElement} = e.currentTarget;
        let range = parentElement?.className.replace('-', '_') as 'time_from' | 'time_to';

        let section = content[s_id];

        let new_section: section = {
            ...section,
            [range]: {
                ...section[range],
                tc: value
            }
        }

        setContent(s_id, new_section);
    }

    const setTime = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let {value, parentElement} = e.currentTarget;

        if(value.length > 2) {
            return;
        }
        
        let range = parentElement!.className.replace('-','_') as 'time_from' | 'time_to';
        let name = e.currentTarget.name as 'hour' | 'minute';

        let section = content[s_id];
        let time = section[range];
        
        let toInt = parseInt(value) || 0;

        if(!isNaN(toInt) || value == '') {
            let limitVal = Math.min((name == 'hour' ? 12 : 59), toInt);
            
            let new_section: section = {
                ...section,
                [range]: {
                    ...time,
                    [name]: limitVal
                }
            }

            setContent(s_id, new_section);
        }
    }


    let {time_from, time_to} = content[s_id];

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
