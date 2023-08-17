import { Datetime, Time } from "../../../../types/client/Time"

export type RGBAValueType = "numerical" | "hex"

export interface RGBA {
    red: string | number
    green: string | number
    blue: string | number
    alpha: string | number
    toCSS: () => string
    adjust: (value: number) => void
}

export interface ConvertOptions {
    /** Specifies whether to return to string. Otherwise return an object */
    returnString?: boolean
    /** Specifies the type of value to use for RGBA. */
    valueType?: RGBAValueType
}

export interface SetState<O> {
    field: keyof O,
    value: any
}

export interface CreateNoteProps {
    maxTitleLength?: number
}

export interface section {
    id: number
    time_from: Time
    time_to: Time
    description: string
}

export interface NoteState {
    title: string
    description?: string
    content: section[]
    sched_date: Datetime
    color?: string
    group?: string
}

export interface GroupState {
    defaultGroups: string[]
    new_group: string
    isTooltipShown: boolean
}

export interface SetContentParams {
    id: number,
    params?: SetState<section>
    remove?: boolean 
}