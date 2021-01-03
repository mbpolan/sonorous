import React, { useState } from 'react';
import { Button, Input, Text, Overlay, Image } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import View from '../../components/View';
import * as ImagePicker from 'expo-image-picker';

export interface NewBoardModalProps {
    visible: boolean;
    onSubmit: (name: string, image?: string) => void;
    onClose: () => void;
}

export default function NewBoardModal(props: NewBoardModalProps) {
    const [boardName, setBoardName] = useState('');
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [image, setImage] = useState<string | undefined>(undefined);

    const handleBoardNameChange = (value: string) => {
        setBoardName(value);
        updateSaveEnabled(boardName);
    }

    const handleNewBoard = () => {
        props.onSubmit(boardName, image);
        resetState();
    }

    const handleSelectImage = async () => {
        const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (result.status !== 'granted') {
            alert('Need permission to choose image!');
        } else {
            const file = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
            });

            if (!file.cancelled) {
                setImage(file.uri);
            }
        }
    }

    const handleClose = () => {
        resetState();
        props.onClose();
    }

    const updateSaveEnabled = (name: string) => {
        setSaveEnabled(name.trim().length > 0);
    }

    const resetState = () => {
        setBoardName('');
        setImage(undefined);
    }

    return (
        <Overlay
            overlayStyle={styles.overlay}
            isVisible={props.visible}
            onBackdropPress={props.onClose}>
            <View>
                <View style={styles.wrapper}>
                    <Image
                        source={{
                            uri: image,
                        }}
                        PlaceholderContent={
                            <Text style={styles.imageText}>Choose an image</Text>
                        }
                        style={styles.image}
                        onPress={handleSelectImage} />

                    <View style={styles.nameWrapper}>
                        <Text style={styles.modalText}>Board name</Text>
                        <Input onChangeText={handleBoardNameChange} value={boardName} />
                    </View>
                </View>

                <View style={styles.buttonArea}>
                    <Button style={styles.button} disabled={!saveEnabled} title='OK' onPress={handleNewBoard} />
                    <Button style={styles.button} type='outline' title='Cancel' onPress={handleClose} />
                </View>
            </View>
        </Overlay>
    );
}

const styles = StyleSheet.create({
    overlay: {
        width: '90%'
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'row',
    },
    image: {
        width: 64,
        height: 64,
    },
    imageText: {
        textAlign: 'center',
        margin: 5,
    },
    nameWrapper: {
        marginLeft: 10,
        width: '75%',
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
