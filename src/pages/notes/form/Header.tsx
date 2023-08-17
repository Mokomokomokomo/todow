import { useSelector } from "react-redux";
import { CNState } from "./store";
import { NoteState } from ".";

function Header() {
    let {color} = useSelector<CNState, NoteState>(state => state.form);

    return (
        <div id="note-header" style={{backgroundColor: color}}></div>
    )
}

export default Header;