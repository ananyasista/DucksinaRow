import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Switch, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';
import Counter from './counter';
import { IconSymbol } from './ui/icon-symbol';
import { Chore, ChoreCreateInput, buildChorePatch } from '@/api/chores';
import CircularCheckbox from './circle-checkbox';
import { ThemedText } from './themed-text';

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    save: (chore: Partial<Chore>) => void;
    chore?: Chore;
    allRoommates: Chore['roommates_involved']; 
}

export default function ChoreItemModal(props: ModalProps) {
    const [choreTitle, setChoreTitle] = useState(props.chore?.title ?? '');
    const [choreDetails, setChoreDetails] = useState(props.chore?.details ?? '');
    const [choreLocation, setChoreLocation] = useState(props.chore?.location ?? null);
    const [repeatUnit, setRepeatUnit] = useState(props.chore?.repeat_unit ?? 'weeks');
    const [repeatValue, setRepeatValue] = useState(props.chore?.repeat_value ?? 1);
    const [choreRotate, setChoreRotate] = useState(props.chore?.is_rotating ?? false);

    const [allDay, setAllDay] = useState(props.chore?.latest_assignment.all_day ?? true);
    const [dueDate, setDueDate] = useState<Date>(props.chore?.latest_assignment.due_date ? new Date(props.chore.latest_assignment.due_date) : new Date());
    
    // const [assignee, setAssignee] = useState<UserSummary>(props.chore?.current_assignment ? props.chore?.current_assignment?.assignee : null);
    
    const [passToNextValue, setPassToNextValue] = useState(props.chore?.pass_to_next_value ?? 1);
    const [passToNextUnit, setPassToNextUnit] = useState(props.chore?.pass_to_next_unit ?? 'weeks');
    const [roommatesInvolved, setRoommatesInvolved] = useState<Chore['roommates_involved']>(props.chore?.roommates_involved || []);
    
    // const [nextAssignee, setNextAssignee] = useState<Chore['latest_assignment'] | null>(props.chore?.next_assignee ?? null);

    // const [roommateOwnerList, setRoommateOwnerList] = useState<string[]>(props.chore ? props.chore.roommates : []);
    

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
        console.log("Trying to reach here");

        if (!props.chore) {
            const createdItem: ChoreCreateInput = {
                title: choreTitle,
                details: choreDetails,
                due_date: dueDate instanceof Date ? dueDate : new Date(dueDate),
                location: choreLocation,
                all_day: allDay,
                is_rotating: false, // or controlled by a switch
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
            props.save(createdItem);
        } else {
            const updatedItem = buildChorePatch(props.chore, {
                    title: choreTitle,
                    details: choreDetails,
                    location: choreLocation,
                    allDay,
                    dueDate,
                    completed: props.chore?.latest_assignment.completed ?? false,
                    repeatUnit,
                    repeatValue,
                    passToNextUnit,
                    passToNextValue,
                    isRotating: choreRotate,
                    roommates: roommatesInvolved,
                });
                console.log("SENDING:", {
                    ...updatedItem,
                    roommates_involved_ids: roommatesInvolved.map(r => r.id)
                })
                props.save(updatedItem);
        }
            
            // console.log(repeatDate);
            // console.log(repeatInt[repeatDate]);
            
            props.onClose();
        };
    
        useEffect(() => {
            if (props.chore) {
                setChoreTitle(props.chore.title);
                setChoreDetails(props.chore.details);
                setChoreLocation(props.chore.location);
                setDueDate(props.chore.latest_assignment.due_date ?? new Date());
                setAllDay(props.chore.latest_assignment.all_day ?? true);
                setRoommatesInvolved(props.chore.roommates_involved);
                setRepeatValue(props.chore.repeat_value);
                setRepeatUnit(props.chore.repeat_unit);
                setPassToNextUnit(props.chore.pass_to_next_unit ?? "None");
                setPassToNextValue(props.chore.pass_to_next_value  ?? 0);
                setChoreRotate(props.chore.is_rotating);
            }
        }, [props.chore]);


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
            <TouchableWithoutFeedback onPress={() => {setOpenPassDropdown(false); setOpenRepeatDropdown(false);}}  style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <View style={{height: 20}}></View>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.cancelButton} 
                        onPress={() => {
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
                            
                        }}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{props.title}</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => handleSave()}>
                        <Text style={styles.cancelText}>Save</Text>
                    </TouchableOpacity>
                </View>


                {/* CHORE NAME FIELD */}                    
                <SafeAreaView  style={{flex: 1}}>
                    <ScrollView 
                        contentContainerStyle={{padding: 20, gap: 20, flexGrow: 1, flex: 1}}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.formField}>
                        <Text style={styles.subHeading}>Chore Name</Text>
                        <TextInput 
                            style={styles.input}
                            onChangeText={setChoreTitle}
                            value={choreTitle}
                            placeholder='Chore Name'
                            placeholderTextColor='#ABA4A461'
                        />
                    </View>

                    {/* CHORE DETAIL FIELD */}
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Details</Text>
                        <TextInput 
                            style={styles.input}
                            onChangeText={setChoreDetails}
                            value={choreDetails}
                            placeholder='Add Details'
                            placeholderTextColor='#ABA4A461'
                            multiline
                        />
                    </View>

                    {/* CHORE ALL DAY SWITCH */}
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>
                            All Day
                            <Switch 
                                style={{marginLeft: 20, alignContent: 'center'}}
                                value={allDay}
                                onValueChange={setAllDay}
                            />
                        </Text>
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
                                />
                            )}
                            
                        </View>
                    </View>

                    {/* CHORE LOCATION */}
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Location</Text>
                        <View style={styles.chipView}>
                            {locationList.map((name => (
                                <Chip
                                    title = {name}
                                    onPress = {() => setChoreLocation(name)}
                                    selected = {choreLocation === name} 
                                />
                            )))}
    
                        </View>
                    </View>

                    {/* CHORE REPEAT TIME */}
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Repeat chore after?</Text>
                        <View style={{flexDirection: 'row', gap: 20, flexGrow: 1}}>
                            <Counter value={repeatValue} onChange={setRepeatValue} />
                            <View style={{flex: 1}}>
                                <DropDownPicker
                                    open={openRepeatDropdown}
                                    value={repeatUnit}
                                    items={repeatInt}
                                    setOpen={setOpenRepeatDropdown}
                                    setValue={setRepeatUnit}
                                    setItems={setRepeatInt}
                                    style={styles.input}
                                    dropDownContainerStyle={styles.dropdownMenu}
                                />
                            </View>
                            
                        </View>
                        
                    </View>

                    {/* CHORE ROTATION SWITCH */}
                    <View style={styles.formField}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.subHeading}>Rotate Chore?</Text>
                            <CircularCheckbox checked={choreRotate} onToggle={() => setChoreRotate(!choreRotate)}/>
                        </View>

                    </View>

                    {choreRotate && ( <>
                    {/* CHORE ROOMMATES */}
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Roommates Involved</Text>
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
                        <Text style={styles.subHeading}>Pass chore to the next roommate after?</Text>
                        <View style={{flexDirection: 'row', gap: 20, flexGrow: 1}}>
                            <Counter value={passToNextValue} onChange={setPassToNextValue} />
                            <View style={{flex: 1}}>
                                <DropDownPicker 
                                    open={openPassDropdown}
                                    value={passToNextUnit}
                                    items={repeatInt}
                                    setOpen={setOpenPassDropdown}
                                    setValue={setPassToNextUnit}
                                    setItems={setRepeatInt}
                                    style={styles.input}
                                    dropDownContainerStyle={styles.dropdownMenu}

                                />
                            </View>
                            
                        </View>
                        
                    </View>
                    </>)}   
                    </ScrollView>
                    


                </SafeAreaView>

                </View>
                
            </TouchableWithoutFeedback>
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
        paddingBottom: 10
    },
    
    header: {
        justifyContent: "space-between",
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12
    },

    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 20,
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding:7
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
        gap: 5
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