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
import {CalendarEvent as APICalendarEvent, EventDetails as APIEventDetails} from '@/api/calendar';

type EventModalProps = PropsWithChildren<{
    event: APICalendarEvent|null;
    pendingEvent?: APIEventDetails;
    owner?: boolean;
    printDate?: string;
    onClose?: any;
}>

export interface CalendarEvent extends ICalendarEventBase {
  description: string;
  needsApproval:any;
}

export default function EventModal({event, owner=false, pendingEvent, printDate, ...props}:EventModalProps) {
    const[approvalModalVisible, setApprovalModalVisible] = useState(true);
    const[editModal, setEditModal] = useState(false);
    const [title, setTitle] = useState(event?.title || '');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(startDate.toISOString()+3600*1000))
    const [cEvent, setEvent] = useState<CalendarEvent>();
    const [approved, setApproved] = useState(0);
    const [pending, setPending] = useState(0);
    const [denied, setDenied] = useState(0);
    const total = pendingEvent?.approvals.length;
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
        console.log(pendingEvent);
        var a = 0;
        var p = 0;
        var d = 0; 
        pendingEvent?.approvals.forEach((e) => {
            if(e.status==='approved')
            {
                a++;
            } else if(e.status==='pending') {
                p++;
            } else {
                d++;
            }
        })
        setApproved(a);
        setDenied(d);
        setPending(p);
        console.log("HERE" + a + " " + d + " " + p);
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
               {owner&& <View style={modalTheme.rowEnd}>
                    <TouchableOpacity onPress={() => deleteEvent()}>
                        <Octicons name='trash' size = {30} color='#000000' style={{margin:5}}/> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showModal(false, true)}>
                        <Octicons name='pencil' size = {30} color='#000000' style={{margin:5}}/> 
                    </TouchableOpacity>
                </View>
                }
            </View>
            <ThemedText type='title'>{event?.title}</ThemedText>
            <ThemedText type='subtitle'>{event?.details}</ThemedText>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="calendar" color='black'/>
                <ThemedText>{printDate}</ThemedText>
            </View>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="pin" color='black'/>
                <ThemedText>Location: {event?.location === "" ? "Living Room" : event?.location}</ThemedText>
            </View>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="person" color='black'/>
                <ThemedText>Created by: {owner? "You" : event?.event_owner_name?.full_name}</ThemedText>
            </View>
            <View style={{width:'100%', marginTop: 50}}>
                <View style={{borderBottomColor: 'rgba(215, 209, 209, 1)', borderBottomWidth: 1, marginTop: 10, marginBottom: 10}}/>
            </View>
            <ThemedText type='title'>Roommate Approval</ThemedText>
            <ThemedText type='subtitle'>{approved} of {total} roommates have approved</ThemedText>
            {pendingEvent && 
                pendingEvent.approvals.map((e) => {
                    
                    if(e.status === 'approved')
                    {
                        return <View style={[modalTheme.rowSpace, modalTheme.rowPadding]}>
                                    <View  style={modalTheme.rowStart}>
                                        <View style={modalTheme.avatarCircle}>
                                        <Text style={modalTheme.avatarText}>{e.user.name.charAt(0)}</Text>
                                        </View>
                                        <ThemedText type='boldText'>{e.user.name}</ThemedText>
                                    </View>
                                    <TouchableOpacity  style={modalTheme.rowEnd} onPress={() => notifyRoommate()}>
                                        <Octicons size={30} name='check-circle' color='black'/>
                                    </TouchableOpacity>
                                </View>
                    }  else if(e.status === 'declined') {
                        return <View style={[modalTheme.rowSpace, modalTheme.rowPadding]}>
                                <View  style={modalTheme.rowStart}>
                                    <View style={modalTheme.avatarCircleRed}>
                                    <Text style={modalTheme.avatarText}>{e.user.name.charAt(0)}</Text>
                                    </View>
                                    <ThemedText type='boldText'>{e.user.name}</ThemedText>
                                </View>
                                <TouchableOpacity  style={modalTheme.rowEnd} onPress={() => notifyRoommate()}>
                                    <Octicons size={30} name='x' color='black'/>
                                </TouchableOpacity>
                            </View>
                    } else {
                      return  <View style={[modalTheme.rowSpace, modalTheme.rowPadding]}>
                                <View  style={modalTheme.rowStart}>
                                    <View style={modalTheme.avatarCircleYellow}>
                                    <Text style={modalTheme.avatarText}>{e.user.name.charAt(0)}</Text>
                                    </View>
                                    <ThemedText type='boldText'>{e.user.name}</ThemedText>
                                </View>
                                <TouchableOpacity  style={modalTheme.rowEnd} onPress={() => notifyRoommate()}>
                                    <Octicons size={30} name='bell' color='black'/>
                                </TouchableOpacity>
                            </View>
                    }
                })
            }
            
            
            </View>
        </Modal>
        {editModal && (
            <ModalCalendarForm formTitle="Edit Event" edit={true} event={event} onClose={() => showModal(true, false)}/>
        )}
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
    },
    avatar: {
    width: 78,
    alignItems: "center",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: "#087d4b",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircleYellow: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: "#f8b118",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircleRed: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: "#f81818",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  avatarName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
    maxWidth: 78,
    textAlign: "center",
  },
});
