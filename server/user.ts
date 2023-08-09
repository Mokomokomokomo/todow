import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';
import { Router } from "express";
import { ConnectionConfig, TYPES as td } from "tedious";
import Queries from "./queries";
import {JwtPayload, sign, verify} from 'jsonwebtoken';
import { TokenObj, UserObj } from '../types/server';

const createToken = async (userid: number, transact: Queries): Promise<{token: string, uuid: string}> => {
    const key = randomBytes(32).toString('hex');
    const token = sign({
        userid: userid,
    }, key, {
        expiresIn: (3 * 60 * 60),
    });
    let uuid = randomUUID();

    await transact.insert_once('dbo.tokens', [
        {column: 'userid', type: td.Int, value: userid},
        {column: 'token', type: td.VarChar, value: token},
        {column: 'key', type: td.VarChar, value: key},
        {column: 'uuid', type: td.VarChar, value: uuid}
    ]);

    return {token, uuid};
}

function userRouter(conn: ConnectionConfig) {
    let router = Router();
    let transact = new Queries(conn);

    router.post('/validate', async (req, res) => {
        try {
            let cookies = req.cookies;

            if(cookies.token) {
                let {token} = req.cookies;
                let uuid = req.body.uuid;
                console.table({token, uuid});

                let data = await transact.select('dbo.tokens', ['userid', 'token', 'key'], [
                    {column: 'uuid', type: td.VarChar, value: uuid}
                ]);

                if (data.length == 0) {
                    console.log('No Rows Found');
                    res.json({success: false});
                }

                let serverToken = transact.convertDataToObj(data) as TokenObj;

                let payload = verify(token, serverToken.key) as JwtPayload;
                if(payload['userid'] != serverToken.userid) {
                    console.log('Token Invalid: userid mismatch');
                    res.json({success: false});
                }

                // get relevant user data
                data = await transact.select('dbo.user', [], [
                    {column: 'id', type: td.Int, value: serverToken.userid}
                ], 1);

                if (data.length == 0) {
                    console.log('No Rows Found');
                    res.json({success: false});
                }

                let user = transact.convertDataToObj(data) as UserObj;

                res.json({
                    success: true,
                    user: {
                        userid: user.id,
                        username: user.username,
                        email: user.email,
                    }
                });
            }
            else {
                console.log('No Rows Found');
                res.json({success: false});
            }

        }
        catch (e) {
            console.log(e);
            res.json({
                success: false,
            })
        }
    });

    router.post('/login', async (req, res) => {        
        let {username, password} = req.body;

        try {
            let data = await transact.select("dbo.user", [], [
                {column: 'username', type: td.VarChar, value: username}
            ], 1);

            if (data.length == 0) {
                throw new Error("No Rows Found");
            }

            let user = transact.convertDataToObj(data) as UserObj;
            let bufferSalt = Buffer.from(user.salt, "hex");
            let hashedPassword = pbkdf2Sync(password, bufferSalt, 10000, 32, "sha256").toString('hex');

            if (hashedPassword != user.password) {
                throw new Error("Password do not match");
            }

            // create token
            let {token, uuid} = await createToken(user.id, transact);

            res.cookie('token', token, {httpOnly: true});

            res.json({
                success: true,
                userid: user.id,
                uuid: uuid
            })
        }
        catch (e) {
            console.log(e);
            res.json({
                success: false
            });
        }
    });
    
    router.post('/register', async (req, res) => {
        try {
            let salt = randomBytes(16);
            let hash = pbkdf2Sync(req.body['password'], salt, 10000, 32, "sha256");

            let userid = await transact.insert_once("dbo.user", [
                {column: 'username', type: td.VarChar, value: req.body['username']},
                {column: 'password', type: td.VarChar, value: hash.toString('hex')},
                {column: 'salt', type: td.VarChar, value: salt.toString('hex')},
                {column: 'email', type: td.VarChar, value: req.body['email']}
            ]);

            const key = randomBytes(32).toString('hex');
            const token = sign({
                userid: userid,
            }, key, {
                expiresIn: (3 * 60 * 60),
            });
            let uuid = randomUUID();

            await transact.insert_once('dbo.tokens', [
                {column: 'userid', type: td.Int, value: userid},
                {column: 'token', type: td.VarChar, value: token},
                {column: 'key', type: td.VarChar, value: key},
                {column: 'uuid', type: td.VarChar, value: uuid}
            ]);

            res.cookie('token', token, {httpOnly: true});
            
            res.json({
                success: true,
                uuid,
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