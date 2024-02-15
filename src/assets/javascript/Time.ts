export const sm = [
    "Jan", "Feb", "March",
    "April", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"
] as const;

export const fm = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
] as const;

export type Month = typeof sm[number] | typeof fm[number];

export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type Day = typeof days[number];

type MonthFormat = "short" | "full";

export const getMonths = (monthFormat: MonthFormat = "short"): readonly Month[] => {
    return (monthFormat == 'short') ? sm : fm
}

/**
 * 
 * @param month String representation of the month, can be short or full form 
 * @param year If provided, will check for leap year and adjust accordingly
 */
export const getDaysInMonth = (month: number, year?: number | string) => {
    if (typeof year == 'string') {
        year = parseInt(year);
    }

    const md: number[] = [
        31, (year && year % 4 == 0) ? 29 : 28, 31,
        30, 31, 30,
        31, 31, 30,
        31, 30, 31
    ]

    // console.log(month, fm[month], md[month]);

    return md[month];
}

export const padZeroes = (digit: number, maxLen: number) => {
    return digit.toString().padStart(maxLen, "0");
}

type alphanumeric = "number" | "string";
export type BinaryTC = "am" | "pm";
export type TimeCycle = "binary" | "military";

export interface DTFormat {
    year: alphanumeric
    month: MonthFormat
    timeCycle: TimeCycle
    day_of_month: alphanumeric
    hour: alphanumeric
    minute: alphanumeric
    second: alphanumeric
}

export interface Datetime {
    year: number | string,
    month: Month,
    /** Current Day of the month */
    day_of_month: number | string,
    hour: number | string,
    time_of_day?: BinaryTC,
    minute: number | string,
    second: number | string,
    /** Current Day of the week in string representation (Monday etc.) */
    day: Day,
}

export interface Time {
    hour: number | string
    minute: number | string
    tc: BinaryTC
}

export const getDateTime = (hourOffset: number = 0, format?: DTFormat): Datetime => {
    let initFormat: DTFormat = {
        year: "number",
        month: "short",
        timeCycle: "binary",
        day_of_month: "string",
        hour: "string",
        minute: "string",
        second: "string",
    }

    format = {...initFormat, ...format};

    let currDate = new Date();
    if(hourOffset > 0) {
        currDate.setHours(currDate.getHours() + hourOffset);
    }

    let month = currDate.getMonth();
    let date = currDate.getDate();
    let day = days[currDate.getDay()];

    let militaryHour = currDate.getHours();
    let binaryHour = militaryHour > 12 ? militaryHour - 12 : militaryHour || 12
    let hour = format.timeCycle == "binary" ? binaryHour : militaryHour;
    let minute = currDate.getMinutes();
    let second = currDate.getSeconds();

    let timeCycle: BinaryTC = militaryHour >= 0 && militaryHour < 12 ? "am" : "pm"

    return {
        year: currDate.getFullYear(),
        month: (format.month == "short") ? sm[month] : fm[month],
        day_of_month: (format.day_of_month == "string") ? padZeroes(date, 2) : date,
        hour: (format.hour == "string") ? padZeroes(hour, 2) : hour,
        time_of_day: (format.timeCycle == "binary") ? timeCycle : undefined,
        minute: (format.minute == "string") ? padZeroes(minute, 2) : minute,
        second: (format.second == "string") ? padZeroes(second, 2) : second,
        day,
    }
};
