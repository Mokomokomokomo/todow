import { useDispatch, useSelector } from "react-redux";
import { CNDispatch, CNState, setForm } from "./store";

import AdjustableTextArea from "../../../components/AdjustableTextArea";
import SelectTime from "./SelectTime";

function NoteContent() {
    let sched_date = useSelector<CNState, string>(note => note.form.sched_date);
    let content = useSelector<CNState, string>(note => note.form.content);
    let dispatch = useDispatch<CNDispatch>()

    const setDescription = (value: string) => {
        dispatch(setForm({
            field: "content",
            value: value
        }));
    }

    return (
        <div className="cw-mult" id="content">
            <SelectTime {...{sched_date}} />
            <div className="todo-description">
                <AdjustableTextArea value={content} id={0} setState={setDescription} placeholder="Descrtiption" />
            </div>
        </div>
    )
}

export default NoteContent;