import { Router } from 'express';
import { ConnectionConfig, TYPES as tp } from 'tedious';
import { randomBytes, pbkdf2Sync as encrypt } from 'node:crypto';

import Queries from './queries';

import { Session, ValidationResponse } from '../types/server/index';
import { Column } from '../types/server/queries';

/**
 * 
 * @param str The string to be encrypted
 * @returns Object containing the encrypted string(Hash) and the salt to decrypt with
 */
const encryptSHA256 = (str: string  ) => {
    let salt = randomBytes(8);

    const hash = encrypt(str, salt, 10000, 64, "sha256");   
    return {
        hash,
        salt
    }
}

function SessionRouter(dbConfig: ConnectionConfig) {
    const router = Router();
    const transact = new Queries(dbConfig);

    router.use((req, res, next) => {
        if(req.method === "GET") {
            res.status(404).send("Request Unauthorized");
            return;
        }

        console.log(req.headers.location, req.headers.origin);
        next();
    });

    router.post('/validate', async (req, res) => {
        // @ts-ignore
        let { session_id, expires, status, userid } = req.body as Session;

        try {
            let found_session = [];
            if(userid > 0) {
                found_session = await transact.select('dbo.session', [
                    'session_id',
                    'salt',
                    'expires'
                ], [
                    {column: 'uid', type: tp.Int, value: userid}
                ]);
            }
            else {
                found_session = await transact.select('dbo.session', [
                    'session_id',
                    'salt',
                    'expires'
                ], [
                    {column: 'session_id', type: tp.Int, value: session_id}
                ]);
            }

            if(found_session.length > 0) {
                found_session.forEach(c => console.log(c));
            }

            res.json({
                validated: false,
                reason: 'because why not',
                head: req.headers
            } as ValidationResponse);
        }
        catch(error) {
            res.json({
                validated: false,
                reason: error
            });
        } 
    });

    router.post('/create', async (req, res) => {
        let { curr_session , refresh} = req.body as {curr_session: Session, refresh: boolean};

        let session_id = randomBytes(16).toString('hex');
        let created = Date.now();
        let expires = created + (7 * (24 * 60 * 60 * 1000));

        let enc = encryptSHA256(session_id);

        try {
            if(refresh) {
                transact.alter('dbo.session', [
                    {column: 'session_id', type: tp.Text, value: enc.hash.toString('hex')},
                    {column: 'salt', type: tp.Text, value: enc.salt.toString('hex')},
                    {column: 'created', type: tp.BigInt, value: created},
                    {column: 'expires', type: tp.BigInt, value: expires},
                ], [
                    {column: 'session_id', type: tp.Text, value: curr_session.session_id},
                    curr_session.userid >=0 ? {column: 'uid', type: tp.Int, value: curr_session.userid} : {} as Column,
                ]);
            }
            else {
                transact.insert_once('dbo.session', [
                    {column: 'session_id', type: tp.Text, value: enc.hash.toString('hex')},
                    {column: 'salt', type: tp.Text, value: enc.salt.toString('hex')},
                    {column: 'created', type: tp.BigInt, value: created},
                    {column: 'expires', type: tp.BigInt, value: expires},
                    {column: 'uid', type: tp.Int, value: curr_session.userid || 'NULL'}
                ]).then(() => {
                    res.json({
                        session_id,
                        expires,
                        status: 'validated',
                        error: null
                    });    
                });
            }
        } 
        catch (error) {
            res.json({
                session_id: curr_session.session_id,
                expires: curr_session.expires,
                status: 'error',
                error: error
            });
        }
    });

    return router;
}

export default SessionRouter;