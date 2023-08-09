export interface TokenObj {
    userid: number,
    token: string,
    key: string
}

export interface UserObj {
    id: number,
    username: string,
    email: string,
    password: string,
    salt: string
}