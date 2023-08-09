import { useState } from "react";
import Sidebar from "../../components/sidebar";
import { CreateNote } from "./Notes";

function Content() {
    const [showCreateNote, setShowCreateNote] = useState(false);

    let isEmpty = !showCreateNote

    return (
        <div className="content">
            <Sidebar createNote={() => {setShowCreateNote(true)}} />
            <div className={`main_content${isEmpty ? ' no_notes': ''}`}>
                {showCreateNote && <CreateNote />}
                {isEmpty && <span>No Notes Found. Create A new one</span>}
            </div>
        </div>
    )
}

export default Content;