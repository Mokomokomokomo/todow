import { MouseEventHandler, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NoteState, RGBA, DateObject } from "./form";
import { convertHexToRGBA } from "./form/Submit";
import { sm } from "../../assets/javascript/Time";

function toMilitaryTimeStr(hour: number, minutes: number) {
    return `${String(hour).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
}

function toBinaryTimeStr(hour: number, minutes: number) {
    let binaryHour = hour > 12 ? hour - 12 : hour;
    let binaryTC = hour == 0 || hour < 12 ? 'am':'pm';

    return `${String(binaryHour).padStart(2,'0')}:${String(minutes).padStart(2,'0')} ${binaryTC}`;
}

interface TimeLineProps {
    tasks: NoteState[]
    changeTaskStatus: (status: NoteState['status'], task_id: number) => Promise<void>
    selectedDate: DateObject
}

function Timeline ({tasks, changeTaskStatus, selectedDate}: TimeLineProps) {
    let [currentTime, setCurrentTime] = useState(() => {
        let temp = new Date();
        return {
            hour: temp.getHours(),
            minutes: temp.getMinutes(),
            seconds: temp.getSeconds()
        }
    });
    let [currentTimePos, setCurrentTimePos] = useState(0);
    let [timelinePoints, setTimelinePoints] = useState([] as any[]);
    let [taskElements, setTaskElements] = useState([] as any[]);
    let [isHovering, setIsHovering] = useState(false);
    let hoveredTime = useRef({
        hour: 0,
        minutes: 0
    });
    let timeInterval = useRef<NodeJS.Timer>();
    let releaseHover = useRef<NodeJS.Timeout>();

    const expandTimelinePoint = (barNumber: number, intervalPos: number) => {
        clearTimeout(releaseHover.current);
        let time = barNumber * 10;
        let hour = Math.floor(time/60);
        let minutes = time % 60;
        
        setCurrentTimePos(intervalPos);
        hoveredTime.current = {hour, minutes};
        setIsHovering(true);
    }

    const restoreTimelinePoint = (intervalPos: number) => {
        hoveredTime.current = {hour: currentTime.hour, minutes: currentTime.minutes};
        releaseHover.current = setTimeout(() => {
            setCurrentTimePos(intervalPos);
            setIsHovering(false)
        }, 250);
    }

    const generateTHRPoints = () => {
        let tHR = document.getElementById("t-hr");
        let tHRWidth = tHR!.getBoundingClientRect().width;
        let numOfPoints = ((24 * 60) / 10) + 1; // every 10 minute interval
        let intervalWidth = tHRWidth / numOfPoints;
        let {hour, minutes} = currentTime;
        let currentInterval = Math.floor((hour * 60 + minutes) / 10); // get current interval based on current time
        
        let pointsArray = [] as any[];
        for (let barNumber=0; barNumber<numOfPoints;barNumber++) {
            let className = 't-hr-point';
            let span = '' as any;

            let time =  barNumber * 10;
            let hour = Math.floor(time/60);
            let minutes = time % 60;
            
            if (barNumber == currentInterval) {
                className = className + ' current';
            }

            if (barNumber % 6 == 0) {
                className = className + ' hour-hand'
                span = <span>{toMilitaryTimeStr(hour, minutes)}</span>
            }

            if (barNumber == 0 || barNumber == numOfPoints - 1) {
                className = className + ' endpoint'
                span = <span>{toMilitaryTimeStr(hour, minutes)}</span>
            }
            
            pointsArray.push(
                <div key={'p'+barNumber} 
                    className={className} 
                    style={{left: barNumber * intervalWidth}}
                    onMouseEnter={(e) => {
                        if (e.target == e.currentTarget) {
                            expandTimelinePoint(barNumber, barNumber * intervalWidth);
                        }
                    }}
                    onMouseLeave={() => {
                        restoreTimelinePoint(currentInterval * intervalWidth);
                    }}
                >
                    {span}
                </div>
            );
        }

        setCurrentTimePos(currentInterval * intervalWidth);
        setTimelinePoints(pointsArray);
    }

    useEffect(() => {
        if (currentTime.minutes % 10 == 0) {
            generateTHRPoints();
        }
    }, [currentTime.minutes]);

    useEffect(() => {
        let selectedTasks = tasks.filter(task => {
            let schedDate = new Date(task.sched_date);
            let year = schedDate.getFullYear();
            let month = schedDate.getMonth();
            let day = schedDate.getDate();

            return (
                selectedDate.year == year,
                selectedDate.month == month,
                selectedDate.day == day
            )
        });

        let taskElements = [] as any[];
        if(selectedTasks.length > 0) {
            taskElements = selectedTasks.map((task, index) => {
                let {title, content, sched_date, color, group, status, note_id} = task;
                let rgbColor = convertHexToRGBA(color) as RGBA;

                rgbColor.alpha -= 20;

                let noteColor = {
                    backgroundColor: rgbColor.toCSS()
                } as React.CSSProperties;

                let schedDateObj = new Date(sched_date);
                let militaryHour = schedDateObj.getHours();
                let binaryHour = militaryHour - (militaryHour > 12 ? 12 : 0);
                if (binaryHour == 0) {
                    binaryHour = 12;
                }
                let minutes = schedDateObj.getMinutes();
                let meridiem = militaryHour < 12 ? "am":"pm";

                let schedDateInfo = ( 
                    <div className="sched-date">
                        <span className="date">{sm[schedDateObj.getMonth()]} {schedDateObj.getDate()}</span>
                        <span className="binary">{String(binaryHour).padStart(2,'0')}:{String(minutes).padStart(2,'0')} {meridiem}</span>
                        <span className="military">{String(militaryHour).padStart(2,'0')}:{String(minutes).padStart(2,'0')}</span>
                    </div>
                );
                
                const changeStatusHandler = (e: React.MouseEvent<HTMLDivElement>) => {
                    let status = e.currentTarget.nextSibling!.textContent;
                    if (status == 'Done') {
                        changeTaskStatus("done", note_id);
                    }
                    else {
                        changeTaskStatus("unfinished", note_id);
                    }
                }

                return (
                    <div key={index} className="task">
                        <div className="header" style={noteColor}>
                            <div className="delete">
                                <span>{'\u00d7'}</span>
                            </div>
                        </div>
                        <div className="body">
                            <div className="title">
                                <span>{title}</span>
                            </div>
                            <div className="subinfo">
                                <span className="label">Time: </span>
                                {schedDateInfo}
                                <span className="label" style={{flexGrow: 1, textAlign: "right"}}>Group: </span>
                                <span className="group-info">{group}</span>
                            </div>
                            <div className="content" style={noteColor}>
                                <span>{content}</span>
                            </div>
                        </div>
                        <div className="status">
                            <div className="done">
                                <div className={`toggle${status == 'done' ? ' toggled':''}`} onClick={changeStatusHandler}>
                                    {status == 'done' ? '\u2714' : ''}
                                </div>
                                <span className="label">Done</span>
                            </div>
                            <div className="unfinished">
                                <div className={`toggle${status != 'done' ? ' toggled':''}`} onClick={() => changeTaskStatus("unfinished", note_id)}>
                                    {status != 'done' ? '\u2714' : ''}
                                </div>
                                <span className="label">Not Done</span>
                            </div>
                        </div>
                    </div>
                )
            });
        }

        setTaskElements(taskElements);
    }, [tasks, selectedDate]);

    useLayoutEffect(() => {
        generateTHRPoints();
        timeInterval.current = setInterval(() => {
            let newTime = new Date();
            setCurrentTime({
                hour: newTime.getHours(),
                minutes: newTime.getMinutes(),
                seconds: newTime.getSeconds()
            });
        }, 1000);
    }, []);

    let currentTimeValue = toMilitaryTimeStr(
        isHovering ? hoveredTime.current.hour : currentTime.hour,
        isHovering ? hoveredTime.current.minutes : currentTime.minutes
    );

    let readableDate = `${sm[selectedDate.month]} ${selectedDate.day}`;

    return (
        <div id="timeline">
            <header className="header">Timeline</header>
            <div id="t-hr">
                {timelinePoints}
                <span id="t-hr-current" style={{left: currentTimePos}}>
                    {currentTimeValue}
                </span>
            </div>

            <div id="todays-tasks">
                {taskElements.length > 0 ? taskElements : <span className="no-tasks">No Tasks on {readableDate}</span>}
            </div>
        </div>
    )
}

export default Timeline;