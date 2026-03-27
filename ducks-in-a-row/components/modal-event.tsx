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
import {CalendarEvent as APICalendarEvent, EventDetails as APIEventDetails, getEventId} from '@/api/calendar';
import { useFocusEffect } from 'expo-router';

type EventModalProps = PropsWithChildren<{
    event: APICalendarEvent|null;
    pendingEvent?: APIEventDetails|null;
    owner?: boolean;
    onClose?: any;
    updateCal?: any;
}>

export interface CalendarEvent extends ICalendarEventBase {
  description: string;
  needsApproval:any;
}

export default function EventModal({event, owner=false, pendingEvent, ...props}:EventModalProps) {
    const abbrMonth = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const [printDate, setPrintDate] = useState("");

    const[approvalModalVisible, setApprovalModalVisible] = useState(true);
    const[editModal, setEditModal] = useState(false);
    const [title, setTitle] = useState(event?.title || '');
    const [details, setDetails] = useState(event?.details || "");
    const [startDate, setStartDate] = useState(new Date(event?.start_date||""));
    const [endDate, setEndDate] = useState(event?.end_date ? new Date(event.end_date) : new Date(event?.start_date??startDate.toISOString()+3600*1000));
    const [location, setLocation] = useState("");
    const [cEvent, setEvent] = useState<CalendarEvent>();
    const [approved, setApproved] = useState(0);
    const [pending, setPending] = useState(0);
    const [denied, setDenied] = useState(0);
    const total = pendingEvent?.approvals.length;
    useEffect(()=> {
        setTitle(event?.title ?? "");
        if(event?.details){setDetails(event.details);}
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
        setLocation(event?.location ?? "");
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
        getPrintDate();
    },[event, pendingEvent])

    
        
    function getPrintDate() {
        var date = "";
        date += abbrMonth[startDate.getMonth()] + " ";
        date += startDate.getDate();
        var day = startDate.getDate()+"";
        const st = new RegExp("$1|21|31^");
        const nd = new RegExp("$2|22^");
        const rd = new RegExp("$3|23^");
        date +=  st.test(day)? "st" : 
                nd.test(day)? "nd" :
                rd.test(day)?"rd" :
                "th";
        date += " ";

        if(startDate.getHours() == 0)
        {
            date += "12:" + startDate.getMinutes();
        } else if(startDate.getHours() > 12) {
            date += (startDate.getHours()%12) + ":"+ startDate.getMinutes();
        } else {
            date += startDate.getHours() + ":"+ startDate.getMinutes();
        }
        
        if(startDate.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(startDate.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        date += " - ";
        
        if(startDate.getMonth() !== endDate.getMonth() || startDate.getDate() !== endDate.getDate())
        {
            date += abbrMonth[endDate.getMonth()] + " ";
            date += endDate.getDate() ;
            var endDay = endDate.getDay()+"";
            date +=  st.test(endDay)? "st" : 
                nd.test(endDay)? "nd" :
                rd.test(endDay)?"rd" :
                "th";
            date += " ";
        } 
        
        if(endDate.getHours() == 0)
        {
            date += "12:" + endDate.getMinutes();
        } else if(endDate.getHours() > 12) {
            date += (endDate.getHours()%12) + ":"+ endDate.getMinutes();
        } else {
            date += endDate.getHours() + ":"+ endDate.getMinutes();
        }
        
        if(endDate.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(endDate.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        setPrintDate(date);
    }

    function close() {
        setApprovalModalVisible(false);
        props.onClose();
    }

    async function showModal(approval: boolean, edit: boolean)
    {
        setApprovalModalVisible(approval);
        setEditModal(edit);
        if(props.updateCal)
        {
            props.updateCal();
        }
    
        if(event)
        {
            event = await getEventId(event.id);
            console.log("Updated event: " + event);
            setTitle(event.title);
            setDetails(event.details ?? "");
            setStartDate(new Date(event.start_date));
            setEndDate(new Date(event.end_date ?? event.start_date + 3600*1000));
            getPrintDate();
            setLocation(event.location ?? "");
            
        }
        
    }

    function updateModal(title:string, detail:string, startDate: string, endDate: Date, location:string)
    {
        setTitle(title);
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
                <TouchableOpacity style={modalTheme.containerButton} onPress={() => close()}>
                    <Octicons name='x' size = {28} color='#000000'/> 
                </TouchableOpacity>
                <View style={{margin:30}}/>
               {owner&& <View style={[modalTheme.rowEnd, {gap:10} ]}>
                    <TouchableOpacity style={[modalTheme.containerButton, {borderColor:'black'}]} onPress={() => deleteEvent()}>
                        <Octicons name='trash' size = {28} color='black' style={{margin:5}}/> 
                    </TouchableOpacity>
                    <TouchableOpacity style={[modalTheme.containerButton, {borderColor:'black'}]} onPress={() => showModal(false, true)}>
                        <Octicons name='pencil' size = {28} color='black' style={{margin:5}}/> 
                    </TouchableOpacity>
                </View>
                }
            </View>
            <ThemedText type='title'>{title}</ThemedText>
            <ThemedText type='secondarySubtitle'>{details}</ThemedText>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="calendar" color='black'/>
                <ThemedText>{printDate}</ThemedText>
            </View>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="pin" color='black'/>
                <ThemedText>Location: {location}</ThemedText>
            </View>
            <View style={modalTheme.rowStart}>
                <IconSymbol size={20} name="person" color='black'/>
                <ThemedText>Created by: {owner? "You" : event?.event_owner_name}</ThemedText>
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
                                    <View style={modalTheme.rowStart}>
                                        <View style={modalTheme.avatarCircle}>
                                        <Text style={modalTheme.avatarText}>{e.user.name.charAt(0)}</Text>
                                        </View>
                                        <ThemedText type='boldText'>{e.user.name}</ThemedText>
                                    </View>
                                    <Octicons size={30} name='check-circle' color='black'/>
                                </View>
                    }  else if(e.status === 'declined') {
                        return <View style={[modalTheme.rowSpace, modalTheme.rowPadding]}>
                                <View  style={modalTheme.rowStart}>
                                    <View style={modalTheme.avatarCircleRed}>
                                    <Text style={modalTheme.avatarText}>{e.user.name.charAt(0)}</Text>
                                    </View>
                                    <ThemedText type='boldText'>{e.user.name}</ThemedText>
                                </View>
                                <Octicons size={30} name='x' color='black'/>
                            </View>
                    } else {
                      return  <View style={[modalTheme.rowSpace, modalTheme.rowPadding]}>
                                <View  style={modalTheme.rowStart}>
                                    <View style={modalTheme.avatarCircleYellow}>
                                    <Text style={modalTheme.avatarText}>{e.user.name.charAt(0)}</Text>
                                    </View>
                                    <ThemedText type='boldText'>{e.user.name}</ThemedText>
                                </View>
                                <IconSymbol size={30} name='hourglass' color='black'/>
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
    containerButton: {
        borderWidth: 1,
        borderRadius: 30,
        width: 45,
        height: 45,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
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
    marginRight: 10,
  },
  avatarCircleYellow: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: "#f8b118",
    justifyContent: "center",
    alignItems: "center",
        marginRight: 10,

  },
  avatarCircleRed: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: "#f81818",
    justifyContent: "center",
    alignItems: "center",
        marginRight: 10,

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
