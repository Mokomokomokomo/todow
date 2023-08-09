import { useEffect, useState } from "react"
import { NoteForm, CreateNoteProps } from "../../../types/client/component"
import { getDateTime, padZeroes } from '../../assets/javascript/Time'
import CreateGroup from "./CreateGroup"
import SelectDate from "./SelectDate";
import ColorPicker from "./ColorPicker";
import NoteContent, { section } from "./NoteContent";

let defaultGroups: React.JSX.Element[] = [
    "Work", "School", "Grocery", "Workout"
].map(v => <option key={v} value={v}>{v}</option>);

let initNoteForm: NoteForm = {
    title: '',
    description: '',
    group: "",
    sched_date: getDateTime(),
    content: [
        {
            id: 0,
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
        },
    ],
    color: '#e9e7e7',
}

function Notes() {
    return(
        <div className="content-notes">

        </div>
    )
}

interface CreateNoteState {
    form: NoteForm,
    newGroup: string,
    createGroup: boolean,
    pickColor: boolean
}

function CreateNote({maxTitleLength = 20}: CreateNoteProps) {
    const [state, setState] = useState<CreateNoteState>({
        form: initNoteForm,
        newGroup: "",
        createGroup: false,
        pickColor: false
    });

    let {form, newGroup, createGroup, pickColor} = state;

    useEffect(() => {
        console.table(form.content);
    }, [form.content.length]);
    
    const setCreateGroup = (value: boolean) => {
        setState({
            form, newGroup, createGroup: value, pickColor
        });
    }
    const setForm= (field: keyof NoteForm, value: any) => {
        setState({
            form: {
                ...form,
                [field]: value
            },
            newGroup, createGroup, pickColor
        });
    }
    const setNewGroup = (value: string, cancel: boolean = false) => {
        setState({
            form: {
                ...form,
                group: cancel ? form.group : value
            }, 
            newGroup: value, 
            createGroup: false,
            pickColor
        });
    }
    const setContent = (section_id: number, new_section?: section, remove: boolean = false) => {
        if(remove) {
            setForm('content', [
                ...form.content.slice(0, section_id),
                ...form.content.slice(section_id+1)
            ]);
        }
        else if(new_section) {
            setForm('content', [
                ...form.content.slice(0, section_id),
                new_section,
                ...form.content.slice(section_id+1)
            ]);
        }
    }

    const updateTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let {value} = e.target as HTMLInputElement;

        if(value.length <= maxTitleLength) {
            setForm("title", value);
        }
    }

    const changeGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let {value} = e.target;

        if (value === "custom") {
            setCreateGroup(true);
        }
        else {
            setForm("group", value);
        }
    }

    const noteColor = {
        backgroundColor: form.color || ''
    } as React.CSSProperties

    return (
        <form className="note" id="create-note">
            {/* Header */}
            <div id="note-header" style={noteColor}></div>
            <div id="note-body">
                {/* Date when Note displays */}
                <div className="cw-mult select-input">
                    <SelectDate form={state.form} setForm={setForm} />
                    <ColorPicker 
                        currColor={form.color || ''} 
                        colorOptions={['red', 'blue', 'violet', 'green']} 
                        setForm={setForm}
                    />
                </div>
                {/* Title (optional) */}
                <div className="cw text-input" id="title">
                    <input type="text" name="title" placeholder="Untitled" value={form.title} onInput={updateTitle} />
                    <div className="character-counter">
                        <span className="counter-current">{padZeroes(form.title.length, 2)}</span>
                        <div className="divider"></div>
                        <span className="counter-limit">{maxTitleLength}</span>
                    </div>
                </div>
                {/* Group (optional) */}
                <div className="cw select-input" id="group">
                    <span className="label">Group: </span>
                    <select name="group" value={form.group} onChange={changeGroup}>
                        {defaultGroups}
                        {newGroup && <option key={"customVal"} value={newGroup}>{newGroup}</option>}
                        <option key={"custom"} value={"custom"}>New Groups</option>
                    </select>
                    {createGroup && <CreateGroup initGroupName={form.group || ""} setGroup={setNewGroup} />}
                </div>
                {/* Content */}
                <NoteContent color={form.color || ''} content={form.content} setContent={setContent} />
            </div>
        </form>
    )
}

export {Notes, CreateNote}