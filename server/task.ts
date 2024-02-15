// import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";

import { Router } from "express";
import { ConnectionConfig, TYPES as td } from "tedious";
import Queries from "./queries";
import { TaskObj } from "../types/server";

function TaskRouter(conn: ConnectionConfig) {
    let router = Router();
    let transact = new Queries(conn);

    router.use(async(req, res, next) => {
        if (req.cookies.uuid) {
            try {
                let has_uuid = await transact.select('dbo.session', [], [
                    {name: 'uuid', type: td.NVarChar, value: req.cookies.uuid}
                ], {limit: 1});
                
                if (has_uuid.length > 0) {
                    req.body.user_id = transact.convertDataToObj(has_uuid[0]).id;
                    next();
                }
            }
            catch (error) {
                res.status(400).send("Error processing request.");
            }
        }
        else {
            res.status(401).send("Unauthorized Access: No session found.");
        }
    });

    router.post('/create', async (req, res) => {
        let {content, sched_date, title, color, group, status, user_id} = req.body as TaskObj;

        try { 
            transact.insert_once('dbo.note', [
                {name: 'user_id', type: td.Int, value: user_id},
                {name: 'title', type: td.NVarChar, value: title},
                {name: 'sched_date', type: td.DateTime, value: sched_date},
                {name: 'color', type: td.Char, value: color},
                {name: 'description', type: td.NVarChar, value: content},
                {name: 'group', type: td.NVarChar, value: group},
                {name: 'status', type: td.NVarChar, value: status}
            ]);

            res.json({
                success: true
            });
        }
        catch (err) {
            res.json({
                success: false,
                error: err
            });
        }
    });

    router.post('/getUserNotes', async (request, response) => {
        try {
            let res = await transact.select('dbo.note', [], [
                {name: 'user_id', type: td.Int, value: request.body.user_id}
            ], {order_by: 'sched_date'});

            let notes = res.map(r => {
                let temp = transact.convertDataToObj(r);
                return {
                    title: temp.title,
                    content: temp.description,
                    sched_date: temp.sched_date,
                    color: temp.color,
                    group: temp.group,
                    user_id: temp.user_id,
                    status: temp.status,
                    note_id: temp.id
                } as TaskObj
            });

            response.json(notes);
        }
        catch (error) {
            response.json([]);
        }
    });

    router.post('/updateStatus', async (request, response) => {
        try {
            let {task_id, status} = request.body;
            transact.alter('dbo.note', [
                {name: 'status', type: td.NVarChar, value: status}
            ], [
                {name: 'id', type: td.Int, value: task_id}
            ]);

            response.json({
                success: true
            });
        }
        catch (err) {
            response.json({
                success: false,
                error: err
            });
        }
    });

    return router;
}

export default TaskRouter;