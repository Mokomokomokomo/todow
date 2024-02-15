import { useEffect, useState } from "react";
import Redirect from "../../components/Redirect";
import { useDispatch, useSelector } from "react-redux";
import { StoreDispatch, StoreState } from "../../store";
import { User } from "../../../types/client/contexts";
import { logout } from "../../contexts/userContext";

function Logout() {
    let user = useSelector<StoreState, User>(state => state.user);
    let dispatch = useDispatch<StoreDispatch>();
    let [finished, setFinished] = useState(false);

    let redirect = <Redirect url="/notes"/>;
    let loading = (
        <div className="logout">Logging Out...</div>
    )

    useEffect(() => {
        if (user.userid > 0) {
            
        }
    }, [user.userid]);

    useEffect(() => {
        dispatch(logout(user));
    }, []);

    return (
        <div className="cw-center">
            {finished ? redirect : loading}
        </div>
    )
}

export default  Logout;