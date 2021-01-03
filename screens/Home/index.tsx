import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableHighlight, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { CenteredContainer } from '../../components/containers';
import Link from '../../components/Link';
import NewBoardModal from '../../components/modals/NewBoardModal';
import useDatabase from '../../hooks/useDatabase';
import { ApplicationState } from '../../state/ducks';
import { Board, getBoards } from '../../state/ducks/boards';
import Boards from './Boards';
import Text from '../../components/Text';
import View from '../../components/View';
import { BottomSheet, ListItem } from 'react-native-elements';

export interface HomeProps {
    navigation: any;
}

export default function Home(props: HomeProps) {
    const dispatch = useDispatch();
    const db = useDatabase();
    const boards = useSelector((state: ApplicationState) => state.boards.data);
    const boardsPending = useSelector((state: ApplicationState) => state.boards.pending);
    const [newBoardModal, setNewBoardModal] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState<Board | undefined>(undefined);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

    useEffect(() => {
        dispatch(getBoards());

        // show a button for adding new boards in the header
        props.navigation.setOptions({
            headerRight: () => (
                <Button title='Add' onPress={handleShowNewBoardModal} />
            )
        });
    }, []);

    const handleNewBoard = async (name: string, image?: string) => {
        setNewBoardModal(false);

        try {
            await db.addBoard(name, image);
            dispatch(getBoards());
        } catch (e) {
            console.error(e);
        }
    }

    const handleShowNewBoardModal = () => {
        setNewBoardModal(true);
    }

    const handleCloseNewBoardModal = () => {
        setNewBoardModal(false);
    }

    const handlePressBoard = (board: Board) => {
        props.navigation.navigate('Soundboard', {
            boardId: board.id,
            boardName: board.name,
        });
    }

    const handleLongPressBoard = (board: Board) => {
        setSelectedBoard(board);
        setBottomSheetVisible(true);
    }

    const handleDeleteItem = async () => {
        try {
            await db.removeBoard(selectedBoard!.id)
            setSelectedBoard(undefined);
            setBottomSheetVisible(false);
            
            dispatch(getBoards());
        } catch (e) {
            console.error(e);
        }
    }

    const handleCancelSheet = () => {
        setSelectedBoard(undefined);
        setBottomSheetVisible(false);
    }

    return (
        <View>
            {boardsPending && <ActivityIndicator size='large' />}
            {!boardsPending && boards.length === 0 &&
                <CenteredContainer>
                    <Text>You do not have any soundboards created yet.</Text>
                    <TouchableHighlight onPress={handleShowNewBoardModal}>
                        <Link>Create one now!</Link>
                    </TouchableHighlight>
                </CenteredContainer>
            }
            {!boardsPending && boards.length > 0 &&
                <Boards
                    boards={boards}
                    onLongPressBoard={handleLongPressBoard}
                    onPressBoard={handlePressBoard} />
            }
            <NewBoardModal
                visible={newBoardModal}
                onClose={handleCloseNewBoardModal}
                onSubmit={handleNewBoard} />

            <BottomSheet
                isVisible={bottomSheetVisible}>
                <ListItem onPress={handleCancelSheet}>
                    <ListItem.Content>
                        <ListItem.Title >Cancel</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem onPress={handleDeleteItem}
                    containerStyle={styles.deleteItem} >
                    <ListItem.Content>
                        <ListItem.Title style={styles.deleteItem}>Delete</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    deleteItem: {
        backgroundColor: 'red',
        color: 'white',
    },
});
