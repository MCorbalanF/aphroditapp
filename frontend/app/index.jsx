

import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
    Provider as PaperProvider,
    MD3LightTheme as DefaultTheme,
    MD3DarkTheme as DarkTheme,
    useTheme,
    IconButton,
    Portal,
    Text,
    Button,
    TextInput,
    Appbar
} from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import logo from '../assets/images/logo.png'
import { useNavigation } from '@react-navigation/native';

import LayoutAuth from './auth/_layout';

const Stack = createNativeStackNavigator();


export default function LayoutIndex() {
    return (

        <Stack.Navigator screenOptions={{ headerShown: false}} >


            <Stack.Screen name="landing" options={{headerShown:false}} >

                {(props) => {
                    return (
                        <Landing {...props}  />
                    );
                }}

            </Stack.Screen>
            
            <Stack.Screen name="auth" options={{headerShown:false}} >

                {(props) => {
                    return (
                        <LayoutAuth {...props}  />
                    );
                }}

            </Stack.Screen>
            
            <Stack.Screen name="login" options={{headerShown:true}} >

                {(props) => {
                    return (
                        <LayoutLogin {...props} />
                    );
                }}

            </Stack.Screen>
            
            <Stack.Screen name="signin" options={{headerShown:true}} >

                {(props) => {
                    return (
                        <LayoutSignin {...props}  />
                    );
                }}

            </Stack.Screen>
        </Stack.Navigator>
    )



}

function Landing() {
    const navigation = useNavigation();



    const { width, height } = useWindowDimensions();
    const isLargeScreen = width >= 768;
    const theme = useTheme();
    const styles = StyleSheet.create({
        main: {
            width: width,
            height: height,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            backgroundColor: theme.colors.background
        },
        img: {
            marginBottom: 30
        }
    });
    return (
        <>
            <ScrollView contentContainerStyle={styles.main}>
<Appbar >
    <Appbar.Content title="Welcome to Aphroditapp" />
    <Appbar.Action icon='close' onPress={() => {}} />
    <Appbar.Content title="Welcome to Aphroditapp" />
</Appbar>
                <View style={styles.img}>

                    <Text variant='displayLarge' style={{textAlign:'center'}}  >Aphroditapp</Text>
                    <Image source={logo} style={{ width:isLargeScreen ? 400 :300, height: isLargeScreen ? 400 :300 }} />

                </View>

                <Button mode='contained' onPress={() => navigation.navigate('login')}>I'm already a user</Button>
                <Button contentStyle={{paddingHorizontal:20}} onPress={() => navigation.navigate('signin')} >Register</Button>

            </ScrollView>

        </>
    );
};






function LayoutLogin() {
    const navigation = useNavigation();
    const mode = 'outlined';
    const { width, height } = useWindowDimensions();
    const isLargeScreen = width >= 768;
    const theme = useTheme();
    const styles = StyleSheet.create({
        main: {
            width: width,
            height: height,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            backgroundColor: theme.colors.background
        },
        img: {
            marginBottom: 30
        }
    });
    return (
        <ScrollView>


        <View style={styles.main}>
            <TextInput mode={mode} label='User'/>
            <TextInput mode={mode} label='Pass'/>
            <Button mode='contained'  onPress={() => navigation.navigate('auth')} >Login</Button>


        </View>
        </ScrollView>

    );
};




 function LayoutSignin(){
    return(

        <ScrollView>
            <View>
                <Text>Register</Text>
            </View>
        </ScrollView>
    );
};