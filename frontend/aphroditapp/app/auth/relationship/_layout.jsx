import { useTheme, Icon, Appbar, } from 'react-native-paper';
import RelationshipDetailScreen from './detail';
import NicknameScreen from './nickname';
import InviteScreen from './invite';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateScreen from './create';
import RelationshipsListScreen from './list';
import ListScreen from './list';
import SharedScreen from './shared';

const Stack = createNativeStackNavigator();


export default function LayoutRelationship(props) {
    const theme = useTheme();
    return (
        <Stack.Navigator
            screenOptions={{
                header: prop => {
                    return (
                        <Appbar.Header style={{ backgroundColor: theme.colors.backdrop }} elevated={false}>
                            {prop.back && <Appbar.Action icon='arrow-left' onPress={() => props.navigation.goBack()} />}
                            <Appbar.Content title={prop.options.title || prop.route.name} />
                        </Appbar.Header>
                    )
                },
                headerShown: true,
            }}

        >

            <Stack.Screen
                name="detail"
                component={RelationshipDetailScreen}
                options={{
                    title: 'Detalles'
                }}
            />

            <Stack.Screen
                name="nickname"
                component={NicknameScreen}
                options={{
                    title: 'Crear apodo'
                }}
            />
            <Stack.Screen
                name="invite"
                component={InviteScreen}
                options={{
                    title: 'Inivitar a miembros'
                }}
            />

            <Stack.Screen
                name="create"
                component={CreateScreen}
                options={{
                    title: 'Crear contenido compartido'
                }}
            />
            <Stack.Screen
                name="list"
                component={ListScreen}
                options={{
                    title: 'Lista de contenidos compartidos'
                }}
            />
            <Stack.Screen
                name="shared"
                component={SharedScreen}
                options={(prop) => ({
                    title: prop.route.params?.type 
                })}
            />

        </Stack.Navigator>
    );
};










