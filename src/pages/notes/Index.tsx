import Home from "./Home";
import { Provider } from "react-redux";
import getStore from "../../store";
import useAuth from "../../hooks/useAuth";

function NotesIndex() {
    let [user] = useAuth();

    let store = getStore(user); 

    return (
        <Provider store={store}>
            <Home />
        </Provider>
    )
}

export default NotesIndex;