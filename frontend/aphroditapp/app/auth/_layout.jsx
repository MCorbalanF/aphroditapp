import { useTheme, Icon, } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeLayout from "./home.jsx";
import ProfileLayout from "./profile.jsx";
import CreateRelationshipScreen from './create.jsx';
import NotificationsScreen from './notifications.jsx';
import LayoutRelationship from './relationship/_layout.jsx';
const Tab = createBottomTabNavigator();


export default function LayoutAuth(props) {
    const theme = useTheme();
    return (
        <Tab.Navigator

            screenOptions={{
                //header: prop => <></>,
                headerShown: false,
                tabBarLabelPosition: 'below-icon',
                tabBarLabelStyle: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
                
                tabBarStyle: { height: 58 },
                tabBarInactiveTintColor: theme.colors.backdrop,
                tabBarActiveTintColor: theme.colors.onPrimaryContainer,
                tabBarActiveBackgroundColor: theme.colors.primaryContainer,
            }}
        >

            <Tab.Screen
                name="home"
                component={HomeLayout}
                options={{
                    tabBarIcon: prop => <Icon source='home' {...prop} />
                }}
            />


            <Tab.Screen
                name="create"
                component={CreateRelationshipScreen}
                options={{
                    tabBarItemStyle: { display: 'none', height: 0, width: 0, padding: 0 },
                }}
            />

            <Tab.Screen
                name="notifications"
                component={NotificationsScreen}
                options={{

                    tabBarItemStyle: { display: 'none', height: 0, width: 0, padding: 0 },
                }}
            />

            <Tab.Screen
                name="profile"
                component={ProfileLayout}
                options={{
                    tabBarIcon: prop => <Icon source='cog' {...prop} />
                }}
            />

            <Tab.Screen
                name="relationship"
                component={LayoutRelationship}

                options={{

                    tabBarItemStyle: { display: 'none', height: 0, width: 0, padding: 0 },
                }}
            />
        </Tab.Navigator>
    );
};










