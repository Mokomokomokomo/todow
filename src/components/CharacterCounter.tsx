interface CCProps {
    charlimit: number,
    current: number,
}

function CharacterCounter(props: CCProps) {
    return (
        <div className="character-counter">
            <span className="counter-current">{props.current}</span>
            <div className="divider"></div>
            <span className="counter-limit">{props.charlimit}</span>
        </div>
    )
}

export default CharacterCounter;