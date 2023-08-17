import { useSelector } from "react-redux";
import { CNState } from "./store";
import {ConvertOptions, RGBA} from '.';
import { useEffect, useState } from "react";

const splitByLength = (str: string, length: number) => {
    const res = [];

    let index = 0;
    while (index < str.length) {
        res.push(str.slice(index, index + length));
        index += length;
    }

    return res;
}

const convertHexToRGBA = (hex: string, options: ConvertOptions = {}): string | RGBA | undefined => {
    let {returnString = false, valueType = "numerical"} = options;

    let pattern = hex[0] == '#' ? hex.slice(1) : hex;
    
    /** validate hex pattern */
    // check for valid length
    let short = pattern.length >= 3 && pattern.length <= 4;
    let long = pattern.length == 6 || pattern.length == 8;

    let values: string[];
    if(short) {
        values = splitByLength(pattern, 1);
        values = values.map(c => c+c);
    }
    else if (long) {
        values = splitByLength(pattern, 2);
    }
    else {
        return undefined;
    }

    // check if all values are hex values
    let isHexValue = /^[0-9a-f]{1,2}$/i;
    let isValidHex = values.every(v => isHexValue.test(v));

    if (!isValidHex || values.length > 4) {
        return undefined;
    }

    let [red, blue, green, alpha]: number[] | string[] = values;
    if (valueType == "numerical") {
        red = parseInt(values[0],16);
        green = parseInt(values[1],16);
        blue = parseInt(values[2],16);
        alpha = Math.min(100, parseInt(values[3] || 'FF', 16));
    }
    
    if (returnString) {
        return `rgba(${red} ${green} ${blue} / ${alpha}%)`;
    }

    return { 
        red, green, blue, alpha,
        toCSS() {
            let {red, green, blue, alpha} = this;
            return `rgba(${red} ${green} ${blue} / ${alpha}%)`;
        },
        adjust(value) {
            this.red = this.red as number + value;
            this.green = this.green as number + value;
            this.blue = this.blue as number + value;
        },
    } as RGBA;
}

function Submit() {
    let color = useSelector<CNState, string>(state => state.form.color!);
    let shade = convertHexToRGBA(color) as RGBA;
    let [bg, setBG] = useState(color);
    
    useEffect(() => {
        setBG(color);
    }, [color]);

    const darken = () => {
        shade.adjust(-35)
        shade.alpha = 80;
        setBG(shade.toCSS());
    }

    const lighten = () => {
        setBG(color);
    }

    const style = {
        backgroundColor: bg,
    } as React.CSSProperties;

    return (
        <div className="cw-center" style={style} id="submit-note" onMouseEnter={darken} onMouseLeave={lighten}>
            <span>Create</span>
        </div>
    )
}

export default Submit;