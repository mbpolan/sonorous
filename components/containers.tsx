import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import View from '../components/View';

export interface ContainerProps {
    children: ReactNode;
}

export function CenteredContainer(props: ContainerProps) {
    return (
        <View style={styles.container}>
            {props.children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
