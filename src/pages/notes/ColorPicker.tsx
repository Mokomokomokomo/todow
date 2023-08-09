import {Fragment, useState} from 'react';
import { Tooltip } from "../../components/Tooltip";

interface Props {
    /**
     * the current color of the input, represented (RGBA, HSL, Hexadecimal)
     */
    currColor: string
    /**
     * a string or strings of color options representing a valid color value (RGBA, HSL, Hexadecimal)
     */
    colorOptions: string | string[]
    /**
     * parent's form state set function
     */
    setForm: (field: any, value: any) => void
}

function ColorPicker({currColor, setForm, colorOptions}: Props) {
    let [pickColor, setPickColor] = useState(false);

    const toggle = () => {
        setPickColor(!pickColor);
    }
    
    const setColor = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        let {id} = e.currentTarget
        
        setForm('color', id);
        toggle();
    }
    
    colorOptions = ['#e9e7e7', ...(typeof colorOptions == 'string' ? [colorOptions] : colorOptions)]

    let options = colorOptions.map(color => (
        <div key={color} className='color-option' id={color} style={{backgroundColor: color}} onClick={setColor}>
            <div className="mask"></div>
        </div>
    ));

    return (
        <Fragment>
            <span>Color: </span>
            <div className="color-picker" style={{backgroundColor: currColor}} onClick={toggle}>
                <div className="mask"></div>
                {pickColor && <Tooltip direction='vertical' position="right" extraOptions={{gap: 5, height: 30 * colorOptions.length, spacing: "space-around"}}>
                    {options}
                </Tooltip>}
            </div>
        </Fragment>
    )
}

export default ColorPicker;