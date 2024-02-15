import { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import CreateNote from "./form/CreateNote";
import { DateObject, NoteState } from "./form";
import Calendar from "./Calendar";
import Timeline from "./Timeline";

function Content() {
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<DateObject>({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate()
    });
    const [tasks, setTasks] = useState<NoteState[]>([]);

    const getTasks = async () => {
        let res = await fetch('/api/task/getUserNotes', {
            method: 'post',
        }).then(dat => dat.json());
    
        if (res.length > 0) {
            setTasks(res);
        }
    }

    useEffect(() => {
        getTasks();
    }, []);

    const createNewTask = () => {
        let mainContent = document.getElementById("main-content")!;
        let contentForm = mainContent.getElementsByClassName("form")[0]!;
        let mainContentLeft = mainContent.getBoundingClientRect().left;
        let formLeft = contentForm.getBoundingClientRect().left;
        let offsetX = formLeft - mainContentLeft;

        let parentWrapper = mainContent.parentElement!;
        
        parentWrapper.scrollTo({
            behavior: "smooth",
            left: offsetX,
            top: 0
        });
        setTimeout(() => {
            setShowTaskForm(true);
        }, 150);
    }
    
    const returnToView = () => {
        let mainContent = document.getElementById("main-content")!;
        let parentWrapper = mainContent.parentElement!;

        parentWrapper.scrollTo({
            behavior: "smooth",
            left: 0
        });

        setTimeout(() => {
            setShowTaskForm(false);
        }, 150);
    }

    const changeTaskStatus = async (status: NoteState['status'], task_id: number) => {
        let res = await fetch('/api/task/updateStatus', {
            body: JSON.stringify({
                task_id,
                status
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(dat => dat.json());

        if (res.success) {
            setTasks(prevTasks => {
                return prevTasks.map(task => {
                    if (task.note_id == task_id) {
                        return {
                            ...task,
                            status
                        }
                    }
                    else {
                        return task;
                    }
                });
            });
        }
    }

    return (
        <div className="content">
            <Sidebar createNewTask={createNewTask} />
            <div className="scrollable-wrapper" style={{overflowY: showTaskForm ? 'hidden' : 'auto'}}>
                <div id="main-content">
                    <div className="view">
                        <Calendar notes={tasks} {...{selectedDate, setSelectedDate}} />
                        <div className="tml-divider">
                            <span className="label">Timeline</span>
                            <span className="pointer">&#9660;</span>
                        </div>
                        <Timeline {...{selectedDate, tasks, changeTaskStatus}} />
                    </div>
                    <div className="form">
                        <div className="return" onClick={returnToView}>
                            <span id="return-arrow">{'\u2190'}</span>
                            <span id="return-text">Return to Form Later</span>
                        </div>
                        <CreateNote updateTask={getTasks} returnToView={returnToView} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Content;