import {
    CreateNoteProps,
} from "./index";

import { Provider } from "react-redux";
import store from "./store";
import Header from "./Header";
import SelectDate from "./SelectDate";
import ColorPicker from "./ColorPicker";
import Title from "./Title";
import Group from "./Group";
import NoteContent from "./NoteContent";
import Submit from "./Submit";

function CreateNote({maxTitleLength = 20}: CreateNoteProps) {
    let colorOptions = [
        '#db6666',
        '#5690d7',
        "#c4fc90",
        "#7b6fe4"
    ];

    return (
        <Provider store={store}>
            <form className="note" id="create-note">
                <Header />
                <div id="note-body">
                    <div className="cw-mult select-input">
                        <SelectDate />
                        <ColorPicker options={colorOptions} />
                    </div>
                    <Title maxTitleLength={maxTitleLength} />
                    <Group  />
                    <NoteContent />
                </div>
                <Submit />
            </form>
        </Provider>
    )
}

export default CreateNote;