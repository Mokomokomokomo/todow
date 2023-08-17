import express from 'express';
import bodyParser from 'body-parser';
import cookeParser from 'cookie-parser';

import { createServer } from 'vite';
import {Connection, ConnectionConfig} from 'tedious';
import fs from 'fs';
import path from 'path';
import {config} from 'dotenv';

config();

// import module to load to ssr
import { EntryServer } from './src/entry-server';

// import api or server routes here
import user from './server/user';

const getProcess = (field: string, type: "string" | "int" | "float" = "string") => {
    let value = process.env[field];

    if(value) {
        if(type == "int") {
            return parseInt(value);
        }
        else if (type == "float") {
            return parseFloat(value);
        }
        else if (type == "string") {
            return value;
        }
    }

    return undefined;
}

async function start() {
    let port = getProcess('PORT', "int") as number || 3000;

    const app = express();
    const vite = await createServer({
        server: {middlewareMode: true},
        appType: 'custom'
    });

    let dbConfig = {
        server: getProcess("DB_SERVER"),
        authentication: {
            type: "default",
            options: {
                userName: getProcess("DB_USERNAME"),
                password: getProcess("DB_PASSWORD"),
            },
        },
        options: {
            encrypt: false,
            instanceName: getProcess("DB_INSTANCE"),
            database: getProcess("DB_NAME"),
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

    // call all api routes here simply call the imported method as is
    app.use('/api/user', user(dbConfig));

    app.listen(port, () => {
        console.log('Server started at http://localhost:3000/');
    });
}

start();