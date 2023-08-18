import { Router } from "express";
import { ConnectionConfig, TYPES as td } from "tedious";
import Queries from "./queries";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { TokenObj, NoteObj, SectionObj } from "../types/server";
import { Column } from "../types/server/queries";

function NoteRouter(conn: ConnectionConfig) {
    let router = Router();
    let sql = new Queries(conn);

    router.post('/create', async (request, response) => {
        let {content, sched_date, title, color, group} = request.body as NoteObj;
        let {token} = request.cookies;

        let date = `${sched_date.year}-${sched_date.month}-${sched_date.day_of_month}`;
        
        try {
            // check token
            let userid;
            if(token) {
                let payload = verify(token, process.env.SECRET_KEY as string) as TokenObj;
                userid = payload.userid;
            }
    
            // prepare data
            let data: Column<NoteObj>[] = [
                {name: 'user_id', type: td.Int, value: userid},
                {name: 'title', type: td.VarChar, value: title || 'Untitled'},
                {name: 'sched_date', type: td.Date, value: date},
                {name: 'color', type: td.VarChar, value: color},
                {name: 'group', type: td.VarChar, value: group}
            ];

            let note_id = await sql.insert_once('dbo.note', data);

            for (let section of content) {
                let {hour, minute, tc} = section.time_from;

                if (typeof hour == 'string') {
                    hour = parseInt(hour);
                }
                hour = (tc == 'pm') ? hour + 12 : hour;
                let time_from = `${hour}:${minute}:00`;
                
                let time_to;
                if (section.time_to.hour != '' && section.time_from.minute != '') {
                    let {} = section.time_to;
                    hour = (tc == 'pm') ? hour + 12 : hour;
                    let time_from = `${hour}:${minute}:00`;
                }

                let data: Column<SectionObj>[] = [
                    {name: 'note_id', type: td.Int, value: note_id},
                    {name: 'description', type: td.VarChar, value: section.description},
                    {name: 'time_from', type: td.Time, value: time_from},
                    {name: 'time_from', type: td.Time, value: time_to}
                ];
                
            }
        }
        catch (e) {
            if (e instanceof TokenExpiredError) {
                console.log(`Token expired on ${e.expiredAt}.`);
                response.clearCookie('token');
            }
            else if (e instanceof JsonWebTokenError) {
                console.log(`Token verification failed: `, e.message);
                response.clearCookie('token');
            }
            
            response.json({
                success: false,
            });
        }
    });
}