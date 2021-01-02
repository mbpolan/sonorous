import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/Home';
import { Provider } from 'react-redux';
import { configureStore } from './state/store';
import AppLoading from 'expo-app-loading';
import { initializeDb } from './utils/database';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Soundboard from './screens/Soundboard';
import Recorder from './screens/Recorder';
import { ThemeProvider } from 'react-native-elements';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import Text from './components/Text';
import View from './components/View';
import useDatabase from './hooks/useDatabase';

const store = configureStore();
const Stack = createStackNavigator();

export default function App() {
  const scheme = useColorScheme();
  const db = useDatabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    const initialize = async () => {
      try {
        await db.initialize();
        setLoading(false);
      } catch (e) {
        console.error(e);

        setLoading(false);
        setError(e);
      }
    }

    initialize();
  }, []);

  if (loading) {
    return <AppLoading />;
  } else {
    return (
      <AppearanceProvider>
        <ThemeProvider useDark={scheme === 'dark'}>
          <SafeAreaProvider>
            {error &&
              <SafeAreaView>
                <View>
                  <Text>Unable to load app: {error}</Text>
                </View>
              </SafeAreaView>
            }
            {!error &&
              <Provider store={store}>
                <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack.Navigator>
                    <Stack.Screen name="Home" options={{ title: 'Soundboards' }} component={Home} />
                    <Stack.Screen name="Soundboard" component={Soundboard} />
                    <Stack.Screen name="Recorder" options={{ title: 'Record Sound' }} component={Recorder} />
                  </Stack.Navigator>
                </NavigationContainer>
                <StatusBar style='auto' />
              </Provider>
            }
          </SafeAreaProvider>
        </ThemeProvider>
      </AppearanceProvider >
    );
  }
}
