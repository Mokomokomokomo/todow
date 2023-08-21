import { Router } from "express";
import { ConnectionConfig, TYPES as td } from "tedious";
import Queries from "./queries";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { TokenObj, NoteObj, SectionObj } from "../types/server";
import { Column, Data } from "../types/server/queries";

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
    
            // prepare note data
            let data: Column<NoteObj>[] = [
                {name: 'user_id', type: td.Int, value: userid},
                {name: 'title', type: td.VarChar, value: title || 'Untitled'},
                {name: 'sched_date', type: td.Date, value: date},
                {name: 'color', type: td.VarChar, value: color},
                {name: 'group', type: td.VarChar, value: group}
            ];

            let note_id = await sql.insert_once('dbo.note', data);

            // prepare content sections
            let sectionColumns: Column<SectionObj>[] = [
                {name: 'note_id', type: td.Int},
                {name: 'description', type: td.VarChar},
                {name: 'time_from', type: td.Time},
                {name: 'time_to', type: td.Time, nullable: true}
            ];

            // prepare section data
            let sectionData = content.map<Data<typeof sectionColumns>>(section => {
                let {description, time_from, time_to} = section;

                if (typeof time_from.hour == 'string') {
                    time_from.hour = parseInt(time_from.hour);
                }
                if (typeof time_to.hour == 'string') {
                    time_to.hour = parseInt(time_to.hour);
                }

                let hour_from = (time_from.tc == 'pm') ? time_from.hour + 12 : time_from.hour;
                let hour_to = (time_to.tc == 'pm') ? time_to.hour + 12 : time_to.hour;

                return {
                    note_id,
                    description,
                    time_from: `${hour_from}:${time_from.minute}:00`,
                    time_to: time_to ? `${hour_to}:${time_to.minute}:00` : undefined
                }
            });

            await sql.insert_batch('dbo.note', sectionColumns, sectionData);

            response.json({
                success: true
            });
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

    return router;
}

export default NoteRouter;