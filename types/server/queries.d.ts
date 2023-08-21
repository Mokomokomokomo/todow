import { TediousType } from "tedious"

export interface Column<T = any> {
    /** string representation of column (e.g. id | user.id | dbo.user.id ) */
    name: keyof T extends T ? string : keyof T
    /** value of the column to be set or value returned from a select */
    value?: any
    /** type of the column as described by the database */
    type: TediousType
    nullable?: boolean
}

type Data<T extends Column[]> = {
    [K in T[number]['name']]: any
}