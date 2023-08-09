import { Provider } from "react-redux";
import {getStore} from "../../store";

import useAuth from "../../hooks/useAuth";

import Login from "./Login";
import Error404 from "../Error404";
import Register from "./Register";
function UserIndex({path}: {path: string}) {
    let [user, finished] = useAuth();

    console.log(user);

    let children: JSX.Element;
    
    if(!finished) {
        children = <div></div>
    }
    else if(path == '/login') {
        children = <Login />
    }
    else if (path == '/register') {
        children = <Register />
    }
    else {
        children = <Error404 />
    }

    let store = getStore(user && user.userid > 0 ? user : undefined);

    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}

export default UserIndex;