import {
    Month, 
    monthFormat, 
    Datetime, 
    BinaryTC,
    Day,
    dtFormat,
} from '../../../types/client/Time'; 

const sm: Month[] = [
    "Jan", "Feb", "March",
    "April", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"
];

const fm: Month[] = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
]

export const days: Day[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const getMonths = (monthFormat: monthFormat = "short"): Month[] => {
    return (monthFormat == 'short') ? sm : fm
}

/**
 * 
 * @param month String representation of the month, can be short or full form 
 * @param year If provided, will check for leap year and adjust accordingly
 */
export const getDaysInMonth = (month: Month, year?: number) => {
    const md: number[] = [
        31, (year && year % 4 == 0) ? 29 : 28, 31,
        30, 31, 30,
        31, 31, 30,
        31, 30, 31
    ]

    for (let i=0; i < 12; i++) {
        if (sm[i] == month || fm[i] == month) {
            let days = md[i];

            return days;
        }
    }

    return 0;
}

export const padZeroes = (digit: number, maxLen: number) => {
    return digit.toString().padStart(maxLen, "0");
}

export const getDateTime = (format: Partial<dtFormat> = {}): Datetime => {
    let initFormat: dtFormat = {
        year: "number",
        month: "short",
        day: "string",
        timeCycle: "binary",
        hour: "string",
        minute: "string",
        second: "string",
    }

    format = {...initFormat, ...format};

    let currDate = new Date();

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
        day_of_month: (format.day == "string") ? padZeroes(date, 2) : date,
        hour: (format.hour == "string") ? padZeroes(hour, 2) : hour,
        time_of_day: (format.timeCycle == "binary") ? timeCycle : undefined,
        minute: (format.minute == "string") ? padZeroes(minute, 2) : minute,
        second: (format.second == "string") ? padZeroes(second, 2) : second,
        day,
    }
};
