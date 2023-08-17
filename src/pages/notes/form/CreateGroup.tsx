import { useState } from 'react';

export interface CreateGroupProps {
    initGroupName: string,
    setGroup: (value: string, cancel?: boolean) => void
}

function CreateGroup({initGroupName, setGroup}: CreateGroupProps) {
    const [newGroup, setNewGroup] = useState<string>(initGroupName);

    const cancel = () => {
        setGroup(newGroup, true);
    }

    const confirm = () => {
        setGroup(newGroup);
    }

    const updateText = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let {value} = e.target as HTMLInputElement
        
        setNewGroup(value);
    }

    return (
        <div className="create-group">
            <input type="text" value={newGroup} onInput={updateText} placeholder='Create New Group' maxLength={20} />
            <input type="button" className="confirm-button" value="✅" onClick={confirm} title='confirm' />
            <input type="button" className="cancel-button" value="❌" onClick={cancel} title='cancel' />
        </div>
    )
}

export default CreateGroup;