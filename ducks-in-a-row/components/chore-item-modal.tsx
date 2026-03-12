import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Switch, Keyboard, TouchableWithoutFeedback } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';
import { ChoreItem } from '@/app/(tabs)/chores';
import Counter from './counter';
import { IconSymbol } from './ui/icon-symbol';
import { ChoreDetail, ChoreCard } from '@/api/chores';

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    save: (chore: Partial<ChoreDetail>) => void;
    chore?: ChoreDetail;
    allRoommates: ChoreDetail['roommates_involved']; 
}

export default function ChoreItemModal(props: ModalProps) {
    const [choreTitle, setChoreTitle] = useState(props.chore ? props.chore.title : '');
    const [choreDetails, setChoreDetails] = useState(props.chore ? props.chore.details : '');
    const [choreLocation, setChoreLocation] = useState(props.chore ? props.chore.location : null);
    const [repeatUnit, setRepeatUnit] = useState(props.chore ? props.chore.repeat_unit : undefined);
    const [repeatDate, setRepeatDate] = useState(props.chore ? props.chore.repeat_unit : 1);

    const [repeatQuantity, setRepeatQuantity] = useState(props.chore ? props.chore.repeat_value : 1);
    const [allDay, setAllDay] = useState(props.chore ? props.chore.all_day : true);
    const [dueDate, setDueDate] = useState(props.chore ? props.chore.due_date : new Date());
    
    const [assignee, setAssignee] = useState(props.chore ? props.chore.assignee : null);
    
    const [passToNextValue, setPassToNextValue] = useState(props.chore ? props.chore.pass_to_next_value : 1);
    const [passToNextUnit, setPassToNextUnit] = useState(props.chore ? props.chore.pass_to_next_unit : 'Weeks');
    const [roommatesInvolved, setRoommatesInvolved] = useState<ChoreDetail['roommates_involved']>(props.chore?.roommates_involved || []);
    
    const [nextAssignee, setNextAssignee] = useState<ChoreDetail['next_assignee'] | null>(
        props.chore ? props.chore.next_assignee : null
    );


    // const [roommateOwnerList, setRoommateOwnerList] = useState<string[]>(props.chore ? props.chore.roommates : []);
    

    const roommateList: string[] = ["Elle", "Leyna", "Sofia", "Ananya"];
    const [repeatInt, setRepeatInt] = useState([
        {label: 'Days', value: 'daily'},
        {label: "Weeks", value: 'weekly'},
        {label: "Months", value: "monthly"}
    ])
    const locationList: string[] = ["Kitchen", "Living Room", "Bathroom"]

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const [openDropdown, setOpenDropdown] = useState(false);

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
        const updatedItem: Partial<ChoreDetail> = {
                id: props.chore?.id,
                title: choreTitle,
                details: choreDetails,
                due_date: dueDate,
                location: choreLocation,
                all_day: allDay,
                is_rotation: false, // or controlled by a switch
                roommates_involved: roommatesInvolved,
                repeat_value: repeatQuantity,
                repeat_unit: repeatUnit,
                pass_to_next_value: passToNextValue,
                pass_to_next_unit: passToNextUnit,
            };
            
            console.log(repeatDate);
            // console.log(repeatInt[repeatDate]);
            props.save(updatedItem);
            props.onClose();
        };
    
        useEffect(() => {
            if (props.chore) {
                setChoreTitle(props.chore.title);
                setChoreDetails(props.chore.details);
                setChoreLocation(props.chore.location);
                setDueDate(props.chore.due_date);
                setAllDay(props.chore.all_day);
                setAssignee(props.chore.assignee);
                setRoommatesInvolved(props.chore.roommates_involved);
                setRepeatQuantity(props.chore.repeat_value);
                setRepeatUnit(props.chore.repeat_unit);
            }
        }, [props.chore]);


    return (
        <View>

            <Modal
                animationType='slide'
                visible={props.visible}
                presentationStyle='formSheet'
                allowSwipeDismissal={true}
                onRequestClose={props.onClose}
            >
            <TouchableWithoutFeedback onPress={() => {setOpenDropdown(false);}}>
                <View>
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
                                setRepeatQuantity(1),
                                setRoommatesInvolved([]),
                                setRepeatUnit(undefined),
                                setDate(new Date()),
                                props.onClose()
                            )
                            
                        }}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{props.title}</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleSave}>
                        <Text style={styles.cancelText}>Save</Text>
                    </TouchableOpacity>
                </View>


                <SafeAreaView style={styles.modalContent}>
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
                                    onChange={() => setDueDate}
                                /> 
                            ) : (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={dueDate}
                                    is24Hour={true}
                                    mode={'datetime'}
                                    display = 'default'
                                    themeVariant='light'
                                    onChange={() => setDueDate}
                                />
                            )}
                            
                        </View>
                    </View>

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


                    
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Pass chore to the next roommate after?</Text>
                        <View style={{flexDirection: 'row', gap: 20}}>
                            <Counter value={repeatQuantity} onChange={setRepeatQuantity} />
                            <View style={{flex: 1}}>
                                <DropDownPicker 
                                    open={openDropdown}
                                    value={repeatDate}
                                    items={repeatInt}
                                    setOpen={setOpenDropdown}
                                    setValue={setRepeatDate}
                                    setItems={setRepeatInt}
                                    style={styles.input}
                                    dropDownContainerStyle={styles.dropdownMenu}
                                />
                            </View>
                            
                        </View>
                        
                    </View>

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
        gap: 20
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
        fontSize: 16
    }
});