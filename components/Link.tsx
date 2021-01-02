import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Theme, withTheme } from 'react-native-elements';
import Text, { TextProps } from './Text';

export interface LinkProps extends TextProps {
    children: ReactNode;
    theme: Theme;
}

function Link(props: LinkProps) {
    return (
        <Text style={styles.link} {...props}>{props.children}</Text>
    );
}

const styles = StyleSheet.create({
    link: {
        textDecorationLine: 'underline'
    }
});

export default withTheme(Link);
