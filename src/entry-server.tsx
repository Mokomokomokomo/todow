import { renderToString } from 'react-dom/server';

import NotesIndex from './pages/notes/Index';   
import UserIndex from './pages/users/Index';
import Error404 from './pages/Error404';

function render(path: string) {
    let ssrPage: React.JSX.Element;

    if(path === '/notes') {
        ssrPage = <NotesIndex />
    }
    else if(path.startsWith('/user')) {
        ssrPage = <UserIndex path={path.replace('/user', '')} />
    }
    else {
        ssrPage = <Error404 />;
    }
    return renderToString(ssrPage);
}

export interface EntryServer {
    render: typeof render
};
export { render };