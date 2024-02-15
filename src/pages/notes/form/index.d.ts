import { Datetime, Time } from "../../../assets/javascript/Time"

export interface RGBA {
    red: number
    green: number
    blue: number
    alpha: number
    toCSS: () => string
    /** Adjusts the value of all spectrum in RGB except Alpha */
    adjust: (value: number) => void
}

export interface ConvertOptions {
    /** Specifies whether to return to string. Otherwise return an object */
    returnString?: boolean
}

export interface SetState<O> {
    field: keyof O,
    value: any
}

export interface NoteState {
    note_id: number
    title: string
    content: string
    sched_date: string
    color: string
    group: string
    status: "done"|"unfinished"|"overdue"
}

export interface GroupState {
    defaultGroups: string[]
    new_group: string
    isTooltipShown: boolean
}

export interface CreateNoteProps {
    maxTitleLength?: number
    submitForm: (form: NoteState) => Promise<void>
}

export interface SetContentParams {
    params: SetState<section>
}

export interface SubmitProps {
    submitForm: (form: NoteState) => Promise <void>
}

export interface DateObject {
    year: number,
    month: number,
    day: number
}