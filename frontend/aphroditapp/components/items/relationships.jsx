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


export default function RelationshipItem(props) {
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
            renderOverlay={prop => {
                return (

                    <List.Item
                        {...prop}
                        title={item.name}
                        left={props => <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                            <IconButton icon='drag' onLongPress={drag} />
                            <Avatar.Image size={50} source={{ uri: item.avatar }} />

                        </View>}
                        right={props => <IconButton icon='close' />}

                    />
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

