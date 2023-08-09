import { section } from '../../src/pages/notes/NoteContent'
import { Datetime } from './Time'

export type ReactNode = React.JSX.Element | React.JSX.Element[]
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export interface Area {
    width: number,
    height: number
}

export interface StateProp<T> {
    state: T,
    setState: SetState<T>
}

type ComponentChildren = {
    children?: ReactNode,
}

export type FetchResult<D> = {
    error: string | Error
} & D

export type sessionStatus = 'initial' | 'no session' | 'not validated' | 'validated' | 'error' | 'expired';

export interface WarningProps extends ComponentChildren {
    message: string,
    hideWarning: VoidFunction
}

export interface SidebarProps extends ComponentChildren {
    createNote: VoidFunction
}

export interface CreateNoteProps {
    maxTitleLength?: number,
    maxDescrLength?: number,
}

export interface NoteForm {
    title: string,
    description?: string,
    content: section[]
    sched_date: Datetime
    color?: string
    group?: string,
}
