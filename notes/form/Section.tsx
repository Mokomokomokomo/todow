import { section } from ".";
import SelectTime from "./SelectTime";
import AdjustableTextArea from "../../../components/AdjustableTextArea";
import { useDispatch } from "react-redux";
import { CNDispatch, setContent } from "./store";

function Section ({section}: {section: section}) {
    let dispatch = useDispatch<CNDispatch>()

    let {id, description} = section;

    const setDescription = (id: number, value: string) => {
        dispatch(setContent({
            id,
            params: {field: "description", value},
        }));
    }

    return (
        <div className="todo" id={`section-${id}`}>
            <SelectTime s_id={id} />
            <div className="todo-description">
                <AdjustableTextArea value={description} id={id} setState={setDescription} placeholder="Descrtiption" />
            </div>
        </div>
    )
}

export default Section;