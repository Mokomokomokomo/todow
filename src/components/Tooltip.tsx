import { CSSProperties } from "react";
import { ComponentChildren } from "../../types/client/component"

type edge = "top" | "left" | "right" | "bottom";
type direction = "horizontal" | "vertical"

interface TOptions {
    className: string,
    id: string,
    width: number,
    height: number,
    gap: number,
    color: string,
    hasBorder: boolean,
    spacing: CSSProperties["justifyContent"],
}

interface TProps extends ComponentChildren {
    position: edge,
    direction: direction
    extraOptions?: Partial<TOptions>
}

type getPP = (
    pos: edge,
    area?: {width: number, height: number, innerOffset?: number},
) => {top: string, left: string}

/**
 * Gets the position of the tooltip pointer based on the position of the tooltip
 * relative to its parent container
 * 
 * @param pos position of the tooltip relative to its parent container
 * @param area.width width of tooltip container
 * @param area.height height of tooltip container
 * @param area.innerOffset determines how much to subtract the final value so that it is x-units closer inside the container. 
 * @returns top and left position in percentage value. if width, height or innerOffset is defined, returns in px value
 */
const getPointerPos: getPP = (pos: edge, area) => {
    // define center of container
    let center = {top: 50, left: 50};

    // right and bottom moves the element forwards in the container
    // origin of top = 0, left = 0. While top and left moves the
    // element closer to the origin point, meaning reverse.
    let direction = pos == 'right' || pos == 'bottom' ? 50 : -50
    
    // get position of pointer.
    // ensure the right and bottom pos correctly subtract from the
    // correct axis (bottom increases top, right increases left).
    let axis: edge = pos == 'top' || pos == 'bottom' ? 'top' : 'left';
    let pointerPos = {
        ...center,
        [axis]: center[axis] + direction
    }

    // convert to px if width, height or innerOffset is defined.
    if (area) {
        let {width, height, innerOffset} = area;
        
        pointerPos.top = (height * (pointerPos.top / 100));
        pointerPos.left = (width * (pointerPos.left / 100));

        
        if(innerOffset) {
            console.log(axis, pointerPos[axis], pointerPos[axis] - innerOffset);
            pointerPos[axis] -= innerOffset
        }

        return {
            top: pointerPos.top+'px',
            left:pointerPos.left+'px'
        }
    }
    else {
        return {
            top: pointerPos.top+'%',
            left: pointerPos.left+'%'
        }
    }
}

const invert = (pos: edge): edge => {
    return (
        pos == 'top' || pos == 'bottom' 
        ? pos == 'top' ? 'bottom' : 'top'
        : pos == 'left' ? 'right' : 'left'
    )
}

const capitalize = (str: string) => {
    return str.replace(str.charAt(0), str.charAt(0).toUpperCase());
}

const initOptions: TOptions = {
    color: '',
    gap: 0,
    id: '',
    className: '',
    width: 40,
    height: 40,
    hasBorder: true,
    spacing: ""
}

function Tooltip({position, direction, extraOptions, children}: TProps) {
    // set option values based on default and provided options
    let {
        width,
        height,
        color,
        gap,
        id,
        className,
        hasBorder,
        spacing,
    } = {
        ...initOptions,
        ...(direction == "horizontal" ? {width: 80} : {height: 80}), 
        ...extraOptions
    };
    
    // dimension of pointer square
    let ptDim = Math.min(width, height)  * .40;
    let ptDir = invert(position);
    let ptPos = getPointerPos(ptDir, {width: width, height: height, innerOffset: hasBorder ? 1 : 0});
    let ptArea = (Math.sqrt(ptDim**2 + ptDim**2)) / 2;
    
    
    let pointerStyle = {
        position: "absolute",
        width: ptDim+'px',
        height: ptDim+'px',
        top: ptPos.top,
        left: ptPos.left,
    } as React.CSSProperties

    let tooltipStyle = {
        width: width,
        height: height,
        backgroundColor: color,
        border: hasBorder ? '1px solid black' : '',
        [`margin${capitalize(ptDir)}`]: ptArea + gap,
    } as React.CSSProperties

    let tooltipClass = `tooltip ${direction} ${position}${className ? ' '+className: ''}`;

    return (
        <div className={tooltipClass} style={tooltipStyle} id={id}>
            <div className="tooltip-content" style={{justifyContent: spacing}}>
                {children}
            </div>
            <div className={`tooltip-pointer ${ptDir}`} style={pointerStyle}></div>
        </div>
    )
}

export {Tooltip}