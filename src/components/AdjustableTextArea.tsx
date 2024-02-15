import { useState, useLayoutEffect } from "react";

interface TextAreaProps {
    /**
     * Must be a unique id.
     */
    id: number,
    placeholder?: string,
    /**
     * State value by which the TextArea refers to
     */
    value: string,
    /**
     * Set State Function of Parent which determines the value
     */
    setState: (value: string) => void;
}

function AdjustableTextArea ({id, value, placeholder, setState}: TextAreaProps) {
    let [descHeigth, setDescHeigth] = useState('auto');

    useLayoutEffect(() => {
        if(descHeigth == 'auto') {
            let ta = document.getElementById(`ta-${id}`) as HTMLTextAreaElement;
            let {scrollHeight} = ta;
            let {borderTopWidth: top, borderBottomWidth: bottom} = getComputedStyle(ta);

            setDescHeigth(`${scrollHeight + parseInt(top) + parseInt(bottom)}px`);
        }
    }, [descHeigth]);

    const setStateHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        let {value} = e.currentTarget;

        setDescHeigth(`auto`);
        setState(value);
    }

    return (
        <textarea 
            name="description"
            id={`ta-${id}`}
            value={value}
            onInput={setStateHandler}
            rows={1}
            style={{height: descHeigth}}
            placeholder={placeholder || ''}
        />
    )
}

export default AdjustableTextArea;