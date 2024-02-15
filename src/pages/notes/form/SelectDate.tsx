import { CNState, CNDispatch, setForm } from './store';

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getDaysInMonth, getMonths } from '../../../assets/javascript/Time';

function SelectDate () {
    let isoDate = useSelector<CNState, string>(state => state.form.sched_date);
    let dispatch = useDispatch<CNDispatch>();

    let sched_date = new Date(isoDate);

    let date =  {
        year: sched_date.getFullYear(),
        month: sched_date.getMonth(),
        day: sched_date.getDate(),
        num_of_days: getDaysInMonth(sched_date.getMonth(), sched_date.getFullYear())
    };
    
    let optionYears = useMemo(() => {
        let options = [];

        for(let i=0; i<10; i++) {
            options.push(<option key={date.year+i} value={date.year+i}>{date.year+i}</option>);
        }
        return options;
    }, []);

    let optionDays = useMemo(() => {
        let options = [];
        
        for(let day=1; day<=date.num_of_days; day++) {
            options.push(<option key={day} value={day}>{day}</option>)
        }
        return options
    }, [date.year, date.month]);

    let optionMonths = getMonths().map((m, i) => <option key={m} value={i}>{m}</option>);

    const changeDate = ({currentTarget}: React.ChangeEvent<HTMLSelectElement>) => {
        let {name, value} = currentTarget;
        let int_val = parseInt(value);

        let newDate = new Date(sched_date);
        
        if (name == 'year') {
            newDate.setFullYear(int_val);
        }
        else if (name == 'month') {
            let newNumOfDays = getDaysInMonth(int_val, date.year);
            newDate.setMonth(int_val);
            newDate.setDate(Math.min(date.day, newNumOfDays));
        }
        else {
            newDate.setDate(int_val);
        }

        dispatch(setForm({field: "sched_date", value: newDate.toISOString()}));
    }

    return (
        <div className="select-input" id="datetime">
            <span className="label">Date: </span>
            <select name="year" id="year" value={date.year} onChange={changeDate}>
                {optionYears}
            </select>
            <select name="month" id="month" value={date.month} onChange={changeDate}>
                {optionMonths}
            </select>
            <select name="day_of_month" id="day" value={date.day} onChange={changeDate}>
                {optionDays}
            </select>
        </div>
    )
}

export default SelectDate;