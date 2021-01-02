import React from 'react';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import { Board } from '../../state/ducks/boards';

export interface BoardsProps {
    boards: Board[];
    onLongPressBoard: (board: Board) => void;
    onPressBoard: (board: Board) => void;
}

export default function Boards(props: BoardsProps) {

    const renderBoard = ({ item }) => {
        return (
            <ListItem onPress={() => props.onPressBoard(item)}
            onLongPress={() => props.onLongPressBoard(item)}
            bottomDivider >
                <ListItem.Content>
                    <ListItem.Title>
                        {item.name}
                    </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
            </ListItem>
        )
    }

    return (
        <FlatList
            keyExtractor={(_, index) => index.toString()}
            data={props.boards}
            renderItem={renderBoard}
        />
    );
}
