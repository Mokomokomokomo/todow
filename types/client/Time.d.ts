type ShortMonth = (
    "Jan"   | "Feb" | "March" |
    "April" | "May" | "Jun"   |
    "Jul"   | "Aug" | "Sep"   |
    "Oct"   | "Nov" | "Dec"
)

type FullMonth = (
    "January" | "February" | "March"     |
    "April"   | "May"      | "June"      |
    "July"    | "August"   | "September" | 
    "October" | "November" | "December"  
)

type Month = ShortMonth | FullMonth

export type Day = "Sunday" | "Monday" |  "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"

export type BinaryTC = "am" | "pm"

export type TimeCycle = "binary" | "military"

export interface Time {
    hour: number | string,
    minute: number | string,
    tc: BinaryTC
}

export interface Datetime {
    year: number | string,
    month: Month,
    day_of_month: number | string,
    hour: number | string,
    time_of_day?: BinaryTC,
    minute: number | string,
    second: number | string,
    day: Day,
}

export type monthFormat = "short" | "full"
export type alphanumeric = "string" | "number"

export interface dtFormat {
    year: alphanumeric,
    month: monthFormat,
    day: alphanumeric,
    timeCycle: "binary" | "full",
    hour: alphanumeric,
    minute: alphanumeric,
    second: alphanumeric,
}