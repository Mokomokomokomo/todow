import { Time } from "../../../types/client/Time";
import Section from "./Section";

export interface section {
    id: number,
    time_from: Time,
    time_to: Time,
    description: string,
}

export interface NoteContentProps {
    color: string,
    content: section[],
    setContent: (section_id: number, new_section?: section, remove?: boolean) => void
}

function NoteContent({color, content, setContent}: NoteContentProps) {
    const setDescription = (section_id: number, value: string) => {

        let new_section: section = {
            ...content[section_id],
            description: value
        }

        setContent(section_id, new_section);
    }

    let sections = content.map((section) => {
        return (
            <Section key={`section-${section.id}`} {...{color, content, setContent, section, setDescription }} />
        )
    });

    return (
        <div className="cw-mult" id="content">
            {sections}
        </div>
    )
}

export default NoteContent;