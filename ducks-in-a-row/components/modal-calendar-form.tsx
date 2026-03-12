import { Calendar, ICalendarEventBase, Mode, todayInMinutes } from 'react-native-big-calendar'
import { StyleSheet, Dimensions, TouchableOpacity, Modal, Platform, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { use, useState } from 'react';
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
import {CalendarEvent as APICalendarEvent, createEvent, updateEvent} from '@/api/calendar';

type ModalProps = PropsWithChildren<{
    formTitle:string;
    edit?: boolean;
    event?: APICalendarEvent | null;
    onClose?: any;
}>;

export default function ModalCalendarForm({edit = false,event, onClose, ...props}: ModalProps) {
    const [addVisible, setAddVisible] = useState(edit);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [mode, setMode] = useState(undefined);
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [eventTitleError, setEventTitleError] = useState(false);
    const [startDateError, setStartDateError] = useState(false);
    const [endDateBeforeStartError, setEndDateBeforeStartError] = useState(false);
    const [endDateError, setEndDateError] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [allDay, setAllDay] = useState(false);
    const [needsApproval, setNeedsApproval] =useState(false);

    const onChangeStart = (event:DateTimePickerEvent, selectedDate?:Date) => {
      const currentDate = selectedDate ? selectedDate : new Date(todayInMinutes());
      setStartDate(currentDate);
    };
    const onChangeEnd = (event:DateTimePickerEvent, selectedDate?:Date) => {
      const currentDate = selectedDate ? selectedDate : new Date(todayInMinutes()+ 3600);
      setEndDate(currentDate);
    }
    
    const showMode = (currentMode: any) => {
      setShowStart(true);
      if(event?.start_date)
      {
        setStartDate(new Date(event.start_date));
      } else {
        setStartDate(new Date());
      }
      setShowEnd(true);
      if(event?.end_date)
      {
        setEndDate(new Date(event.end_date));
      } else {
        setEndDate(new Date());
      }
      setMode(currentMode);
      endDate.setHours(endDate.getHours()+1);
    };

    const close = () => {
        // var errors = checkErrors();
        // if(!errors){return;}
        setAddVisible(false);
        onClose();
    }
    
    const save = () => {
        var noErrors = checkErrors();
        if(!noErrors)
        {
            return;
        }
        try {
            const eventToSave: APICalendarEvent = {
                id: event?.id ??"",
                title: eventTitle,
                details: eventDescription,
                all_day: allDay,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                repeat: "",
                requires_approval: true,
                location: eventLocation,
            }
            close(); //COME BACK!!
            return;
            // if(event)
            // {
            //     console.log('update');
            //     updateEvent(event.id, eventToSave);
            // } else {
            //     console.log('create');
            //     createEvent(eventToSave);
            // }

        } catch (e: any) {
            console.log("ERROR Saving Event Modal: " + e);
        }
    }
    
    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };
    
    function checkErrors() {
        var error = false
        if(eventTitle === "")
        {
            setEventTitleError(true);
            error = true;
        }
        if(startDate > endDate)
        {
            setEndDateBeforeStartError(true);
            error = true;
        }
        return !error;
    }
    function open() {
        setEventTitleError(false);
        setStartDateError(false);
        setEndDateError(false);
        setEndDateBeforeStartError(false);
        setAddVisible(true);
    }
  return (
    <View >
        {!edit && (
            <TouchableOpacity  style = {modalTheme.addButton} onPress={() => open()}>
                <Octicons name='plus' size = {30} color='#fff'/> 
            </TouchableOpacity>
        )}       

        <Modal 
            animationType="slide"
            visible={addVisible}
            presentationStyle='formSheet'
            allowSwipeDismissal = {true}
            onRequestClose = {() => close()} 
        >
            <View style={modalTheme.header}>
                <TouchableOpacity style={modalTheme.cancelButton} onPress={() => close()}>
                    <Text style={modalTheme.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={modalTheme.headerText}>{props.formTitle}</Text>
                <TouchableOpacity style={modalTheme.saveButton} onPress={() => save()}>
                    <Text style={modalTheme.saveText}>Save</Text>
                </TouchableOpacity>
            </View>
            <ScrollView>
            <View style= {{flex: 1, padding: 16}}>
                {eventTitleError && (<ThemedText type='errorText'>Event title is required</ThemedText>)}
                <ThemedText type="boldText" >Event Title:</ThemedText>
                <ThemedTextInput onChangeText={setEventTitle}placeholder="Item Name" defaultValue={event?.title}/>
                <ThemedText type="boldText">Description:</ThemedText>
                <ThemedTextInput onChangeText={setEventDescription} size="large" multiline={true} placeholder="Add Details" defaultValue={event?.details}/>
                <ThemedSwitch onChangeSwitch={setAllDay} label="All-Day" />
                
                <View onLayout={showDatepicker}>
                {startDateError && (<ThemedText type='errorText'>Start date is required</ThemedText>)}
                {endDateBeforeStartError && (<ThemedText type='errorText'>End date must be AFTER start date</ThemedText>)}

                <ThemedText type='boldText'>Start Date:</ThemedText>

                {showStart && (
                    <View style={modalTheme.rowSpace}>
                        <View style={modalTheme.rowStart}>
                            <IconSymbol size={20} name="calendar" color='black'/>
                            <DateTimePicker
                                testID="startDate"
                                value={startDate}
                                mode={'date'}
                                display='default'
                                onChange={onChangeStart}
                                themeVariant='light'
                            />
                        </View>
                        {!allDay &&
                        <View style={modalTheme.rowStart}>
                            <IconSymbol size={20} name="clock" color='black'/>
                            <DateTimePicker
                                testID="startTime"
                                value={startDate}
                                mode={'time'}
                                is24Hour={true}
                                onChange={onChangeStart}
                                themeVariant='light'
                            />
                        </View>
                        } 
                    </View>
                )}
                {endDateError && (<ThemedText type='errorText'>End date is required</ThemedText>)}
                <ThemedText type='boldText'>End Date:</ThemedText>
                    {showEnd && (
                    <View style={modalTheme.rowSpace}>
                        <View style={modalTheme.rowStart}>
                            <IconSymbol size={20} name="calendar" color='black'/>
                            <DateTimePicker
                                testID="endDate"
                                value={endDate}
                                mode={'date'}
                                is24Hour={true}
                                onChange={onChangeEnd}
                                themeVariant='light'
                            />
                        </View>
                        {!allDay &&
                        <View style={modalTheme.rowStart}>
                            <IconSymbol size={20} name="clock" color='black'/>
                            <DateTimePicker
                                testID="endTime"
                                value={endDate}
                                mode={'time'}
                                is24Hour={true}
                                onChange={onChangeEnd}
                                themeVariant='light'
                            />
                        </View>
                        }
                    </View>
                )}
                </View>
                <ThemedText type="boldText">Location:</ThemedText>
                <ThemedTextInput onChangeText={setEventLocation} placeholder='Living Room'/>
                <ThemedSwitch onChangeSwitch={setNeedsApproval} label="Needs Roommates Approval?"/>
                <ThemedText type='text'>Notify all roommates to approve this event</ThemedText>
            </View>
            <></><></><></>
            </ScrollView>

        </Modal>
    </View>
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
function uuidv4(): string {
    throw new Error('Function not implemented.');
}

