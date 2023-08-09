function FlowSVG({color}: {color: string}) {
    return (
        <svg width="283" height="733" viewBox="0 0 283 733" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="group_1">
                <rect id="circle" x="91" width="100" height="100" rx="50" fill={color || "#E9AAAA"}/>
                <rect id="circle_2" x="91" y="150" width="100" height="100" rx="50" fill={color || "#E9AAAA"}/>
                <rect id="circle_3" x="91" y="300" width="100" height="100" rx="50" fill={color || "#E9AAAA"}/>
                <rect id="circle_4" x="91" y="450" width="100" height="100" rx="50" fill={color || "#E9AAAA"}/>
                <path id="arrow" d="M17.0711 608.492C10.7714 602.193 15.2331 591.421 24.1421 591.421L258.701 591.421C267.61 591.421 272.071 602.193 265.772 608.492L148.492 725.772C144.587 729.677 138.256 729.677 134.35 725.772L17.0711 608.492Z" fill={color || "#E9AAAA"}/>
            </g>
        </svg>
    )
}

export default FlowSVG;