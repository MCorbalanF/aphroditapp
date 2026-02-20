import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import RelationshipsListScreen from '../screens/relationships/RelationshipsListScreen';
import RelationshipDetailScreen from '../screens/relationships/RelationshipDetailScreen';
import CreateRelationshipScreen from '../screens/relationships/CreateRelationshipScreen';
import InviteScreen from '../screens/relationships/InviteScreen';
import NicknameScreen from '../screens/relationships/NicknameScreen';
import ContentListScreen from '../screens/content/ContentListScreen';
import CreateNoteScreen from '../screens/content/CreateNoteScreen';
import CreateEventScreen from '../screens/content/CreateEventScreen';
import CreateChecklistScreen from '../screens/content/CreateChecklistScreen';
import CreateListScreen from '../screens/content/CreateListScreen';
import ChecklistDetailScreen from '../screens/content/ChecklistDetailScreen';
import SharedListDetailScreen from '../screens/content/SharedListDetailScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RelationshipsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
      }}
    >
      <Stack.Screen
        name="RelationshipsList"
        component={RelationshipsListScreen}
        options={{ title: 'Mis relaciones' }}
      />
      <Stack.Screen
        name="RelationshipDetail"
        component={RelationshipDetailScreen}
        options={({ route }) => ({ title: route.params?.name || 'Relación' })}
      />
      <Stack.Screen
        name="CreateRelationship"
        component={CreateRelationshipScreen}
        options={{ title: 'Nueva relación', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Invite"
        component={InviteScreen}
        options={{ title: 'Invitar', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Nicknames"
        component={NicknameScreen}
        options={{ title: 'Apodos', presentation: 'modal' }}
      />
      <Stack.Screen
        name="ContentList"
        component={ContentListScreen}
        options={{ title: 'Contenido' }}
      />
      <Stack.Screen
        name="CreateNote"
        component={CreateNoteScreen}
        options={{ title: 'Nueva nota', presentation: 'modal' }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ title: 'Nuevo evento', presentation: 'modal' }}
      />
      <Stack.Screen
        name="CreateChecklist"
        component={CreateChecklistScreen}
        options={{ title: 'Nueva checklist', presentation: 'modal' }}
      />
      <Stack.Screen
        name="CreateList"
        component={CreateListScreen}
        options={{ title: 'Nueva lista', presentation: 'modal' }}
      />
      <Stack.Screen
        name="ChecklistDetail"
        component={ChecklistDetailScreen}
        options={{ title: 'Checklist' }}
      />
      <Stack.Screen
        name="SharedListDetail"
        component={SharedListDetailScreen}
        options={{ title: 'Lista compartida' }}
      />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 8,
          shadowOpacity: 0.1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'home-heart',
            Relationships: 'account-group',
            Notifications: 'bell',
            Profile: 'account-circle',
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name] || 'circle'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ title: 'Inicio' }} />
      <Tab.Screen
        name="Relationships"
        component={RelationshipsStack}
        options={{ title: 'Relaciones' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notificaciones', headerShown: true, headerTitle: 'Notificaciones' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerShown: true, headerTitle: 'Mi perfil' }}
      />
    </Tab.Navigator>
  );
}
