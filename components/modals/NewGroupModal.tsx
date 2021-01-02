import React, { useState } from 'react';
import { Button, Input, Overlay } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import Text from '../../components/Text';
import View from '../../components/View';

export interface NewGroupModalProps {
    visible: boolean;
    onSubmit: (name: string) => void;
    onClose: () => void;
}

export default function NewGroupModal(props: NewGroupModalProps) {
    const [groupName, setGroupName] = useState('');
    const [saveEnabled, setSaveEnabled] = useState(false);

    const handleGroupNameChange = (value: string) => {
        setGroupName(value);
        updateSaveEnabled(value);
    }

    const handleNewGroup = () => {
        props.onSubmit(groupName);
        setGroupName('');
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
                <Text style={styles.modalText}>Group name</Text>
                <Input onChangeText={handleGroupNameChange} value={groupName} />

                <View style={styles.buttonArea}>
                    <Button style={styles.button} disabled={!saveEnabled} title='OK' onPress={handleNewGroup} />
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
