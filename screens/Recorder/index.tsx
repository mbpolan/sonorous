import React, { useEffect, useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { Input, Slider, Text, Theme, withTheme } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import useDatabase from '../../hooks/useDatabase';
import { useDispatch } from 'react-redux';
import { getGroups } from '../../state/ducks/groups';
import View from '../../components/View';

export interface RecorderProps {
    route: any;
    navigation: any;
    theme: Theme;
}

function Recorder(props: RecorderProps) {
    const { boardId, groupId, groupName } = props.route.params;
    const dispatch = useDispatch();
    const db = useDatabase();
    const [name, setName] = useState('');
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [playback, setPlayback] = useState<Audio.Sound | undefined>(undefined);
    const [playbackStatus, setPlaybackStatus] = useState<any | undefined>(undefined);
    const [status, setStatus] = useState<Audio.RecordingStatus | undefined>(undefined);
    const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
    const [lastStatus, setLastStatus] = useState<Audio.RecordingStatus | undefined>(undefined);
    const [lastRecording, setLastRecording] = useState<Audio.Recording | undefined>(undefined);

    useEffect(() => {
        props.navigation.setOptions({
            title: `Add Sound: ${groupName}`,
            headerRight: () => (
                <Button title='Save'
                    disabled={!saveEnabled}
                    onPress={handleSave} />
            )
        });
    }, [groupName, saveEnabled]);

    const handleSave = async () => {
        try {
            await db.addSound(name, lastRecording!.getURI()!, groupId);
            dispatch(getGroups(boardId));

            props.navigation.goBack();
        } catch (e) {
            console.error(e);
        }
    }

    const handleNameChange = (text: string) => {
        setName(text);
        updateSaveEnabled(text, lastRecording);
    }

    const updateSaveEnabled = (name: string, recording?: Audio.Recording) => {
        const enabled = name.trim().length > 0 && recording !== undefined;

        setSaveEnabled(enabled);
        props.navigation.setParams({
            saveEnabled: enabled
        })
    }

    const handleTogglePlayback = async () => {
        if (playbackStatus) {
            stopPlayback();
        } else if (lastRecording?.getURI()) {
            startPlayback(lastRecording!.getURI()!);
        }
    }

    const handlePlaybackStatusChange = (status) => {
        if (status.isPlaying) {
            setPlaybackStatus(status);
        } else {
            setPlaybackStatus(undefined);
        }
    }

    const startPlayback = async (uri: string) => {
        try {
            const sound = new Audio.Sound();
            sound.setOnPlaybackStatusUpdate(handlePlaybackStatusChange);

            await sound.loadAsync({
                uri
            });

            setPlayback(sound);
            await sound.playAsync();
        } catch (e) {
            console.error(e);
        }
    }

    const stopPlayback = async () => {
        try {
            await playback!.stopAsync();
            await playback!.unloadAsync();

            setPlayback(undefined);
        } catch (e) {
            console.error(e);
        }
    }

    const handleToggleRecording = async () => {
        if (recording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }

    const handleStatusChange = (status: Audio.RecordingStatus) => {
        if (status.isDoneRecording) {
            setLastStatus(status);
            setStatus(undefined);
        } else {
            setStatus(status);
        }
    }

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            recording.setOnRecordingStatusUpdate(handleStatusChange);
            await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await recording.startAsync();

            setRecording(recording);
        } catch (e) {
            console.error(e);
        }
    }

    const stopRecording = async () => {
        try {
            await recording!.stopAndUnloadAsync();

            setLastRecording(recording);
            setRecording(undefined);

            updateSaveEnabled(name, recording);
        } catch (e) {
            console.error(e);
        }
    }

    const formatDuration = (time: number) => {
        let t = Math.floor(time / 1000);
        const seconds = t % 60;
        t = Math.floor(t / 60);
        const minutes = t % 60;

        return minutes > 0 ? `${minutes} minutes, ${seconds} seconds` : `${seconds} seconds`
    }

    const formatDurationShort = (time: number) => {
        let t = Math.floor(time / 1000);
        const seconds = t % 60;
        t = Math.floor(t / 60);
        const minutes = t % 60;

        return `${minutes < 9 ? `0${minutes}` : minutes}:${seconds < 9 ? `0${seconds}` : seconds}`;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Name your sound</Text>
            <Input onChangeText={handleNameChange} />

            <Text style={styles.label}>Record your own sound</Text>
            <Ionicons name='mic'
                size={35}
                color={recording ? 'red' : props.theme.colors?.primary}
                onPress={handleToggleRecording} />

            {status &&
                <Text>Recording for {formatDuration(status.durationMillis)}...</Text>
            }
            {lastStatus &&
                <View style={styles.container}>
                    <Text>Your sound is {formatDuration(lastStatus.durationMillis)} long.</Text>
                    <Ionicons name={playbackStatus ? 'stop' : 'play'}
                        size={35}
                        color={playbackStatus ? 'red' : props.theme.colors?.primary}
                        onPress={handleTogglePlayback} />
                </View>
            }
            { playback &&
                <View style={styles.playbackContainer}>
                    <Text style={styles.currentTime}>
                        {formatDurationShort(playbackStatus?.positionMillis ?? 0)}
                    </Text>
                    <Slider
                        style={styles.slider}
                        thumbTouchSize={{width: 15, height: 15}}
                        thumbTintColor={props.theme.colors?.primary}
                        disabled={true}
                        value={playbackStatus?.positionMillis ?? 0}
                        minimumValue={0}
                        maximumValue={playbackStatus?.playableDurationMillis ?? 1}
                    />
                    <Text style={styles.remainingTime}>
                        {formatDurationShort(playbackStatus ? (playbackStatus.playableDurationMillis - playbackStatus.positionMillis) : 0)}
                    </Text>
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    label: {
        marginBottom: 5,
    },
    playbackContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    slider: {
        flexGrow: 5,
    },
    currentTime: {
        textAlign: 'left',
        paddingLeft: 5,
        paddingRight: 10,
    },
    remainingTime: {
        textAlign: 'right',
        paddingLeft: 10,
        paddingRight: 5,
    },
})

export default withTheme(Recorder);
