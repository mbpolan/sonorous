import { SQLError, SQLResultSet, SQLTransaction } from "expo-sqlite";
import { Dispatch } from "redux";
import database, { executeSqlAsync } from "../../utils/database";

enum BoardActionTypes {
    BOARDS_LOADING = 'BOARDS_LOADING',
    BOARDS_SUCCESS = 'BOARDS_SUCCESS',
    BOARDS_ERROR = 'BOARDS_ERROR'
}

// types

export interface Board {
    id: number;
    name: string;
    image?: string;
}

export interface BoardsState {
    pending: boolean;
    data: Board[];
    error?: string;
}

interface FetchBoardsAction {
    type: BoardActionTypes.BOARDS_LOADING;
    payload: boolean;
}

interface FetchBoardsSuccessAction {
    type: BoardActionTypes.BOARDS_SUCCESS;
    payload: Board[];
}

interface FetchBoardsErrorAction {
    type: BoardActionTypes.BOARDS_ERROR;
    payload: string;
}

type BoardsActionDispatchTypes = FetchBoardsAction
    | FetchBoardsSuccessAction
    | FetchBoardsErrorAction

// reducer

const initialState: BoardsState = {
    pending: true,
    data: [],
    error: undefined
}

export default function reducer(state = initialState, action: BoardsActionDispatchTypes) {
    switch (action.type) {
        case BoardActionTypes.BOARDS_LOADING:
            return {
                ...state,
                pending: action.payload,
            }
        case BoardActionTypes.BOARDS_SUCCESS:
            return {
                ...state,
                pending: false,
                data: action.payload,
            }
        case BoardActionTypes.BOARDS_ERROR:
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

const fetchBoards = (): FetchBoardsAction => (
    { type: BoardActionTypes.BOARDS_LOADING, payload: true }
)

const fetchBoardsSuccess = (boards: Board[]): FetchBoardsSuccessAction => (
    { type: BoardActionTypes.BOARDS_SUCCESS, payload: boards }
)

const fetchBoardsError = (error: string): FetchBoardsErrorAction => (
    { type: BoardActionTypes.BOARDS_ERROR, payload: error }
)

// side effects

export const getBoards = () => async (dispatch: Dispatch<BoardsActionDispatchTypes>) => {
    dispatch(fetchBoards())

    try {
        const rs = await executeSqlAsync(`
            SELECT 
                id, name, image
            FROM 
                boards
        `);

        dispatch(fetchBoardsSuccess(rs.rows._array));
    } catch (e) {
        console.error(e);
        dispatch(fetchBoardsError(e.message))
    }
}
