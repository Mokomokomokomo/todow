import { createSlice } from "@reduxjs/toolkit";
import { Layout } from "../../types/client/contexts";

const layoutContext = createSlice({
    name: "layout",
    initialState: {
        sidebarExpanded: true,
    } as Layout,
    reducers: {
        expandSidebar: (state) => {
            state.sidebarExpanded = !state.sidebarExpanded;
        }
    }
});

export const {expandSidebar} = layoutContext.actions;
export default layoutContext.reducer;