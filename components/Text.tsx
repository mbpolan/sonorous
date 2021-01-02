import React, { ReactNode } from 'react';
import { Text as RawText, TextProps as RawTextProps } from "react-native";
import { Theme, withTheme } from 'react-native-elements';

export interface TextProps extends RawTextProps {
    children: ReactNode;
    theme: Theme;
}

function Text(props: TextProps) {
    return (
        <RawText style={{
            color: props.theme.colors!.primary,
        }}>
            {props.children}
        </RawText>
    );
}

export default withTheme(Text);
