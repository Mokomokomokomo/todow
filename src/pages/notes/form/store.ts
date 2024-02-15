import { SetState, NoteState, GroupState } from ".";
import { configureStore, createSlice } from "@reduxjs/toolkit";

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

export const initNoteForm: NoteState = {
    note_id: 0,
    title: "",
    group: "Home`",
    sched_date: new Date().toISOString(),
    content: "",
    color: '#e9e7e7',
    status: 'unfinished'
}

const initGroupState: GroupState = {
    defaultGroups: ["Home", "Work", "School", "Grocery", "Workout"],
    new_group: "",
    isTooltipShown: false
}

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
        resetForm: (state) => {
            let {note_id, title, group, content, color, status} = initNoteForm;
            let sched_date = new Date().toISOString();
            
            state.color = color;
            state.title = title;
            state.note_id = note_id;
            state.group = group;
            state.sched_date = sched_date;
            state.content = content;
            state.status = status;
        }
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

export const {setForm, resetForm} = formSlice.actions;
export const {setNewGroup, toggleNGForm} = groupSlice.actions;

export type CNState = ReturnType<(typeof store.getState)>
export type CNDispatch = typeof store.dispatch;
export default store;