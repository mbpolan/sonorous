import { combineReducers } from 'redux';
import { BoardsState, default as boards } from './boards';
import { GroupsState, default as groups } from './groups';

export interface ApplicationState {
    boards: BoardsState;
    groups: GroupsState;
}

export const rootReducer = combineReducers({
    boards,
    groups,
});
