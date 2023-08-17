import { CNState, CNDispatch, setForm } from './store';
import { NoteState } from '.';

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getDaysInMonth, getMonths } from '../../../assets/javascript/Time';

function SelectDate () {
    let form = useSelector<CNState, NoteState>(state => state.form);
    let dispatch = useDispatch<CNDispatch>();

    let {year, month, day_of_month} = form.sched_date;

    let optionYears = useMemo(() => {
        let options = [];
        let year = form.sched_date.year as number;

        for(let i=0; i<5; i++) {
            options.push(<option key={year+i} value={year+i}>{year+i}</option>);
        }
        return options
    }, []);

    let optionDays = useMemo(() => {
        let options = [];
        
        for(let day=1; day<=getDaysInMonth(month, year); day++) {
            options.push(<option key={day} value={day}>{day}</option>)
        }
        return options
    }, [year, month]);

    let optionMonths = getMonths().map(m => <option key={m} value={m}>{m}</option>);

    const changeDate = ({currentTarget}: React.ChangeEvent<HTMLSelectElement>) => {
        let {name, value} = currentTarget;

        let newDate = {
            ...form.sched_date,
            [name]: value
        }

        dispatch(setForm({field: "sched_date", value: newDate}));
    }

    return (
        <div className="select-input" id="datetime">
            <span className="label">Date: </span>
            <select name="year" id="year" value={year} onChange={changeDate}>
                {optionYears}
            </select>
            <select name="month" id="month" defaultValue={month} onChange={changeDate}>
                {optionMonths}
            </select>
            <select name="day_of_month" id="day" defaultValue={day_of_month} onChange={changeDate}>
                {optionDays}
            </select>
        </div>
    )
}

export default SelectDate;