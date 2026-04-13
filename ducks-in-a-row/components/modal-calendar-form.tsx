import { Calendar, ICalendarEventBase, Mode, todayInMinutes } from 'react-native-big-calendar'
import { StyleSheet, Dimensions, TouchableOpacity, Modal, Platform, ScrollView, KeyboardAvoidingView} from 'react-native';
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
import {CalendarEvent as APICalendarEvent, createEvent, updateEvent, CalendarEventCreateInput} from '@/api/calendar';
import { useFocusEffect } from 'expo-router';

type ModalProps = PropsWithChildren<{
    formTitle:string;
    edit?: boolean;
    event: APICalendarEvent | null;
    onClose:() => Promise<void>;
    updateEvents: ()=>Promise<void>;
}>;

export default function ModalCalendarForm({edit = false,event = null, ...props}: ModalProps) {
    const [addVisible, setAddVisible] = useState(edit);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [mode, setMode] = useState(undefined);
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [eventTitleError, setEventTitleError] = useState(false);
    const [startDateError, setStartDateError] = useState(false);
    const [endDateBeforeStartError, setEndDateBeforeStartError] = useState(false);
    const [endDateTooCloseError, setEndDateTooCloseError] = useState(false);
    const [endAllDayError, setEndAllDayError] = useState(false);
    const [endDateError, setEndDateError] = useState(false);
    const [eventTitle, setEventTitle] = useState(event?.title);
    const [eventDescription, setEventDescription] = useState(event?.details);
    const [eventLocation, setEventLocation] = useState(event?.location);
    const [allDay, setAllDay] = useState(event?.all_day ?? false);
    const [needsApproval, setNeedsApproval] = useState(event?.requires_approval ?? false);
    const [showRoommateSwitch] = useState(event === null);
    
    const onChangeStart = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const newStart = selectedDate ?? new Date(todayInMinutes());

        setStartDate(newStart);

        const newEnd = new Date(newStart);
        newEnd.setHours(newEnd.getHours() + 1);
        setEndDate(newEnd);
    };
    const onChangeEnd = (event:DateTimePickerEvent, selectedDate?:Date) => {
      const currentDate = selectedDate ? selectedDate : new Date(todayInMinutes()+ 3600);
      setEndDate(currentDate);
    }
    
    const showMode = (currentMode: any) => {
        setShowStart(true);

        let start = new Date();
        let end = new Date(start);

        if (event?.start_date) {
            start = new Date(event.start_date);
        }

        if (event?.end_date) {
            end = new Date(event.end_date);
        } else {
            end.setHours(start.getHours() + 1);
        }

        setStartDate(start);
        setEndDate(end);

        setShowEnd(true);
        setMode(currentMode);
        };

    const close = async () => {
        setAddVisible(false);
        await props.updateEvents();
        props.onClose();
    }

    const save = async () => {
        console.log("Trying to save..."); //REMOVE REMOVE
        console.log("Saving calendar event payload:", {
            title: eventTitle ?? "",
            requires_approval: needsApproval,
            all_day: allDay,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            });
        var errors = setErrors();
        if(!errors)
        {
            return false; //Errors -> not ready to save;
        }
        try {
            console.log("Saving... needs approval: " + needsApproval);
            const cal: CalendarEventCreateInput = {
                title: eventTitle ?? "",
                details: eventDescription,
                location: eventLocation,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                all_day: allDay,
                repeat: "none",
                requires_approval: needsApproval ? true: false,
            }
            if(event)
            {
                await updateEvent(event.id, cal);
                console.log("Successful update event");

            } else {
                await createEvent(cal);
                console.log("Succesful create event");
                console.log("CALENDAR EVENT MADE:", cal.requires_approval);
            }
            if(props.updateEvents)
            {
                await props.updateEvents();
            }
        } catch (e:any) {
            console.log("Error saving event modal: " + e);
        }
        close();
    }
    
    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };
    
    function setErrors() {
        let error = false;

        setEventTitleError(false);
        setEndDateBeforeStartError(false);
        setEndDateTooCloseError(false);
        setEndAllDayError(false);

        if (!eventTitle || eventTitle.trim() === "") {
            setEventTitleError(true);
            error = true;
        }

        if (startDate >= endDate) {
            setEndDateBeforeStartError(true);
            error = true;
        }

        const diffMs = endDate.getTime() - startDate.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        if (!allDay && diffMinutes < 29) {
            setEndDateTooCloseError(true);
            error = true;
        }
        if(allDay && startDate.getUTCDate() === endDate.getUTCDate())
        {
            setEndAllDayError(true);
            error = true;
        }
        return !error;
    }

    function open() {
        setEventTitleError(false);
        setStartDateError(false);
        setEndDateError(false);
        setEndDateBeforeStartError(false);

        setEventTitle("");
        setEventDescription("");
        setEventLocation("");
        setAllDay(false);
        setNeedsApproval(false);

        const now = new Date();
        const end = new Date(now);
        end.setHours(end.getHours() + 1);

        setStartDate(now);
        setEndDate(end);

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
                                    <View style={{height: 20}}></View>

            <View style={modalTheme.header}>
                <TouchableOpacity style={modalTheme.cancelSaveButton} onPress={() => close()}>
                    <ThemedText style={modalTheme.cancelSaveText}>Cancel</ThemedText>
                </TouchableOpacity>
                <ThemedText type='title' style={modalTheme.headerText}>{props.formTitle}</ThemedText>
                <TouchableOpacity style={modalTheme.cancelSaveButton} onPress={() => save()}>
                    <ThemedText style={modalTheme.cancelSaveText}>Save</ThemedText>
                </TouchableOpacity>
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={80}
            >

            <ScrollView >
                
            <View style= {{flex: 1, padding: 16}}>
                {eventTitleError && (<ThemedText type='errorText'>Event title is required</ThemedText>)}
                <ThemedText type="boldText" >Event Title:</ThemedText>
                <ThemedTextInput onChangeText={setEventTitle}placeholder="Item Name" defaultValue={event?.title}/>
                <ThemedText type="boldText">Description:</ThemedText>
                <ThemedTextInput onChangeText={setEventDescription} size="large" multiline={true} placeholder="Add Details" defaultValue={event?.details}/>
                <ThemedSwitch onChangeSwitch={setAllDay} label="All-Day" value={event?.all_day ?? false} />
                
                <View onLayout={showDatepicker}>
                {startDateError && (<ThemedText type='errorText'>Start date is required</ThemedText>)}
                {endDateBeforeStartError && (<ThemedText type='errorText'>End date must be AFTER start date</ThemedText>)}
                {endDateTooCloseError && (
                    <ThemedText type='errorText'>
                        End time must be at least 30 minutes after start time
                    </ThemedText>
                )}
                {endAllDayError && (
                    <ThemedText type='errorText'>
                        End date must be at least next day
                    </ThemedText>
                )}

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
                <View>
                    <ThemedSwitch onChangeSwitch={setNeedsApproval} label="Needs Roommates Approval?" value={needsApproval} editable = {showRoommateSwitch}/>
                    <ThemedText type='text'>Field not editable once event is created</ThemedText>
                </View>
                
            </View>
            <></><></><></>
            </ScrollView>
                        </KeyboardAvoidingView>

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
        backgroundColor: '#79997E',
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        right: 30,
    },
    cancelSaveButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 50
    },
    cancelSaveText: {
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

