import * as SQLite from 'expo-sqlite';
import { SQLError, SQLResultSet } from 'expo-sqlite';

const database = SQLite.openDatabase('sonorous.db', undefined, 'Sonorous app data');

export const executeSqlAsync = async (sql: string, args?: any[]): Promise<SQLResultSet> => {
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(sql, args,
                (_, rs: SQLResultSet) => {
                    resolve(rs);
                },
                (_, error: SQLError) => {
                    reject(error);
                    return false;
                });
        });
    })
}

export default database;
