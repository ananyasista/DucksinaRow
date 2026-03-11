import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Switch, Keyboard, TouchableWithoutFeedback } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';
import { ChoreItem } from '@/app/(tabs)/chores';
import Counter from './counter';
import { IconSymbol } from './ui/icon-symbol';

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    save?: () => void;
    item?: ChoreItem;
    
}

export default function ChoreItemModal(props: ModalProps) {
    const [choreName, setChoreName] = useState(props.item ? props.item.name : '');
    const [choreDetails, setChoreDetails] = useState(props.item ? props.item.details : '');
    const [choreLocation, setChoreLocation] = useState(props.item ? props.item.location : null);
    const [repeatDate, setRepeatDate] = useState(props.item ? props.item.repeat : null);
    const [repeatQuantity, setRepeatQuantity] = useState(1);
    const [allDay, setAllDay] = useState(props.item ? props.item.all_day : true);
    const [dueDate, setDueDate] = useState(props.item ? props.item.date : new Date())

    const [roommateOwnerList, setRoommateOwnerList] = useState<string[]>(props.item ? props.item.roommates : []);
    

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
                            props.item ? (
                                props.onClose()
                            ) : (
                                setChoreName(''),
                                setChoreDetails(''),
                                setChoreLocation(null),
                                setRepeatQuantity(1),
                                setRoommateOwnerList([]),
                                setRepeatDate(null),
                                setDate(new Date()),
                                props.onClose()
                            )
                            
                        }}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{props.title}</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={props.save}>
                        <Text style={styles.cancelText}>Save</Text>
                    </TouchableOpacity>
                </View>


                <SafeAreaView style={styles.modalContent}>
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Chore Name</Text>
                        <TextInput 
                            style={styles.input}
                            onChangeText={setChoreName}
                            value={choreName}
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
                            {roommateList.map((name => (
                                <Chip 
                                    title={name} 
                                    onPress={() => {
                                        setRoommateOwnerList(prev => {
                                            if(prev.includes(name)) {
                                                return prev.filter(item => item !== name);
                                            } else {
                                                return [...prev, name];
                                            }
                                        })                                }}
                                    selected = {roommateOwnerList.includes(name)}
                                
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