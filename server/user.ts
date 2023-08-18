import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { Router } from "express";
import { ConnectionConfig, TYPES as td } from "tedious";
import Queries from "./queries";
import {JwtPayload, TokenExpiredError, sign, verify} from 'jsonwebtoken';
import { UserObj } from '../types/server';
import { Column } from '../types/server/queries';

const createToken = async (userid: number): Promise<string> => {
    const token = sign({
        userid: userid,
        role: 'user',
        
    }, process.env.SECRET_KEY as string, {
        issuer: "todow",
        subject: `${userid}`,
        expiresIn: (12 * 60 * 60),
    });


    return token;
}

function userRouter(conn: ConnectionConfig) {
    let router = Router();
    let transact = new Queries(conn);

    router.post('/validate', async (req, res) => {
        let cookies = req.cookies;
        let {token} = req.cookies;

        try {
            if(cookies.token) {
                let payload = verify(token, process.env.SECRET_KEY as string) as JwtPayload;

                let where: Column<UserObj>[] =  [
                    {name: 'id', type: td.Int, value: payload['userid']}
                ]

                // get relevant user data
                let data = await transact.select('dbo.user', [], where, 1);

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
                console.log('No Token Found');
                res.json({success: false});
            }

        }
        catch (e) {
            if (e instanceof TokenExpiredError) {
                console.log(`Token expired on ${e.expiredAt}.`);
                res.clearCookie('token');
            }
            else {
                console.log(e);
            }
            
            res.json({
                success: false,
            });
        }
    });

    router.post('/logout',async (req, res) => {
        let token = req.cookies.token as string;
        try {
            if(token) {
                res.clearCookie('token');

                res.json({
                    success: true
                });
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
                {name: 'username', type: td.VarChar, value: username}
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
            let token = await createToken(user.id);

            res.cookie('token', token, {httpOnly: true});

            res.json({
                success: true,
                userid: user.id,
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
                {name: 'username', type: td.VarChar, value: req.body['username']},
                {name: 'password', type: td.VarChar, value: hash.toString('hex')},
                {name: 'salt', type: td.VarChar, value: salt.toString('hex')},
                {name: 'email', type: td.VarChar, value: req.body['email']}
            ]);

            let token = createToken(userid);

            res.cookie('token', token, {httpOnly: true});
            
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