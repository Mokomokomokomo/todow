import { useDispatch, useSelector } from "react-redux";
import { CNDispatch, CNState, setForm, setNewGroup, toggleNGForm } from "./store";
import { NoteState } from ".";
import CreateGroup from "./CreateGroup";

function Group () {
    let {group: value} = useSelector<CNState, NoteState>(state => state.form);
    let {defaultGroups, new_group, isTooltipShown} = useSelector<CNState, CNState['group']>(state => state.group);
    let dispatch = useDispatch<CNDispatch>();

    const changeGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let {value} = e.currentTarget;

        if(value == 'custom') {
            dispatch(toggleNGForm({show: true}));
        }
        else {
            dispatch(setForm({field: "group", value}));
        }

    }

    const setGroup = (value: string, cancel: boolean = false) => {
        if(cancel) {
            dispatch(toggleNGForm({show: false}));
        }
        else {
            dispatch(setNewGroup({field: "new_group", value: value}))
            dispatch(setForm({field: "group", value}));
        }
    }

    let defaultElem = defaultGroups.map((g, i) => <option key={i} value={g}>{g}</option>)

    return (
        <div className="cw select-input" id="group">
            <span className="label">Group: </span>
            <select name="group" value={value} onChange={changeGroup}>
                {defaultElem}
                {new_group && <option key={"customVal"} value={new_group}>{new_group}</option>}
                <option key={"custom"} value={"custom"}>New Groups</option>
            </select>
            {isTooltipShown && <CreateGroup initGroupName={new_group || ""} setGroup={setGroup} />}
        </div>
    )
}

export default Group;