import Home from "./Home";
import { Provider } from "react-redux";
import getStore from "../../store";
import { useEffect, useState } from "react";

function NotesIndex() {
    let [user, setUser] = useState(undefined);
    useEffect(() => {
        (async () => {
            let user = await fetch('/api/user/getUser', {
                method: 'post'
            }).then(dat => dat.json());

            if (user.userid) {
                setUser(user);
            }
        })();

    }, []);

    return (
        <Provider store={getStore(user)}>
            {user && <Home/>}
        </Provider>
    )
}

export default NotesIndex;