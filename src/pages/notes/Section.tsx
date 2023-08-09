import { useEffect } from "react";
import AdjustableTextArea from "../../components/AdjustableTextArea";
import { NoteContentProps, section } from "./NoteContent";
import SelectTime from "./SelectTime";

interface SectionProps extends NoteContentProps {
    section: section,
    setDescription: (section_id: number, value: string) => void
}

function Section ({section, color, content, setContent, setDescription}: SectionProps) {
    let {id, description} = section;

    useEffect(() => {
        if(section.description.length > 0 && !content[id+1]) {
            let new_section: section = {
                id: id + 1,
                time_from: {
                    hour: '',
                    minute: '',
                    tc: 'am',
                },
                time_to: {
                    hour: '',
                    minute: '',
                    tc: 'am',
                },
                description: '',
            }
    
            setContent(id+1, new_section);
        }
        else if (section.description.length == 0 && content[id+1]?.description.length == 0) {
            setContent(id+1, undefined, true);
        }
    }, [section]);

    return (
        <div className="todo" id={`section-${id}`}>
            <SelectTime 
                s_id={id}
                color={color}
                content={content}
                setContent={setContent}
            />
            <div className="todo-description">
                <AdjustableTextArea value={description} id={id} setState={setDescription} placeholder="Descrtiption" />
            </div>
        </div>
    )
}

export default Section;