import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "expo-router";
import { useColorScheme } from "react-native";
import { Appbar } from "react-native-paper";

export default function IndexHeader({ backAction }) {
    const { updateTheme, theme } = useAuth();
    const navigation = useNavigation();
    return (

        <Appbar.Header >
            {backAction && <Appbar.Action icon='arrow-left' onPress={() => navigation.goBack()} />}

            <Appbar.Content title="Welcome" />
            <Appbar.Content />
            <Appbar.Action
                icon={theme === 'light' ? 'white-balance-sunny' : 'weather-night'}
                onPress={() => updateTheme(theme === 'light' ? 'dark' : 'light')}
            />
            
            <Appbar.Action icon='translate' onPress={() => { }} />

        </Appbar.Header>
    );
}