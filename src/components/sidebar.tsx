import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import Warning from "./warning";
import GroupedNotes from "./groupedNotes";
import { StoreState } from "../store";
import { Layout } from "../../types/client/contexts";
import { SidebarProps } from "../../types/client/component";

function Sidebar({createNote}: SidebarProps) {
    let layout = useSelector<StoreState, Layout>(state => state.layout);
    // let user = useSelector<StoreState, User>(state => state.user);
    // let dispatch = useDispatch<StoreDispatch>();
    
    let [showSessionWarning, setShowSessionWarning] = useState(
        // validate user and session
        true
    );

    useEffect(() => {
        console.log(layout);
        
    }, [layout]);

    return (
        <div className={`sidebar${(layout.sidebarExpanded ? '' : ' shrink')}`}>
            <div className={`user_actions`}>
                <div className={"nav_button"}  id="add_todo" onClick={createNote}>
                    <img
                        src={"/create_note.svg"} 
                        width={30} 
                        height={30} 
                        alt="create_note.svg"
                    />
                    <span>Create New Todo List</span>
                    {/* {layout.sidebarExpanded && <span>Create New Todo List</span>} */}
                </div>
            </div>
            {/* grouped notes go here */}
            <div className={"grouped_notes"}>
                {
                    showSessionWarning && 
                    <Warning 
                        message={"You are not logged in! Please note that you may have limited access to features."} 
                        hideWarning={() => setShowSessionWarning(false)}
                    />
                }
                <GroupedNotes />
            </div>
        </div>
    )
}

export default Sidebar;