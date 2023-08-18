import { NoteState, section } from "../../src/pages/notes/form"
import { Datetime } from "../../src/assets/javascript/Time"

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

export interface NoteObj{
    user_id?: number
    title: string
    content: section[]
    sched_date: Datetime
    color?: string
    group?: string
}

export interface SectionObj extends section {
    note_id: number
}