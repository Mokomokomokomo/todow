import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';
// import {JwtPayload, TokenExpiredError, sign, verify} from 'jsonwebtoken';

import { Router } from "express";
import { ConnectionConfig, TYPES as td } from "tedious";
import Queries from "./queries";
import { UserObj } from '../types/server';

class PasswordMatchError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PasswordMatchError";
    }
}

function userRouter(conn: ConnectionConfig) {
    let router = Router();
    let transact = new Queries(conn);

    router.post('/getuser', async (req,res) => {
        let {uuid} = req.cookies;

        console.log(uuid);

        if (uuid) {
            let data = await transact.select("dbo.session", [], [
                {name: 'uuid', type: td.NVarChar, value: uuid}
            ], {limit: 1});

            console.log(data);

            // no uuid in database, delete uuid
            if (data.length == 0) {
                res.clearCookie('uuid');
            }
            else {
                let user = transact.convertDataToObj(data[0]) as UserObj;
                res.json({
                    userid: user.id
                });
            }
        }
        else {
            res.json({
                userid: 0
            });
        }
    });

    router.post('/logout',async (req, res) => {
        let {uuid} = req.cookies;

        try {
            
            await transact.delete('dbo.session', [
                {name: 'uuid', type: td.NVarChar, value: uuid}
            ]);

            res.clearCookie('uuid');
            res.json({
                success: true
            });
        }
        catch (e) {
            throw e;
        }
    });

    router.post('/login', async (req, res) => {        
        let {username, password} = req.body;

        try {
            let data = await transact.select("dbo.user", [], [
                {name: 'username', type: td.VarChar, value: username}
            ], {limit: 1});

            if (data.length == 0) {
                throw new Error("No Rows Found");
            }

            let user = transact.convertDataToObj(data[0]) as UserObj;
            let bufferSalt = Buffer.from(user.salt, "hex");
            let hashedPassword = pbkdf2Sync(password, bufferSalt, 10000, 32, "sha256").toString('hex');

            if (hashedPassword != user.password) {
                throw new PasswordMatchError("Password doesn't match");
            }

            // create token
            // let token = await createToken(user.id);
            // res.cookie('token', token, {httpOnly: true});
            let uuid = randomUUID();
            let expires_in = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
            res.cookie('uuid', uuid, {httpOnly: true, expires: expires_in});

            await transact.insert_once("dbo.session", [
                {name: 'uuid', type: td.UniqueIdentifier, value: uuid},
                {name: 'id', type: td.Int, value: user.id},
                {name: 'expires_in', type: td.DateTime, value: expires_in.toISOString()}
            ]);


            res.json({
                success: true,
                userid: user.id,
            })
        }
        catch (e) {
            console.log(e);
            res.json({
                success: false,
                error: e
            });
        }
    });
    
    router.post('/register', async (req, res) => {
        try {
            let salt = randomBytes(16);
            let hash = pbkdf2Sync(req.body['password'], salt, 10000, 32, "sha256");

            let userid = await transact.insert_once("dbo.user", [
                {name: 'username', type: td.VarChar, value: req.body['username']},
                {name: 'password', type: td.VarChar, value: hash.toString('hex')},
                {name: 'salt', type: td.VarChar, value: salt.toString('hex')},
                {name: 'email', type: td.VarChar, value: req.body['email']}
            ]);

            // let token = createToken(userid);
            // res.cookie('token', token, {httpOnly: true});
            
            res.json({
                success: true,
                userid
            });
        }
        catch (e) {
            console.log(e);
            res.json({
                success: false,
            });
        }
    });

    return router;
}

export default userRouter;