import { useDispatch, useSelector } from "react-redux";
import { CNDispatch, CNState, setForm } from "./store";
import { NoteState } from ".";
import { padZeroes } from "../../../assets/javascript/Time";


function Title ({maxTitleLength}: {maxTitleLength: number}) {
    let {title} = useSelector<CNState, NoteState>(state => state['form']);
    let dispatch = useDispatch<CNDispatch>();

    const updateTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let {value} = e.currentTarget;

        dispatch(setForm({field: "title", value}))
    }

    return (
        <div className="cw text-input" id="title">
            <input type="text" name="title" placeholder="Untitled" value={title} onInput={updateTitle} />
            <div className="character-counter">
                <span className="counter-current">{padZeroes(title.length, 2)}</span>
                <div className="divider"></div>
                <span className="counter-limit">{maxTitleLength}</span>
            </div>
        </div>
    )
}

export default Title;