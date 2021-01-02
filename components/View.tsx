import React, { ReactNode } from 'react';
import { View as RawView, ViewProps as RawViewProps } from 'react-native';
import { Theme, withTheme } from 'react-native-elements';

export interface ViewProps extends RawViewProps {
    children: ReactNode;
    theme: Theme;
}

function View(props: ViewProps) {
    return (
        <RawView {...props}>
            {props.children}
        </RawView>
    );
}

export default withTheme(View);
