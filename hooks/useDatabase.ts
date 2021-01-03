import { executeSqlAsync } from "../utils/database";

export default function useDatabase() {
    return {
        addBoard: async (name: string, image?: string): Promise<number> => {
            const rs = await executeSqlAsync(`
                INSERT INTO
                    boards (name, image)
                VALUES
                    (?, ?)
            `, [name, image]);

            return rs.insertId;
        },
        removeBoard: async (id: number): Promise<void> => {
            await executeSqlAsync(`
                DELETE FROM
                    boards
                WHERE
                    id = ?
            `, [id]);
        },
        addGroup: async (name: string, boardId: number): Promise<number> => {
            const rs = await executeSqlAsync(`
                INSERT INTO
                    groups (name, boardId)
                VALUES
                    (?, ?)
            `, [name, boardId]);

            return rs.insertId;
        },
        removeGroup: async (id: number): Promise<void> => {
            await executeSqlAsync(`
                DELETE FROM
                    groups
                WHERE
                    id = ?
            `, [id]);
        },
        addSound: async (name: string, uri: string, groupId: number): Promise<number> => {
            const rs = await executeSqlAsync(`
                INSERT INTO
                    sounds (name, uri, groupId)
                VALUES
                    (?, ?, ?)
            `, [name, uri, groupId]);

            return rs.insertId;
        },
        removeSound: async (id: number): Promise<void> => {
            await executeSqlAsync(`
                DELETE FROM
                    sounds
                WHERE
                    id = ?
            `, [id]);
        },
        initialize: async () => {
            await executeSqlAsync(`
                CREATE TABLE IF NOT EXISTS boards (
                    id INTEGER PRIMARY KEY NOT NULL, 
                    name VARCHAR NOT NULL,
                    image VARCHAR NULL
                )
            `);
        
            await executeSqlAsync(`
                CREATE TABLE IF NOT EXISTS groups (
                    id INTEGER PRIMARY KEY NOT NULL, 
                    name VARCHAR NOT NULL, 
                    boardId INTEGER NOT NULL,
                    FOREIGN KEY (boardId)
                        REFERENCES boards (id)
                        ON DELETE CASCADE
                )
            `);
        
            await executeSqlAsync(`
                CREATE TABLE IF NOT EXISTS sounds (
                    id INTEGER PRIMARY KEY NOT NULL, 
                    name VARCHAR NOT NULL,
                    groupId INTEGER NOT NULL,
                    uri VARCHAR NOT NULL,
                    FOREIGN KEY (groupId)
                        REFERENCES groups (id)
                        ON DELETE CASCADE
                )
            `);
        }
    };
}
