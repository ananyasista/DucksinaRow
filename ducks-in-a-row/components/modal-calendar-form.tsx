import { Calendar, ICalendarEventBase, Mode } from 'react-native-big-calendar'
import { StyleSheet, Dimensions, TouchableOpacity, Modal, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
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

type ModalProps = PropsWithChildren<{
    formTitle:string;
    edit?: boolean;
    event?: CalendarEvent | null;
    onClose?: any;
}>;

export interface CalendarEvent extends ICalendarEventBase {
  description: string;
  needsApproval:any;
}
export default function ModalCalendarForm({edit = false, onClose, ...props}: ModalProps) {
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

    const onChangeStart = (event:DateTimePickerEvent, selectedDate?:Date) => {
      const currentDate = selectedDate ? selectedDate : new Date();
      setStartDate(currentDate);
    };
    const onChangeEnd = (event:DateTimePickerEvent, selectedDate?:Date) => {
      const currentDate = selectedDate ? selectedDate : new Date();
      setEndDate(currentDate);
    }
    
    const showMode = (currentMode: any) => {
      setShowStart(true);
      setStartDate(props.event?.start ?? new Date());
      setShowEnd(true);
      setEndDate(props.event?.end ?? new Date(startDate.getTime() + 3600*1000));
      setMode(currentMode);
      endDate.setHours(endDate.getHours()+1);
    };
    
    const close = () => {
        var errors = checkErrors();
        if(!errors){return;}
        setAddVisible(false);
        onClose();
    }
    
    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };
    
    function checkErrors() {
        if(startDate > endDate)
        {
            setEndDateBeforeStartError(true);
            return false;
        }
        return true;
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
                <TouchableOpacity style={modalTheme.saveButton} onPress={() => close()}>
                    <Text style={modalTheme.saveText}>Save</Text>
                </TouchableOpacity>
            </View>
            <View style= {{flex: 1, padding: 16}}>
                {eventTitleError && (<ThemedText type='errorText'>Event title is required</ThemedText>)}
                <ThemedText type="boldText" >Event Title:</ThemedText>
                <ThemedTextInput placeholder="Item Name" defaultValue={props.event?.title}/>
                <ThemedText type="boldText">Description:</ThemedText>
                <ThemedTextInput size="large" multiline={true} placeholder="Add Details" defaultValue={props.event?.description}/>
                <ThemedSwitch label="All-Day" />
                
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
                    </View>
                )}
                </View>
                <ThemedText type="boldText">Location:</ThemedText>
                <ThemedTextInput placeholder='Living Room'/>
                <ThemedSwitch label="Needs Roommates Approval?"/>
                <ThemedText type='text'>Notify all roommates to approve this event</ThemedText>
            </View>
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
