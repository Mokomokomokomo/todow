import { useMemo } from "react";
import { NoteForm, ReactNode } from "../../../types/client/component";
import { getDaysInMonth, getMonths } from "../../assets/javascript/Time";


interface SelectDateProps {
    form: NoteForm,
    setForm: (field: keyof NoteForm, value: any) => void
}

function SelectDate({form, setForm}: SelectDateProps) {
    let optionYears: ReactNode = useMemo(() => {
        let options = [];
        let year = form.sched_date.year as number;

        for(let i=0; i<5; i++) {
            options.push(<option key={year+i} value={year+i}>{year+i}</option>);
        }
        return options
    }, []);

    let optionDays: ReactNode = useMemo(() => {
        let options = [];
        let month = form.sched_date.month;
        let year = form.sched_date.year as number;
        
        for(let day=1; day<=getDaysInMonth(month, year); day++) {
            options.push(<option key={day} value={day}>{day}</option>)
        }
        return options
    }, [form.sched_date.year, form.sched_date.month]);
    
    let optionMonths: ReactNode = getMonths().map(m => <option key={m} value={m}>{m}</option>)

    const changeDate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let { name, value } = e.target;

        let new_sched = {
            ...form.sched_date,
            [name]: value
        }

        setForm("sched_date", new_sched);
    }

    return (
        <div className="select-input" id="datetime">
            <span className="label">Date: </span>
            <select name="year" id="year" value={form.sched_date.year} onChange={changeDate}>
                {optionYears}
            </select>
            <select name="month" id="month" defaultValue={form.sched_date.month} onChange={changeDate}>
                {optionMonths}
            </select>
            <select name="day_of_month" id="day" defaultValue={form.sched_date.day_of_month} onChange={changeDate}>
                {optionDays}
            </select>
        </div>
    )
}

export default SelectDate;