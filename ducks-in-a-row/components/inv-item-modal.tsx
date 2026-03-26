import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';
import Counter from './counter';
import { InventoryDetails, InventoryCard } from '@/api/inventory';

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    save: (item: Partial<InventoryCard>) => void;
    item?: InventoryDetails;
    
}

export default function InvItemModal(props: ModalProps) {
    const [itemName, setItemName] = useState(props.item ? props.item.name : '');
    const [itemDetails, setItemDetails] = useState(props.item ? props.item.details : '');
    const [itemLocation, setItemLocation] = useState(props.item ? props.item.location : null);
    const [quantity, setQuantity] = useState(props.item ? props.item.quantity : 1);

    const roommateList: string[] = ["Elle", "Leyna", "Sofia", "Ananya"];
    const [locations, setLocations] = useState([
        {label: 'Kitchen', value: 'kitchen'},
        {label: 'Living Room', value: 'living room'},
        {label: 'Bedroom', value: 'bedroom'},
        {label: 'Bathroom', value: 'bathroom'},
        {label: 'Other', value: 'other'}
    ])

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

    const handleSave = () => {
    const updatedItem: Partial<InventoryCard> = {
            id: props.item?.id,
            name: itemName,
            details: itemDetails,
            location: itemLocation,
            quantity: quantity,
        };

        props.save(updatedItem);
        props.onClose();
    };

    useEffect(() => {
    if (props.item) {
        setItemName(props.item.name);
        setItemDetails(props.item.details);
        setItemLocation(props.item.location);
        setQuantity(props.item.quantity);
    }
    }, [props.item]);




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
                            setItemName('')
                            setItemDetails('')
                            setItemLocation(null)
                            setQuantity(1)
                            props.onClose()
                        }}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{props.title}</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleSave}>
                        <Text style={styles.cancelText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Item name field */}
                <SafeAreaView style={styles.modalContent}>
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Item Name</Text>
                        <TextInput 
                            style={styles.input}
                            onChangeText={setItemName}
                            value={itemName}
                            placeholder='Item Name'
                            placeholderTextColor='#ABA4A461'
                        />
                    </View>

                    {/* Item details field */}
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Details</Text>
                        <TextInput 
                            style={styles.input}
                            onChangeText={setItemDetails}
                            value={itemDetails}
                            placeholder='Add Details'
                            placeholderTextColor='#ABA4A461'
                            multiline
                        />
                    </View>
                
                    {/* Item quantity field */}
                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Quantity</Text>
                        <Counter value={quantity} onChange={setQuantity} />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.subHeading}>Location</Text>
                        <DropDownPicker 
                            open={openDropdown}
                            value={itemLocation}
                            items={locations}
                            setOpen={setOpenDropdown}
                            setValue={setItemLocation}
                            setItems={setLocations}
                            style={styles.input}
                            dropDownContainerStyle={styles.dropdownMenu}
                        />
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