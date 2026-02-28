import { Calendar, Mode } from 'react-native-big-calendar'
import { StyleSheet, Dimensions, TouchableOpacity, Modal} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
// import { View } from 'react-native-reanimated/lib/typescript/Animated';
import { View, Text } from 'react-native';
import { Button, Header } from '@react-navigation/elements';
import Octicons from "@expo/vector-icons/Octicons";
import { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{
    title:string;
}>;
export default function ModalForm(props: ModalProps) {
    const[addVisible, setAddVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1}}>
        {/*Floating Add Button*/}
        <View style = {modalTheme.addButton}>
            <TouchableOpacity onPress={() => setAddVisible(true)}>
                <Octicons name='plus' size = {30} color='#fff'/> 
            </TouchableOpacity>
        </View>

        <Modal 
            animationType="slide"
            visible={addVisible}
            presentationStyle='formSheet'
            allowSwipeDismissal = {true}
            onRequestClose = {() => setAddVisible(false)} 
        >
            <View style={modalTheme.header}>
                <TouchableOpacity style={modalTheme.cancelButton} onPress={() => setAddVisible(false)}>
                    <Text style={modalTheme.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={modalTheme.headerText}>{props.title}</Text>
                <TouchableOpacity style={modalTheme.saveButton} onPress={() => setAddVisible(false)}>
                    <Text style={modalTheme.saveText}>Save</Text>
                </TouchableOpacity>
            </View>
            <View style= {{flex: 1, padding: 16}}>
                {props.children}
            </View>
        </Modal>
    </SafeAreaView>
  )
}

const modalTheme = StyleSheet.create({
    header: {
        justifyContent:"space-between",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 12
    },
    headerText: {
        fontSize: 24,
        fontWeight: 600
    },
    addButton: {
        backgroundColor: '#4DC591',
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        right: 30,
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 50
    },
    cancelText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 500
    },
    saveButton: {
        backgroundColor: '#000',
        borderRadius: 10,
        color: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 50
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 500
    }
});
