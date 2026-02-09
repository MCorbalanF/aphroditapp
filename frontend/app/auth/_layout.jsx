import { useState, useContext, useEffect, useRef } from "react";
import {
    View, SafeAreaView, ScrollView, useWindowDimensions, StyleSheet, Easing,
    Image, Pressable, useColorScheme, ImageBackground,
    TouchableOpacity,
} from "react-native";
import SwipeableItem, {
    useSwipeableItemParams,
} from "react-native-swipeable-item";
import { ThemeProvider, useNavigation, useRoute } from "@react-navigation/native";
import DraggableFlatList, { NestableScrollContainer, NestableDraggableFlatList, ScaleDecorator, } from "react-native-draggable-flatlist"

import {
    TextInput, Button, Card, useTheme, Text, Icon, Avatar,
    IconButton, Searchbar, Chip,
    overlay, Divider, List, Appbar, HelperText,
    Checkbox, Portal, Dialog, ActivityIndicator, RadioButton

} from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { user } from '../../constants/mockdata.js'
const Tab = createBottomTabNavigator();


export default function LayoutAuth(props) {


    const theme = useTheme();
    return (
        <Tab.Navigator
            screenOptions={{
                header: prop => <TabHeader {...prop} />,
                headerShown: true
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: prop => <Icon source='home' {...prop} />
                }}
            />
            <Tab.Screen
                name="config"
                component={Profile}
                options={{
                    tabBarIcon: prop => <Icon source='cog' {...prop} />
                }}
            />
            <Tab.Screen
                name="User"
                component={Home}
                options={{
                    tabBarIcon: prop => <Icon source='account' {...prop} />
                }}
            />
        </Tab.Navigator>
    );
};













function Home() {


    const [list, setList] = useState(user.relationships.love);

    const { width, height } = useWindowDimensions();
    const isLargeScreen = width >= 768;
    const theme = useTheme();
    const styles = StyleSheet.create({
        main: {


        },

    });
    return (
        <ScrollView contentContainerStyle={styles.main}>

            <NestableScrollContainer>
                <DraggableFlatList
                    activationDistance={1}
                    data={list}

                    onDragEnd={({ data }) => setList(data)}

                    keyExtractor={(item) => item.id}
                    maxToRenderPerBatch={5}
                    renderItem={RelationshipItem}
                />

            </NestableScrollContainer>



        </ScrollView>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
    },
    text: {
        fontWeight: "bold",
        color: "white",
        fontSize: 32,
    },
    underlayRight: {
        flex: 1,
        opacity: 1,
        backgroundColor: "#99009966",
        justifyContent: "flex-start",
    },
    underlayLeft: {
        flex: 1,
        opacity: 1,

        backgroundColor: "#99009966",
        justifyContent: "flex-end",
    },
});


const RelationshipItem = (props) => {
    const {
        item, drag, isActive, getIndex
    } = props;
    const itemRefs = useRef(null);
    return (

        <SwipeableItem
            key={item.key}
            item={item}
          
            renderUnderlayLeft={(prop) => <UnderlayLeft {...prop} />}
            renderUnderlayRight={(prop) => <UnderlayRight {...prop} />}
            renderOverlay={prop=>{
                console.log(prop)
                return(
                    <Pressable {...prop}>

                
                    <View  style={[styles.row, { height: 100, backgroundColor: '#00112266', justifyContent: 'space-between' }]}>
    
                    <IconButton icon='drag' onLongPress={drag} />
                    <View >
                        <Text >{`${item.name}`}</Text>
                    </View>
                    <IconButton icon='arrow-right' onLongPress={drag} />
    
                </View></Pressable>
                )
            }

           
            }
           
            snapPointsLeft={[150]}
            snapPointsRight={[150]}
        >
          

        </SwipeableItem>



    );
};
const UnderlayLeft = (props) => {
    const { close } = useSwipeableItemParams();

    return (

        <Pressable onPress={() => close()} style={[styles.row, styles.underlayLeft]}>
            
                <IconButton icon='close' />
                <Text>close</Text>

         

        </Pressable>

    );
};


const UnderlayRight = () => {
    const { close } = useSwipeableItemParams();
    return (

        <Pressable onPress={() => close()} style={[styles.row, styles.underlayRight]}>

                <IconButton icon='pencil' />
                <Text>Pauperrimo</Text>

        </Pressable>

    );
};























function Profile() {
    return (
        <ScrollView>
            <View>
                <Text>Profile TEST TEST</Text>
            </View>
        </ScrollView>
    )
}

function TabHeader() {
    return (
        <Appbar.Header>

            <Appbar.Content title='Aphroditapp' />
            <Appbar.Action icon='account' />

        </Appbar.Header>
    );
};
