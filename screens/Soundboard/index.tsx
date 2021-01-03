import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, SectionList, StyleSheet, TouchableHighlight, useColorScheme } from 'react-native';
import { BottomSheet, Icon, ListItem, SearchBar } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { CenteredContainer } from '../../components/containers';
import NewGroupModal from '../../components/modals/NewGroupModal';
import useDatabase from '../../hooks/useDatabase';
import { ApplicationState } from '../../state/ducks';
import { getGroups, Group } from '../../state/ducks/groups';
import { Sound } from '../../state/ducks/groups';
import { Ionicons } from '@expo/vector-icons';
import Link from '../../components/Link';
import Text from '../../components/Text';
import View from '../../components/View';

export interface SoundboardProps {
    route: any;
    navigation: any;
}

export default function Soundboard(props: SoundboardProps) {
    const { boardId, boardName } = props.route.params;
    const scheme = useColorScheme();
    const db = useDatabase();
    const dispatch = useDispatch();
    const groups = useSelector((state: ApplicationState) => state.groups.data);
    const groupsPending = useSelector((state: ApplicationState) => state.groups.pending);
    const [newGroupModal, setNewGroupModal] = useState(false);
    const [activeSounds, setActiveSounds] = useState<Record<number, Audio.Sound | undefined>>({});
    const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined);
    const [selectedSound, setSelectedSound] = useState<Sound | undefined>(undefined);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [soundFilter, setSoundFilter] = useState<string>('');

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <Button title='Add Group' onPress={handleShowNewGroupModal} />
            )
        });
    }, []);

    useEffect(() => {
        props.navigation.setOptions({
            title: boardName
        });
    }, [boardName]);

    useEffect(() => {
        dispatch(getGroups(boardId));
    }, [boardId]);

    const handleNewGroup = async (name: string) => {
        try {
            await db.addGroup(name, boardId);
            setNewGroupModal(false);

            dispatch(getGroups(boardId));
        } catch (e) {
            console.error(e);
        }
    }

    const handleAddSound = (groupName: string, groupId: number) => {
        props.navigation.navigate('Recorder', {
            boardId,
            groupName,
            groupId,
        });
    }

    const handleShowNewGroupModal = () => {
        setNewGroupModal(true);
    }

    const handleCloseNewGroupModal = () => {
        setNewGroupModal(false);
    }

    const handlePlaybackStatus = async (item: Sound, status) => {
        if (status.didJustFinish) {
            console.log(`Unloading ${item.id}`);

            await activeSounds[item.id]?.unloadAsync();

            setActiveSounds({
                ...activeSounds,
                [item.id]: undefined,
            });
        }
    }

    const handlePlaySound = async (item: Sound) => {
        // is this sound already playing?
        if (!activeSounds[item.id]) {
            const { sound } = await Audio.Sound.createAsync({
                uri: item.uri
            }, { shouldPlay: true },
                (status) => handlePlaybackStatus(item, status),
                false);

            setActiveSounds({
                ...activeSounds,
                [item.id]: sound,
            });
        } else {
            console.log(`${item.id} is already playing`);
        }
    }

    const handleStopPlayback = async (item: Sound) => {
        if (activeSounds[item.id]) {
            await activeSounds[item.id]?.stopAsync();
            await activeSounds[item.id]?.unloadAsync();

            setActiveSounds({
                ...activeSounds,
                [item.id]: undefined,
            });
        }
    }

    const handleSelectGroup = (group: Group) => {
        setSelectedGroup(group);
        setBottomSheetVisible(true);
    }

    const handleSelectSound = (item: Sound) => {
        setSelectedSound(item);
        setBottomSheetVisible(true);
    }

    const handleDeleteItem = async () => {
        if (selectedSound) {
            await db.removeSound(selectedSound.id);
            setSelectedSound(undefined);

            dispatch(getGroups(boardId));
        } else if (selectedGroup) {
            await db.removeGroup(selectedGroup.id);
            setSelectedGroup(undefined);

            dispatch(getGroups(boardId));
        }

        setBottomSheetVisible(false);
    }

    const handleCancelSheet = () => {
        setSelectedSound(undefined);
        setBottomSheetVisible(false);
    }

    const renderGroupItem = ({ item }) => {
        return (
            <ListItem
                onPress={() => handlePlaySound(item)}
                onLongPress={() => handleSelectSound(item)}
                bottomDivider>
                <ListItem.Content>
                    <ListItem.Title>{item.name}</ListItem.Title>
                </ListItem.Content>
                {activeSounds[item.id] &&
                    <Ionicons 
                        color='red'
                        name={'stop'} 
                        onPress={() => handleStopPlayback(item)} />
                }
            </ListItem>
        )
    }

    const renderSectionHeader = ({ section: { id, title } }) => {
        return (
            <ListItem
                containerStyle={scheme === 'dark' ? styles.darkGroupHeader : styles.lightGroupHeader}
                onLongPress={() => handleSelectGroup(groups.find(g => g.id === id))}
                bottomDivider>
                <ListItem.Content>
                    <ListItem.Title>{title}</ListItem.Title>
                </ListItem.Content>
                <TouchableOpacity onPress={() => handleAddSound(title, id)}>
                    <Icon name='add' />
                </TouchableOpacity>
            </ListItem>
        )
    }

    const groupData = groups.map(g => ({
        title: g.name,
        id: g.id,
        data: soundFilter?.length > 0 ? g.sounds.filter(s => s.name.indexOf(soundFilter) > -1) : g.sounds,
    }));

    return (
        <View>
            {groupsPending && <ActivityIndicator size='large' />}
            {!groupsPending && groups.length === 0 &&
                <CenteredContainer>
                    <Text>You do not have any groups under this soundboard yet.</Text>
                    <TouchableHighlight onPress={handleShowNewGroupModal}>
                        <Link>Create one now!</Link>
                    </TouchableHighlight>
                </CenteredContainer>
            }
            {!groupsPending && groups.length > 0 &&
                <>
                    <SearchBar
                        lightTheme={scheme === 'light'}
                        placeholder='Search for sounds...'
                        onChangeText={setSoundFilter}
                        value={soundFilter} />
                    <SectionList
                        sections={groupData}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={renderGroupItem}
                        renderSectionHeader={renderSectionHeader}
                    />
                </>
            }

            <NewGroupModal
                visible={newGroupModal}
                onClose={handleCloseNewGroupModal}
                onSubmit={handleNewGroup} />

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
    )
}

const styles = StyleSheet.create({
    deleteItem: {
        backgroundColor: 'red',
        color: 'white',
    },
    lightGroupHeader: {
        backgroundColor: '#eee',
    },
    darkGroupHeader: {
        backgroundColor: '#222',
    },
});
