import { Request, Connection, ConnectionConfig, TYPES as td, TediousTypes } from 'tedious';
import { Column, Data } from '../types/server/queries';

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
    convertDataToObj<T>(data: Column[]): T {
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
     * @param limit Limit how many results to get.
     */
    select (table: string, columns?: string[], where?: Column[], limit?: number) {
        let conn = new Connection(this.config);

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

        let trans = new Promise<Column[]>((resolve, reject) => {
            let sql = (
                `SELECT${limit ? " TOP "+limit+" " : ""}${wrappedColumns || '*'} `+
                `FROM ${wrappedTable} `+
                ((where) ? `WHERE ${wrappedConds}` : '')
            );

            let request = new Request(sql, function(err, rowCount) {
                if(err) {
                    console.log(`sql error: ${sql}`);
                    reject(err);
                };
    
                console.log(`Transaction Successful. Affected Rows: ${rowCount}`);
                conn.close();
            });

            // add data type and values for where conditions (if they exist)
            if(where && prepCond.length > 0) {
                where.forEach(cond => {
                    request.addParameter(`cond_${cond.name}`, cond.type, cond.value)
                });
            }

            request.on("row", (columns) => {
                let data: Column[] = columns.map(column => {
                    let {value, metadata} = column;
                    let {colName: name} = metadata;
                    let type = td[metadata.type.name as keyof TediousTypes];

                    return {name, type, value};
                });

                resolve(data);
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

                let batch = conn.newBulkLoad(wrappedTable, (error) => {
                    if (error) throw error;

                    conn.reset((error) => {
                        if (error) reject (error);

                        let request = new Request('select @@IDENTITY', (error) => {
                            if (error) reject(error);
    
                            conn.close();
                        });
    
                        request.on('row', (columns) => {
                            resolve(columns[0].value);
                        });

                        conn.execSql(request);
                    });
                });

                columns.forEach(column => {
                    let {name, type, nullable = false} = column;
                    batch.addColumn(name, type, {nullable});
                });

                data.forEach(row => {
                    batch.addRow({...row});
                });

                conn.execBulkLoad(batch);
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
                    
                    console.log(`Insert Transaction executed in table ${table}`);
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

                conn.execSql(request);
            });
        });

        return trans;
    }
}

export default Queries;