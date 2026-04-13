import {View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Counter from './counter';
import { IconSymbol } from './ui/icon-symbol';
import { Chore, ChoreAssignment, ChoreCreateInput, buildChorePatch } from '@/api/chores';
import { ThemedText } from './themed-text';
import { ThemedTextInput } from './text-input';
import { ThemedSwitch } from './themed-switch';

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    save: (data: {
        create?: ChoreCreateInput;
        chorePatch?: Partial<Chore>;
        choreAssignmentPatch?: Partial<ChoreAssignment>;
    }) => void;
    chore?: ChoreAssignment;
    allRoommates: Chore['roommates_involved']; 
}

export default function ChoreItemModal(props: ModalProps) {
    const [choreTitle, setChoreTitle] = useState(props.chore?.chore.title ?? '');
    const [choreDetails, setChoreDetails] = useState(props.chore?.chore.details ?? '');
    const [choreLocation, setChoreLocation] = useState(props.chore?.chore.location ?? null);
    const [repeatUnit, setRepeatUnit] = useState(props.chore?.chore.repeat_unit ?? 'weeks');
    const [repeatValue, setRepeatValue] = useState(props.chore?.chore.repeat_value ?? 1);
    const [choreRotate, setChoreRotate] = useState(props.chore?.chore.is_rotating ?? false);

    const [allDay, setAllDay] = useState(props.chore?.all_day ?? true);
    const [dueDate, setDueDate] = useState<Date>(props.chore?.due_date ? new Date(props.chore.due_date) : new Date());
        
    const [passToNextValue, setPassToNextValue] = useState(props.chore?.chore.pass_to_next_value ?? 1);
    const [passToNextUnit, setPassToNextUnit] = useState(props.chore?.chore.pass_to_next_unit ?? 'weeks');
    const [roommatesInvolved, setRoommatesInvolved] = useState<Chore['roommates_involved']>(props.chore?.chore.roommates_involved || []);
    

    const [repeatInt, setRepeatInt] = useState([
        {label: 'Days', value: 'days'},
        {label: "Weeks", value: 'weeks'},
        {label: "Months", value: 'months'}
    ])
    const locationList: string[] = ["Kitchen", "Living Room", "Bathroom", "Bedroom", "Other"]

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const [openRepeatDropdown, setOpenRepeatDropdown] = useState(false);
    const [openPassDropdown, setOpenPassDropdown] = useState(false);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate ? selectedDate : new Date();
        setDate(currentDate);
    };

    const showMode = (currentMode: any) => {
        setShow(true);
        setDate(new Date());
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date')
    };

    // By label
    const selectByLabel = (label: string) => {
        const found = repeatInt.find(item => item.label === label);
            if (found) setRepeatUnit(found.label);
    };

    const handleSave = () => {
        if (!props.chore) {
            const createdItem: ChoreCreateInput = {
                title: choreTitle,
                details: choreDetails,
                due_date: dueDate instanceof Date ? dueDate : new Date(dueDate),
                location: choreLocation,
                all_day: allDay,
                is_rotating: choreRotate, // or controlled by a switch
                roommates_involved: roommatesInvolved,
                repeat_value: repeatValue,
                repeat_unit: repeatUnit,
                pass_to_next_value: passToNextValue,
                pass_to_next_unit: passToNextUnit,
            };

            console.log("SENDING:", {
                ...createdItem,
                roommates_involved_ids: roommatesInvolved.map(r => r.id)
            })
            props.save({create: createdItem});
        } else {
            // SAVE FOR UPDATEs
            const { chorePatch, choreAssignmentPatch } = buildChorePatch(props.chore, {
                title: choreTitle,
                details: choreDetails,
                location: choreLocation,
                allDay,
                dueDate,
                completed: props.chore?.completed ?? false,
                repeatUnit,
                repeatValue,
                passToNextUnit,
                passToNextValue,
                isRotating: choreRotate,
                roommates: roommatesInvolved,
            });

            console.log("CHORE UPDATE: ",  chorePatch);
            console.log("CHORE ASSIGNMENT UPDATE: ", choreAssignmentPatch);
            
            props.save({
                chorePatch: chorePatch,
                choreAssignmentPatch: choreAssignmentPatch,
            });
        }   
        resetChore();
        props.onClose();
    };
    
    useEffect(() => {
        if (props.chore) {
            setChoreTitle(props.chore.chore.title);
            setChoreDetails(props.chore.chore.details);
            setChoreLocation(props.chore.chore.location);
            setDueDate(props.chore.due_date ?? new Date());
            setAllDay(props.chore.all_day ?? true);
            setRoommatesInvolved(props.chore.chore.roommates_involved);
            setRepeatValue(props.chore.chore.repeat_value);
            setRepeatUnit(props.chore.chore.repeat_unit);
            setPassToNextUnit(props.chore.chore.pass_to_next_unit ?? "None");
            setPassToNextValue(props.chore.chore.pass_to_next_value  ?? 0);
            setChoreRotate(props.chore.chore.is_rotating);
        }
    }, [props.chore]);

    const resetChore = () => {
        props.chore ? (
            props.onClose()
        ) : (
            setChoreTitle(''),
            setChoreDetails(''),
            setChoreLocation(null),
            setRoommatesInvolved([]),
            setRepeatUnit('Weeks'),
            setDate(new Date()),
            setChoreRotate(false),
            setDueDate(new Date()),
            setAllDay(true),
            setRepeatValue(1),
            setPassToNextUnit('Weeks'),
            setPassToNextValue(1),
            props.onClose()
        )

    };


    return (
        <View  style={{flex: 1, paddingBottom: 50}}>
            <Modal
                animationType='slide'
                visible={props.visible}
                presentationStyle='formSheet'
                allowSwipeDismissal={true}
                onRequestClose={props.onClose}
                style={{flex: 1}}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                >
                    <View style={{flex: 1}}>
                        <View style={{height: 20}}></View>
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.cancelButton} 
                                onPress={() => {
                                    resetChore();                                    
                                }}
                            >
                                <ThemedText type='default'>Cancel</ThemedText>
                            </TouchableOpacity>
                            <ThemedText type='subtitle'>{props.title}</ThemedText>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => {handleSave(); resetChore();}}>
                                <ThemedText type='default'>Save</ThemedText>
                            </TouchableOpacity>
                        </View>
                        {/* CHORE NAME FIELD */}                    
                        <SafeAreaView style={{ flex: 1 }}>
                            <ScrollView 
                                style={{ flex: 1 }}
                                contentContainerStyle={{
                                    padding: 20,
                                    gap: 20,
                                    width: '100%',
                                }}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View style={styles.formField}>
                                    <ThemedText type='boldText'>Chore Name</ThemedText>
                                    <ThemedTextInput 
                                        // style={styles.input}
                                        onChangeText={setChoreTitle}
                                        defaultValue={choreTitle}
                                        placeholder='Chore Name'
                                        // placeholderTextColor='#ABA4A461'
                                    />
                                </View>

                                {/* CHORE DETAIL FIELD */}
                                <View style={styles.formField}>
                                    <ThemedText type='boldText'>Details</ThemedText>
                                    <ThemedTextInput 
                                        // style={styles.input}
                                        onChangeText={setChoreDetails}
                                        defaultValue={choreDetails}
                                        placeholder='Add Details'
                                        // placeholderTextColor='#ABA4A461'
                                        multiline
                                        size="large"
                                    />
                                </View>

                                {/* CHORE ALL DAY SWITCH */}
                                <View style={styles.formField}>
                                    <ThemedSwitch
                                        label="All Day"
                                        onChangeSwitch={() => setAllDay(!allDay)} 
                                        value={allDay}
                                    />
                                    <View style={{flexDirection: 'row'}}>
                                        <IconSymbol name='calendar' size={30} color="#000"/>
                                        {allDay ? (
                                        <DateTimePicker
                                                testID="dateTimePicker"
                                                value={dueDate}
                                                is24Hour={true}
                                                mode={'date'}
                                                display = 'default'
                                                themeVariant='light'
                                                onChange={(event, selectedDate) => {
                                                    if (selectedDate) setDueDate(selectedDate);
                                                }}
                                            /> 
                                        ) : (
                                            <DateTimePicker
                                                testID="dateTimePicker"
                                                value={dueDate}
                                                is24Hour={true}
                                                mode={'datetime'}
                                                display = 'default'
                                                themeVariant='light'
                                                onChange={(event, selectedDate) => {
                                                    if (selectedDate) setDueDate(selectedDate);
                                                }}
                                                minuteInterval={5}
                                            />
                                        )}
                                        
                                    </View>
                                </View>

                                {/* CHORE LOCATION */}
                                <View style={styles.formField}>
                                    <ThemedText type='boldText'>Location</ThemedText>
                                    <View style={styles.chipView}>
                                        {locationList.map((name => (
                                            <Chip
                                                key={name}
                                                title = {name}
                                                onPress = {() => setChoreLocation(name)}
                                                selected = {choreLocation === name} 
                                            />
                                        )))}
                
                                    </View>
                                </View>

                                {/* CHORE REPEAT TIME */}
                                <View style={styles.formField}>
                                    <ThemedText type='boldText'>Repeat chore after?</ThemedText>
                                    <View style={{flexDirection: 'row', gap: 20, flexGrow: 1}}>
                                        <Counter value={repeatValue} onChange={setRepeatValue} />
                                        <View style={{ flex: 1, width: '100%', zIndex: 1000 }}>
                                            <DropDownPicker
                                                open={openRepeatDropdown}
                                                value={repeatUnit}
                                                items={repeatInt}
                                                setOpen={setOpenRepeatDropdown}
                                                setValue={setRepeatUnit}
                                                setItems={setRepeatInt}
                                                style={styles.input}
                                                dropDownContainerStyle={styles.dropdownMenu}
                                                listMode='SCROLLVIEW'
                                            />
                                        </View>    
                                    </View>
                                </View>

                                {/* CHORE ROTATION SWITCH */}
                                <View style={styles.formField}>
                                        <ThemedSwitch
                                            label='Rotate Chore?'
                                            value={choreRotate}
                                            onChangeSwitch={() => setChoreRotate(!choreRotate)}
                                        />
                                </View>

                                {choreRotate && ( <>
                                {/* CHORE ROOMMATES */}
                                <View style={styles.formField}>
                                    <ThemedText type='boldText'>Roommates Involved</ThemedText>
                                    <View style={styles.chipView}>
                                        {props.allRoommates.map((user => (
                                            <Chip 
                                                key={user.id}
                                                title={user.first_name}
                                                selected={roommatesInvolved.some(r => r.id === user.id)}
                                                onPress={() => {
                                                    setRoommatesInvolved(prev => {
                                                    if (prev.some(r => r.id === user.id)) {
                                                        return prev.filter(r => r.id !== user.id);
                                                    } else {
                                                        return [...prev, user];
                                                    }
                                                    });
                                                }}
                                            />
                                        )))}
                                    </View>
                                </View>

                                {/* CHORE PASS TIME */}
                                <View style={styles.formField}>
                                    <ThemedText type='boldText'>Pass chore to the next roommate after?</ThemedText>
                                    <View style={{flexDirection: 'row', gap: 20, flexGrow: 1}}>
                                        <Counter value={passToNextValue} onChange={setPassToNextValue} />
                                        <View style={{ flex: 1, width: '100%', zIndex: 999 }}>
                                            <DropDownPicker 
                                                open={openPassDropdown}
                                                value={passToNextUnit}
                                                items={repeatInt}
                                                setOpen={setOpenPassDropdown}
                                                setValue={setPassToNextUnit}
                                                setItems={setRepeatInt}
                                                style={styles.input}
                                                dropDownContainerStyle={styles.dropdownMenu}
                                                listMode='SCROLLVIEW'

                                            />
                                        </View>
                                    </View>
                                </View>
                                </>)}   
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
        
    )
}

const styles = StyleSheet.create({
    modalContent: {
        margin: 20,
        gap: 20,
        overflow: 'visible',
        flex: 1
    },

    title: {
        fontSize: 48,
        fontWeight: 600
    },

    subHeading: {
        fontSize: 24,
        fontWeight: 600
    },

    chipView: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 10,
        paddingBottom: 10,
        flexWrap: 'wrap',
        width: '100%',
    },
    
    header: {
        justifyContent: "space-between",
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12
    },

    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding:7,
        width: 100,
        height: 50,
    },

    cancelText: {
        fontSize: 20
    },
    
    input: {
        borderWidth: 2,
        padding: 5,
        borderColor: '#ABA4A461',
        backgroundColor: '#F6F4F4C4',
        borderRadius: 13,
        fontSize: 16
    },

    formField: {
        gap: 5,
        width: '100%',
    },

    picker: {
        borderRadius: 13,
        fontSize: 16,
        color: '#000000',
        backgroundColor: '#000000',
        flex: 1
    },

    pickerItem: {
        backgroundColor: 'cyan',
        color: 'pink'
    },

    chipRow: {
        flexDirection: 'row',
        gap: 20
    },

    dropdownMenu: {
        borderWidth: 2,
        padding: 5,
        borderColor: '#ABA4A461',
        backgroundColor: '#F6F4F4',
        borderRadius: 13,
        fontSize: 16,
        zIndex: 2000,
        elevation: 2000
    }
});