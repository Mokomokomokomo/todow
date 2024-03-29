import { Request, Connection, ConnectionConfig, TYPES as td, TediousTypes } from 'tedious';
import { Column, Data, Row } from '../types/server/queries';

class Queries {
    private config: ConnectionConfig

    /**
     * @param conn - ms sql connection
     */
    constructor (config: ConnectionConfig) {
        this.config = config;
    }

    private prepParams (data: Column[], prefix = '') {
        let prepped = data.map(c => {
            if(c && c.name) {
                return `@${prefix ? prefix+'_' : ''}${c.name}`;
            }
            else {
                return undefined;
            }
        }).filter(p => p) as string[];

        return prepped;
    }

    private wrapFields (...fields: string[]) {
        let list = [];
        for (const field of fields) {
            let subfields = field.split('.');   
            list.push(subfields.map(sf => `[${sf}]`).join('.'));
        }
        return list;
    }

    private wrapField (field: string) {
        return field.split('.').map(sf => `[${sf}]`).join('.');
    }

    /**
     * Converts an array of Column Objects into a singular object containing the 
     * field name as keys and the field value as values. This function is used due 
     * to objects being easier to manipulate than arrays.
     * @param data Array of Column Objects
     * @example
     *  ```ts
     *      let data = [
     *          {field: 'name', value: 'Alice', type: TP.VarChar},
     *          {field: 'id', value: 3, type: TP.BigInt}
     *      ]
     *      let obj = convertDataToObj<User>(data)
     *      console.log(obj.name) // 'Alice'
     *      console.log(obj.id) // 3
     *      console.log(obj.notAProp) //undefined 
     *  ```
     */
    convertDataToObj<T= any>(data: Column[]): T {
        let obj = data.reduce((obj, curr) => {
            let name = curr.name;
            let value = curr.value;

            return {
                ...obj,
                [name]: value
            };
        }, {});

        return obj as T;
    }

    /**
     * Select Query
     * @param table Name of table. Every table must be prefixed by their db indexing type i.e. (dbo.user)
     * @param columns Name of columns to choose from. leave [] or undefined to get all columns.
     * @param where List of objects containing data for where conditions e.g. [{//cond1}, {//cond2}]
     * @param options
     */
    select (table: string, columns?: string[], where?: Column[], options?: { limit?: number, order_by?: string }) {
        let conn = new Connection(this.config);
        let rows = [] as Row[];

        // wrap table and columns in brackets to avoid collision of reserved keywords
        let wrappedTable = this.wrapFields(table)[0];
        let wrappedColumns: string;
        if (columns && columns.length > 0) {
            wrappedColumns = this.wrapFields(...columns).join(', ');
        }

        // If conditions exist, prepare parametized conditions
        let prepCond: string[] = [];
        let wrappedConds: string;
        if (where && where.length > 0) {
            prepCond = this.prepParams(where, 'cond');
            wrappedConds = where.map((cond, index) => { 
                return this.wrapField(cond.name)+' = '+prepCond[index]
            }).join(' and ');
        }

        let trans = new Promise<Row[]>((resolve, reject) => {
            let sql = (
                `SELECT${options?.limit ? " TOP "+options.limit+" " : ""}${wrappedColumns || '*'} `+
                `FROM ${wrappedTable} `+
                ((where) ? `WHERE ${wrappedConds} ` : '')+
                ((options?.order_by) ? `order by ${options.order_by}`: '')
            );

            let request = new Request(sql, function(err, rowCount) {
                if(err) {
                    console.log(`sql error: ${sql}`);
                    reject(err);
                };
    
                console.log(sql);
                console.log(`Select Transaction Successful. Found Rows: ${rowCount}`);
                conn.close();
            });

            // add data type and values for where conditions (if they exist)
            if(where && prepCond.length > 0) {
                where.forEach(cond => {
                    request.addParameter(`cond_${cond.name}`, cond.type, cond.value)
                });
            }

            request.on("requestCompleted", () => {
                resolve(rows);
            });

            request.on("row", (columns) => {
                let props = columns.map(column => {
                    let {value, metadata} = column;
                    let {colName: name} = metadata;
                    let type = td[metadata.type.name as keyof TediousTypes];

                    return {name, type, value} as Column;
                });

                rows = rows.concat([props]);
            });

            conn.on("connect", async (err) => {
                if(err) reject(err);

                conn.execSql(request);
            });
            conn.connect();
        });

        return trans;
    }

    /**
     * 
     * @param table - every table must be prefixed by their db indexing type i.e. (dbo => dbo.user) 
     * @param data each element contains an array containing three subelements in order: column_name, type, value
     */
    insert_once (table: string, data: Column[]) {
        let conn = new Connection(this.config);
        
        let trans = new Promise<number>((resolve, reject) => {
            conn.on("connect", (err) => {
                if(err) reject(err);
    
                // prepare parametized fields to fill in data
                let params = this.prepParams(data);

                // wrap in brackets to avoid collision of reserved keywords
                let wrappedTable = table.split('.').map(f => `[${f}]`).join('.');
                let wrappedColumns = data.map(c => `[${c.name}]`).join(',');

                let sql = (
                    `insert into ${wrappedTable}(${wrappedColumns})
                    values(${params.join(',')});
                    select @@IDENTITY`
                );
                
                let request = new Request(sql, (err) => {
                    if(err) {
                        console.log(`sql: ${sql}`);
                        console.log(err);
                        reject(err);
                    }

                    conn.close();
                });
                request.on("row", (columns) => {
                    console.log(`Insert Transaction executed in table ${table}`);

                    resolve(columns[0].value);
                });

                // add types
                data.forEach((c) => {
                    request.addParameter(
                        c.name, 
                        c.type,
                        c.value
                    );
                });

                conn.execSql(request);
            });

            conn.connect();
        });

        return trans;
    }

    insert_batch (table: string, columns: Column[], data: Data<typeof columns>[]) {
        let conn = new Connection(this.config);

        let trans = new Promise<number>((resolve, reject) => {
            conn.on('connect', (error) => {
                if (error) reject(error);

                let wrappedTable = this.wrapField(table);
                let prepParams = this.prepParams(columns);

                let sql = (`
                    INSERT INTO ${wrappedTable} (${columns.map(c => c.name).join(', ')}) 
                    VALUES (${prepParams.join(', ')})
                `);

                let requests = data.map(val => {
                    let request = new Request(sql, (error) => {
                        if (error) reject(error);

                        conn.reset(error => {
                            reject(error);
                        });
                    });
                    
                    columns.forEach(c => {
                        console.table({fied: c.name, value: val[c.name]});
                        request.addParameter(c.name, c.type, val[c.name]);
                    });

                    return request;
                });

                for(let request of requests) {
                    conn.execSql(request);
                }

                // If all requests were executed successfully
                let request = new Request('SELECT @@IDENTITY', (error) => {
                    if (error) reject(error);

                    conn.close();
                });

                request.on('row', columns => {
                    console.log("Batch Insertion Transaction executed in table "+table);
                    
                    if(columns.length > 0) {
                        resolve(columns[0].value);
                    }
                });
            });
            
            conn.connect();
        });

        return trans;
    }
    
    alter (table: string, data: Column[], where: Column[]) {
        let conn = new Connection(this.config);
        
        let trans = new Promise((resolve, reject) => {
            conn.on('connect', (err) => {
                if(err) reject(err);
                
                // prepare parametized query
                let params = this.prepParams(data);
                let prepCond = this.prepParams(where, 'cond');

                let setStr = data.map((c, i) => {
                    return `${c.name}=${params[i]}`
                }).join(',');

                let wrappedConds = where.map((cond, index) => { 
                    return this.wrapField(cond.name)+' = '+prepCond[index]
                }).join(' and ');

                let sql = (
                    `UPDATE ${table} `+
                    `SET `+
                    `${setStr} `+
                    `WHERE ${wrappedConds}`
                );

                let request = new Request(sql, (err, rowCount) => {
                    if(err) reject(err);
                    
                    console.log(`Update Transaction executed in table ${table}`);
                    if(rowCount === 0) {
                        console.log('Warning: No Rows were updated');
                    }
                    
                    conn.close();
                    resolve(undefined);
                });

                // add the values to the parametized request
                data.forEach(c => {
                    request.addParameter(
                        c.name,
                        c.type,
                        c.value
                    );
                });

                // add the values of conditions to parametized request
                where.forEach(c => {
                    request.addParameter(
                        `cond_${c.name}`,
                        c.type,
                        c.value
                    );
                });

                conn.execSql(request);
            });

            conn.connect();
        });

        return trans;
    }

    delete (table: string, where: Column[]) {
        let conn = new Connection(this.config);

        let trans = new Promise<number>((resolve, reject) => {
            conn.on("connect", (err) => {
                if (err) reject(err);
                
                let wrappeedTable = this.wrapField(table);
                let prepCond = this.prepParams(where);

                let wrappedConds = where.map((cond, index) => { 
                    return this.wrapField(cond.name)+' = '+prepCond[index]
                }).join(' and ');

                let sql = `DELETE FROM ${wrappeedTable} WHERE ${wrappedConds}`;

                let request = new Request(sql, (err, rowCount) => {
                    if (err) {
                        console.log("sql: "+sql);
                        reject(err);
                    }

                    console.log(`Delete query executed in ${wrappeedTable}`);
                    if(rowCount > 0) {
                        console.log(`Deleted ${rowCount} rows`);

                        conn.close();
                        resolve(rowCount);
                    }
                });

                where.forEach(cond => {
                    request.addParameter(cond.name, cond.type, cond.value);
                });
                console.log(sql);
                conn.execSql(request);
            });
        });

        conn.connect();

        return trans;
    }
}

export default Queries;