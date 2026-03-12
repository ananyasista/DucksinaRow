import { Calendar, ICalendarEventBase, Mode } from 'react-native-big-calendar'
import { StyleSheet, Dimensions, TouchableOpacity, Modal, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
// import { View } from 'react-native-reanimated/lib/typescript/Animated';
import { View, Text } from 'react-native';
import { Button, Header } from '@react-navigation/elements';
import Octicons from "@expo/vector-icons/Octicons";
import { PropsWithChildren } from 'react';
import { ThemedText } from './themed-text';
import { ThemedTextInput } from './text-input';
import { ThemedSwitch } from './themed-switch';
// import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from './ui/icon-symbol';
import ModalCalendarForm from './modal-calendar-form';
import {CalendarEvent as APICalendarEvent} from '@/api/calendar';

type EventModalProps = PropsWithChildren<{
    event: APICalendarEvent|null;
    printDate?: string;
    onClose?: any;
}>

export interface CalendarEvent extends ICalendarEventBase {
  description: string;
  needsApproval:any;
}

export default function EventModal({event,printDate, ...props}:EventModalProps) {
    const[approvalModalVisible, setApprovalModalVisible] = useState(true);
    const[editModal, setEditModal] = useState(false);
    const [title, setTitle] = useState(event?.title || '');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(startDate.toISOString()+3600*1000))

    useEffect(()=> {
        if(event?.start_date)
        {
            setStartDate(new Date(event.start_date));
            if(event?.end_date)
            {
                setEndDate(new Date(event.end_date));
            } else {
                setEndDate(new Date(startDate.toISOString() + 3600*1000));
            }
        }
    },[])
    function close() {
        setApprovalModalVisible(false);
        props.onClose();
    }

    function showModal(approval: boolean, edit: boolean)
    {
        setApprovalModalVisible(approval);
        setEditModal(edit);
    }
    function notifyRoommate() 
    {
        //TODO: Add in reminding roommate of event apporval
    }
    function deleteEvent() 
    {
        //TODO: Add in deletion functionality
    }
  return (
    <View>
        <Modal 
            animationType="slide"
            visible={approvalModalVisible}
            presentationStyle='formSheet'
            allowSwipeDismissal = {true}
            onRequestClose = {() => close()} 
        >
            <View style ={modalTheme.container}>
            <View style={modalTheme.rowSpace}>
                <TouchableOpacity onPress={() => close()}>
                    <Octicons name='x-circle' size = {30} color='#000000'/> 
                </TouchableOpacity>
                <View style={modalTheme.rowEnd}>
                    <TouchableOpacity onPress={() => deleteEvent()}>
                        <Octicons name='trash' size = {30} color='#000000' style={{margin:5}}/> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showModal(false, true)}>
                        <Octicons name='pencil' size = {30} color='#000000' style={{margin:5}}/> 
                    </TouchableOpacity>
                </View>
            </View>
            <ThemedText type='title'>{event?.title}</ThemedText>
            <ThemedText type='subtitle'>{event?.details}</ThemedText>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="calendar" color='black'/>
                <ThemedText>{printDate}</ThemedText>
            </View>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="pin" color='black'/>
                <ThemedText>Location: {event?.location}</ThemedText>
            </View>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="person" color='black'/>
                <ThemedText>Created by: {event?.event_owner_name?.full_name}</ThemedText>
            </View>
            <View style={{width:'100%', marginTop: 50}}>
                <View style={{borderBottomColor: 'rgba(215, 209, 209, 1)', borderBottomWidth: 1, marginTop: 10, marginBottom: 10}}/>
            </View>
            <ThemedText type='title'>Roommate Approval</ThemedText>
            <ThemedText type='subtitle'># of # roommates have approved</ThemedText>
            {/* {
                // event?.needsApproval.map((e: string) =>  {
                //     return  <View style={[modalTheme.rowSpace, modalTheme.rowPadding]}>
                //                 <View  style={modalTheme.rowStart}>
                //                     <IconSymbol size={40} name="circle.fill" color='rgba(86, 182, 100, 1)' />
                //                     <ThemedText type='boldText'>{e}</ThemedText>
                //                 </View>
                //                 <TouchableOpacity  style={modalTheme.rowEnd} onPress={() => notifyRoommate()}>
                //                     <Octicons size={30} name='check-circle' color='black'/>
                //                 </TouchableOpacity>
                //             </View>;
                })
            } */}
            </View>
        </Modal>
        {/* {editModal && (
            <ModalCalendarForm formTitle="Edit Event" edit={true} event={event} onClose={() => showModal(true, false)}/>
        )} */}
    </View>
  )
}

const modalTheme = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        justifyContent:"space-between",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 12
    },
    rowSpace: {
        justifyContent:"space-between",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    rowStart: {
        justifyContent:"flex-start",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    rowEnd: {
        justifyContent:"flex-end",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    rowPadding: {
        marginTop:10,
        marginBottom:10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 600
    },
    addButton: {
        backgroundColor: '#087d4b',
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
