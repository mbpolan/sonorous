import { Dispatch } from "redux";
import { executeSqlAsync } from "../../utils/database";

enum GroupActionTypes {
    GROUPS_LOADING = 'GROUPS_LOADING',
    GROUPS_SUCCESS = 'GROUPS_SUCCESS',
    GROUPS_ERROR = 'GROUPS_ERROR'
}

// types

export interface Group {
    id: number;
    name: string;
    sounds: Sound[];
}

export interface Sound {
    id: number;
    name: string;
    uri: string;
}

export interface GroupsState {
    pending: boolean;
    data: Group[];
    error?: string;
}

interface FetchGroupsAction {
    type: GroupActionTypes.GROUPS_LOADING;
    payload: boolean;
}

interface FetchGroupsSuccessAction {
    type: GroupActionTypes.GROUPS_SUCCESS;
    payload: Group[];
}

interface FetchGroupsErrorAction {
    type: GroupActionTypes.GROUPS_ERROR;
    payload: string;
}

type GroupsActionDispatchTypes = FetchGroupsAction
    | FetchGroupsSuccessAction
    | FetchGroupsErrorAction

// reducer

const initialState: GroupsState = {
    pending: true,
    data: [],
    error: undefined
}

export default function reducer(state = initialState, action: GroupsActionDispatchTypes) {
    switch (action.type) {
        case GroupActionTypes.GROUPS_LOADING:
            return {
                ...state,
                pending: action.payload,
            }
        case GroupActionTypes.GROUPS_SUCCESS:
            return {
                ...state,
                pending: false,
                data: action.payload,
            }
        case GroupActionTypes.GROUPS_ERROR:
            return {
                ...state,
                pending: false,
                error: action.payload,
            }
        default:
            return state;
    }
}

// action creators

const fetchGroups = (): FetchGroupsAction => (
    { type: GroupActionTypes.GROUPS_LOADING, payload: true }
)

const fetchGroupsSuccess = (boards: Group[]): FetchGroupsSuccessAction => (
    { type: GroupActionTypes.GROUPS_SUCCESS, payload: boards }
)

const fetchGroupsError = (error: string): FetchGroupsErrorAction => (
    { type: GroupActionTypes.GROUPS_ERROR, payload: error }
)

// side effects

export const getGroups = (boardId: number) => async (dispatch: Dispatch<GroupsActionDispatchTypes>) => {
    dispatch(fetchGroups())

    try {
        const rs = await executeSqlAsync(`
            SELECT 
                g.id AS rowId,
                g.name AS rowName, 
                s.id AS soundId, 
                s.name AS soundName,
                s.uri AS soundUri
            FROM 
                groups g
            LEFT JOIN
                sounds s
                    ON s.groupId = g.id
            WHERE
                g.boardId = ?
        `, [boardId]);

        // organize the data based on each group and its associated sounds
        const data = rs.rows._array.reduce((memo: any, row: any) => {
            if (!memo.hasOwnProperty(row.rowId)) {
                memo[row.rowId] = {
                    id: row.rowId,
                    name: row.rowName,
                    sounds: []
                };
            }

            if (row.soundId !== null) {
                memo[row.rowId].sounds.push({
                    id: row.soundId,
                    name: row.soundName,
                    uri: row.soundUri,
                });
            }

            return memo;
        }, {});

        // flatten the object into an array of groups
        const groups = Object.keys(data).reduce((memo: Group[], val: string) => {
            return [
                ...memo,
                data[+val]
            ];
        }, []);

        dispatch(fetchGroupsSuccess(groups));
    } catch (e) {
        console.error(e);
        dispatch(fetchGroupsError(e.message));
    }
}
