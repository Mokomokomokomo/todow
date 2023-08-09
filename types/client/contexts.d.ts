export interface User {
    userid: number,
    username: string,
    password?: string,
    email: string 
}

export interface Layout {
    sidebarExpanded: boolean
}
