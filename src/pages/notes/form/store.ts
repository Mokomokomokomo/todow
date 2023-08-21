import { SetState, NoteState, GroupState, SetContentParams, section } from ".";
import {getDateTime} from '../../../assets/javascript/Time';
import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const copyObject = (obj: any) => {
    let copy: any = {};
    for(let key in obj) {
        let value = obj[key];
        if(typeof value == 'object') {
            value = copyObject(value);
        }
        copy[key] = value;
    }
    return copy;
}

export const initSection: section = {
    id: 0,
    time_from: {
        hour: getDateTime().hour,
        minute: getDateTime().minute,
        tc: 'am'
    },
    time_to: {
        hour: '',
        minute: '',
        tc: 'am'
    },
    description: ''
}

export const initNoteForm: NoteState = {
    title: '',
    group: "",
    sched_date: getDateTime(),
    content: [initSection],
    color: '#e9e7e7',
}

const initGroupState: GroupState = {
    defaultGroups: ["Work", "School", "Grocery", "Workout"],
    new_group: "",
    isTooltipShown: false
}

// Async Thunks
const createNote = createAsyncThunk(
    'form/create',
    async ({}, state) => {
        // Validate Form
        let note = state.getState() as NoteState;

        let incompleteSections = [];
        for (let section of note.content) {
            if (section.description && section.time_from.hour && section.time_from.minute) {
                continue;
            }

            incompleteSections.push(section.id);
        }

        if (incompleteSections.length > 0) {
            return incompleteSections;
        }

        let res = await fetch('/api/notes/create', {
            headers: {
                "Content-Type": "application/json",
            },
            method: "post",
        }).then(dat => dat.json());

        console.log(res);
        return 1;
    }
)



// Form Context
const formSlice = createSlice({
    name: 'form',
    initialState: initNoteForm,
    reducers: {
        setForm: (state, {payload}: {payload: SetState<NoteState>}) => {
            let {field, value} = payload;

            return {
                ...state,
                [field]: value
            }
        },
        setContent: (state, {payload}: {payload: SetContentParams}) => {
            let {id, params, remove} = payload;
            let {content} = state;
            
            if(remove) {
                state.content = [...content.slice(0, id), ...content.slice(id + 1)];
            }
            else if(params) {
                content[id] = {
                    ...content[id],
                    [params.field]: params.value
                }

                let nextSection = content[id+1];

                if(content[id].description.length > 0 && !nextSection) {
                    let new_section: section = copyObject(initSection);
                    new_section.id = id + 1;

                    content.push(new_section);
                }
                else if(content[id].description.length == 0 && nextSection?.description.length == 0) {
                    state.content = [...content.slice(0, id+1), ...content.slice(id+2)];
                }
            }
        },
    },
    extraReducers(builder) {
        builder.addCase(createNote.fulfilled, (state, action) => {
            console.log(action.payload);
            state;
            
        });
    },
});

const groupSlice = createSlice({
    name: 'group',
    initialState: initGroupState,
    reducers: {
        toggleNGForm: (state, {payload}: {payload: {show?: boolean}}) => {
            if(typeof payload.show == 'undefined') {
                state.isTooltipShown = !state.isTooltipShown;
            }
            else {
                state.isTooltipShown = payload.show;
            }
        },
        setNewGroup: (state, {payload}: {payload: SetState<GroupState>}) => {
            let {value} = payload;

            return {
                ...state,
                isTooltipShown: false,
                new_group: value
            }
        }
    }
});

const [form, group] = [formSlice.reducer, groupSlice.reducer];

const store = configureStore({
    reducer: {
        form,
        group,
    },
});

export const {setForm, setContent} = formSlice.actions;
export const {setNewGroup, toggleNGForm} = groupSlice.actions;

export type CNState = ReturnType<(typeof store.getState)>
export type CNDispatch = typeof store.dispatch;
export default store;