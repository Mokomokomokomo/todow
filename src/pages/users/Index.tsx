import { Provider } from "react-redux";
import getStore from "../../store";

import Login from "./Login";
import Register from "./Register";
import Error404 from "../Error404";

function UserIndex({path}: {path: string}) {
    let children: JSX.Element;
    
    /** define paths for urls */
    let pages = {
        '/login': <Login />,
        '/register': <Register />,
    }
    type pageRoute = keyof (typeof pages);
    children = pages[path as pageRoute];
    
    if(!children) {
        children = <Error404 />
    }
    
    return (
        <Provider store={getStore()}>
            {children}
        </Provider>
    )
}

export default UserIndex;