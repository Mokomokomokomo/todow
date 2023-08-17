import {Fragment, useState} from 'react';
import { Tooltip } from '../../../components/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { CNDispatch, CNState, setForm } from './store';
import { NoteState } from '.';

function ColorPicker({options}: {options: string[]}) {
    let {color} = useSelector<CNState, NoteState>(state => state.form);
    let dispatch = useDispatch<CNDispatch>();
    let [pickColor, setPickColor] = useState(false);

    const toggle = () => {
        setPickColor(!pickColor);
    }
    
    const setColor = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        let {id} = e.currentTarget
        
        dispatch(setForm({field:"color", value: id}));
        toggle();
    }
    
    let colorOptions = ['#e9e7e7', ...options];

    let optionElements = colorOptions.map(color => (
        <div key={color} className='color-option' id={color} style={{backgroundColor: color}} onClick={setColor}>
            <div className="mask"></div>
        </div>
    ));

    return (
        <Fragment>
            <span>Color: </span>
            <div className="color-picker" style={{backgroundColor: color}} onClick={toggle}>
                <div className="mask"></div>
                {pickColor && <Tooltip direction='vertical' position="right" extraOptions={{gap: 5, height: 30 * colorOptions.length, spacing: "space-around"}}>
                    {optionElements}
                </Tooltip>}
            </div>
        </Fragment>
    )
}

export default ColorPicker;