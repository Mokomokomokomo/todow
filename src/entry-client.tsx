import ReactDOM from 'react-dom/client';

import NotesIndex from './pages/notes/Index';
import UserIndex from './pages/users/Index';
import Error404 from './pages/Error404';

let client: React.JSX.Element;
let location = window.location.pathname;

if(location === '/notes') {
    client = <NotesIndex />
}
else if (location.startsWith('/user')) {
    client = <UserIndex path={location.replace('/user', '')} />
}
else {
    client = <Error404 />
}

ReactDOM.hydrateRoot(
    document.getElementById('root') as HTMLDivElement,
    client
)