import React from 'react';
import { StyleSheet } from 'react-native';
import { Image, ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import { Board } from '../../state/ducks/boards';
const defaultImage = require('../../assets/icon.png');

export interface BoardsProps {
    boards: Board[];
    onLongPressBoard: (board: Board) => void;
    onPressBoard: (board: Board) => void;
}

export default function Boards(props: BoardsProps) {

    const renderBoard = ({ item }) => {
        // use a default image if this soundboard does not have one assigned
        const image = item.image
            ? { uri: item.image }
            : defaultImage;

        return (
            <ListItem
                onPress={() => props.onPressBoard(item)}
                onLongPress={() => props.onLongPressBoard(item)}
                bottomDivider>
                <Image
                    source={image}
                    style={styles.image} />
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

const styles = StyleSheet.create({
    image: {
        width: 32,
        height: 32,
    }
})