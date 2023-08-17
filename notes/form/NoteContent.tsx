import { useSelector } from "react-redux";
import { CNState } from "./store";
import { section } from ".";

import Section from "./Section";

function NoteContent() {
    let content = useSelector<CNState, section[]>(state => state.form.content);

    let sections = content.map((section) => {
        return (
            <Section key={`section-${section.id}`} section={section}/>
        )
    });

    return (
        <div className="cw-mult" id="content">
            {sections}
        </div>
    )
}

export default NoteContent;