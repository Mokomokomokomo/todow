import express from 'express';
import bodyParser from 'body-parser';
import cookeParser from 'cookie-parser';

import { createServer } from 'vite';
import {Connection, ConnectionConfig} from 'tedious';
import fs from 'fs';
import path from 'path';

// import module to load to ssr
import { EntryServer } from './src/entry-server';

// import api or server routes here
import session from './server/session';
import user from './server/user';

async function start() {
    const app = express();
    const vite = await createServer({
        server: {middlewareMode: true},
        appType: 'custom'
    });

    let dbConfig = {
        server: "DESKTOP-UBNV1IF",
        authentication: {
            type: "default",
            options: {
                userName: "someguy",
                password: "charles",
            },
        },
        options: {
            encrypt: false,
            instanceName: "DVCHARLES",
            database: "todo",
            trustServerCertificate: true,
            
        }
    } as ConnectionConfig;

    // test for connection
    const conn = new Connection(dbConfig);
    conn.on('connect', (err) => {
        if (err) throw err;

        console.log(
            `Connection Established:\n`,
            `\tServer: ${dbConfig.server}/${dbConfig.options?.instanceName}\n`,
            `\tDB: ${dbConfig.options?.database}\n`
        );
        conn.close()
    });

    conn.connect();

    // middleware for parsers
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cookeParser());

    app.use(vite.middlewares);

    // redirect base urls to landing routes if needed 
    app.use('/', (req, res, next) => {
        if(req.originalUrl == '/') {
            res.redirect('/notes');
        }
        else {
            next();
        }
    });
    app.use('/user', (req, res, next) => {
        if(req.originalUrl == '/user') {
            res.redirect('/user/login');
        }
        else {
            next();
        }
    });

    // serve the page router
    app.use('/', async (req, res, next) => {
        const url = req.originalUrl;

        // ensure api calls don't serve any pages and go to the corresponding routes in the api server
        if(url.startsWith('/api/')) {
            next();
        }
        else {
            try {
                let template = fs.readFileSync(
                    path.resolve(__dirname, 'index.html'),
                    'utf-8'
                );
                template = await vite.transformIndexHtml(url, template);
                const { render } = (await vite.ssrLoadModule('/src/entry-server.tsx')) as EntryServer;
    
                const appHtml = render(url);
                const html = template.replace(`<!--ssr-outlet-->`, appHtml);
    
                res.status(200).set('Content-Type', 'text/html').end(html);
            }
            catch (err: any) {
                vite.ssrFixStacktrace(err);
    
                res.status(500).send({ error: 'An error occurred while loading the page' });
                console.log(err);
            }
        }

    });

    // call all routes here, no need to use app.use(). simply call the imported method as is
    app.use('/api/session', session(dbConfig));
    app.use('/api/user', user(dbConfig));

    app.listen(3000, () => {
        console.log('Server started at http://localhost:3000/');
    });
}

start();