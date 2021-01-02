import React, { useState } from 'react';
import { Button, Input, Overlay } from 'react-native-elements';
import { StyleSheet} from 'react-native';
import Text from '../../components/Text';
import View from '../../components/View';

export interface NewBoardModalProps {
    visible: boolean;
    onSubmit: (name: string) => void;
    onClose: () => void;
}

export default function NewBoardModal(props: NewBoardModalProps) {
    const [boardName, setBoardName] = useState('');
    const [saveEnabled, setSaveEnabled] = useState(false);

    const handleBoardNameChange = (value: string) => {
        setBoardName(value);
        updateSaveEnabled(boardName);
    }

    const handleNewBoard = () => {
        props.onSubmit(boardName);
        setBoardName('');
    }

    const updateSaveEnabled = (name: string) => {
        setSaveEnabled(name.trim().length > 0);
    }

    return (
        <Overlay
            overlayStyle={styles.overlay}
            isVisible={props.visible}
            onBackdropPress={props.onClose}>
            <View>
                <Text style={styles.modalText}>Board name</Text>
                <Input onChangeText={handleBoardNameChange} value={boardName} />

                <View style={styles.buttonArea}>
                    <Button style={styles.button} disabled={!saveEnabled} title='OK' onPress={handleNewBoard} />
                    <Button style={styles.button} type='outline' title='Cancel' onPress={props.onClose} />
                </View>
            </View>
        </Overlay>
    );
}

const styles = StyleSheet.create({
    overlay: {
        width: '90%'
    },
    button: {
        marginTop: 10,
    },
    buttonArea: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});
