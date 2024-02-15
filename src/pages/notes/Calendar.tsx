import { SetState } from '../../../types/client/component';
import {getDaysInMonth} from '../../assets/javascript/Time';
import { DateObject, NoteState } from './form';

interface CalendarProps {
    notes: NoteState[],
    selectedDate: DateObject,
    setSelectedDate: SetState<DateObject>
}

function Calendar ({notes, selectedDate, setSelectedDate}: CalendarProps) {
    let date = new Date();
    let dateBoxValues = [] as {
        month: number,
        day: number,
        notes: NoteState[]  
    }[];
    let dateBoxes = [];

    const selectDate = (day: number) => {
        setSelectedDate(prevSelectedDate => {
            return {
                ...prevSelectedDate,
                day
            }
        });
        const mainContent = document.getElementById("main-content")!;
        const timeline = document.getElementById("timeline")!;
        const mcTop = mainContent.getBoundingClientRect().top;
        const timelineTop = timeline.getBoundingClientRect().top;
        const offsetY = timelineTop - mcTop;
        
        let parentWrapper = mainContent.parentElement!;
        parentWrapper.scrollTo({
            behavior: 'smooth',
            top: offsetY - 20
        });
    }
    
    let curr_year = date.getFullYear();
    let curr_month = date.getMonth();
    let curr_date = date.getDate();
    let prev_year = curr_year - 1;
    let prev_month = curr_month > 0 ? curr_month - 1 : 11;
    let next_month = curr_month < 11 ? curr_month + 1 : 0;
    
    let month_start = new Date(`${curr_year}/${curr_month+1}/01`);
    let monthStartIndex = month_start.getDay();

    // get leftover days from previous month
    if (monthStartIndex > 0) {
        let prevLastDay = getDaysInMonth(prev_month, (curr_month > 0) ? curr_year : prev_year);
        let prevRecentDay = prevLastDay - (7 - monthStartIndex);
        for (let i = prevRecentDay; i<=prevLastDay;i++) {   
            dateBoxValues.push({month: prev_month, day: i, notes: []});
        }
    }

    for (let i = 1; i <= getDaysInMonth(curr_month, curr_year); i++) {
        dateBoxValues.push({month: curr_month, day: i, notes: []});
    }

    if (dateBoxValues.length < 35) {
        for (let i=1; i <= 36 - dateBoxValues.length; i++) {
            dateBoxValues.push({month: next_month, day: i, notes: []});
        }
    }

    // insert notes in right date
    notes.forEach(note => {
        let sched_date = new Date(note.sched_date);
        let day = sched_date.getDate();

        dateBoxValues[monthStartIndex - 1 + day].notes.push(note);
    });

    // generate date boxes
    for (let calendarIndex=0; calendarIndex<35; calendarIndex++) {
        let className = '';
        let tasks = [] as any[];
        let {month, day, notes} = dateBoxValues[calendarIndex];

        const isCurrDay = month == curr_month && day == curr_date;
        const isOutsideMonth = month < curr_month || month > curr_month;
        const isSelectedDate = month == selectedDate.month && day == selectedDate.day;

        // background coloring
        if (isOutsideMonth) {
            className = ' outside-month';
        }
        else if (isCurrDay) {
            className = ' curr-day'
        }
        else if (isSelectedDate) {
            className = ' selected-day'
        }

        let numOfNotes = notes.length;

        if (numOfNotes > 0) {
            for (let noteIndex=0; noteIndex < Math.min(numOfNotes, 3); noteIndex++) {
                let sched_date = new Date(notes[noteIndex].sched_date);
                let title = notes[noteIndex].title;
                let militaryHour = sched_date.getHours();
                let minutes = sched_date.getMinutes();
    
                let binaryHourStr = String((militaryHour || 12) - (militaryHour > 12 ? 12:0)).padStart(2,'0');
                let minStr = String(minutes).padStart(2,'0');
                let meridiem = (militaryHour < 12) ? "am" : "pm"

                let style = {
                    backgroundColor: notes[noteIndex].color
                } as React.CSSProperties;

                tasks.push(
                    <span key={noteIndex} className='front-task' style={style}>{title} - {binaryHourStr}:{minStr} {meridiem}</span>
                )
            }

            if (numOfNotes > 3) {
                tasks.push(
                    <span key={"more"} className='front-task extra'>{numOfNotes - 3} more tasks...</span>
                )
            }
        }


        const onClickFunc = isOutsideMonth ? undefined : () => {selectDate(day)}; 
        
        dateBoxes.push(
            <div key={calendarIndex+1} className={`date-box${className}`} onClick={onClickFunc}>
                <span className='date'>{dateBoxValues[calendarIndex].day}</span>
                {tasks}
            </div>
        );
    }

    return (
        <div className="calendar-body">
            <div className="month-label">February</div>
            <div className="weekday-label">Sunday</div>
            <div className="weekday-label">Monday</div>
            <div className="weekday-label">Tuesday</div>
            <div className="weekday-label">Wednesday</div>
            <div className="weekday-label">Thursday</div>
            <div className="weekday-label">Friday</div>
            <div className="weekday-label">Saturday</div>

            {dateBoxes}
        </div>

    )
}

export default Calendar;