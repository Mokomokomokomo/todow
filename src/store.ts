import { configureStore } from '@reduxjs/toolkit';

import layout from './contexts/layoutContext.js';
import user from './contexts/userContext';

import {User} from '../types/client/contexts.js';

let store = configureStore({
    
    reducer: {
        layout,
        user,
    }
});

export const getStore = (initUser?: User) => {
    let store = configureStore({
        preloadedState: {
            ...(initUser ? {user: initUser} : {})
        },
        reducer: {
            user,
            layout
        }
    });

    return store;
}

export type StoreState = ReturnType<(typeof store.getState)>
export type StoreDispatch = typeof store.dispatch
export default store;