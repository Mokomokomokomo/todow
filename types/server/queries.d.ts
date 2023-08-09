import { TediousType } from "tedious"

export interface Column {
    column: string
    value: any
    type: TediousType
}

