import { useState } from "react";
import Sidebar from "../../components/sidebar";
import CreateNote from "./form/CreateNote";
import { NoteState } from "./form";

function Content() {
    const [showCreateNote, setShowCreateNote] = useState(false);

    const createNote = async (form: NoteState) => {
        let incompleteSections = [];
        for(let section of form.content) {
            if (section.description && section.time_from.hour && section.time_from.minute) {
                continue;
            }

            incompleteSections.push(section.id);
        }

        if(incompleteSections.length > 0) {
            return incompleteSections;
        }

        let res = await fetch('/api/note/create', {
            body: JSON.stringify(form),
            headers: {
                "Content-Type": "application/json",
            },
            method: "post"
        }).then(dat => dat.json());

        if (res.success) {
            setShowCreateNote(false);
        }
    }

    return (
        <div className="content">
            <Sidebar createNote={() => {setShowCreateNote(true)}} />
            <div className={`main_content${!showCreateNote ? ' no_notes': ''}`}>
                {showCreateNote && <CreateNote submitForm={createNote} />}
                {!showCreateNote && <span>No Notes Found. Create A new one</span>}
            </div>
        </div>
    )
}

export default Content;