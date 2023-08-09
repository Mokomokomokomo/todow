import Home from "./Home";
import { Provider } from "react-redux";
import store from "../../store";

function NotesIndex() {
    return (
        <Provider store={store}>
            <Home />
        </Provider>
    )
}

export default NotesIndex;