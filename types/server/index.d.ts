import { NoteState } from "../../src/pages/notes/form"
import { Datetime, Time } from "../../src/assets/javascript/Time"

export interface TokenObj {
    userid: number,
    token: string,
    key: string
}

export interface UserObj {
    id: number,
    username: string,
    email: string,
    password: string,
    salt: string
}

export interface TaskObj{
    user_id?: number
    title: string
    content: string
    sched_date: string
    color?: string
    group?: string
    status: "done"|"unfinished"|"overdue"
}

export interface SectionObj {
    note_id: number
    description: string
    time_from: string
    time_to?: string
}