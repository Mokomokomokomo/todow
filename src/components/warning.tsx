import { WarningProps } from "../../types/client/component";

function Warning ({message, hideWarning}: WarningProps) {
    return (
        <div className="warning">
            <span>{message}</span>
            <button className="cancel_warning" onClick={hideWarning}>×</button>
        </div>
    )
}

export default Warning;