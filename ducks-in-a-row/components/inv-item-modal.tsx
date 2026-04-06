import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker'
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';
import Counter from './counter';
import { InventoryDetails, InventoryCard } from '@/api/inventory';
import { ThemedTextInput } from './text-input';
import { ThemedText } from './themed-text';

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

    const [locations, setLocations] = useState([
        {label: 'Kitchen', value: 'Kitchen'},
        {label: 'Living Room', value: 'Living Room'},
        {label: 'Bedroom', value: 'Bedroom'},
        {label: 'Bathroom', value: 'Bathroom'},
        {label: 'Other', value: 'Other'}
    ])

    const [openDropdown, setOpenDropdown] = useState(false);

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
                                <ThemedText type="subtitle" style={styles.cancelText}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <ThemedText type='subtitle'>{props.title}</ThemedText>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleSave}>
                                <ThemedText type="subtitle" style={styles.cancelText}>Save</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Item name field */}
                        <SafeAreaView style={styles.modalContent}>
                            <View style={styles.formField}>
                                <ThemedText type="boldText">Item Name</ThemedText>
                                <ThemedTextInput 
                                    onChangeText={setItemName}
                                    defaultValue={itemName}
                                    placeholder='Item Name'
                                />
                            </View>

                            {/* Item details field */}
                            <View style={styles.formField}>
                                <ThemedText type="boldText">Details</ThemedText>
                                <ThemedTextInput
                                    onChangeText={setItemDetails}
                                    defaultValue={itemDetails}
                                    placeholder='Add Details'
                                    multiline
                                    size="large"
                                />
                            </View>
                        
                            {/* Item quantity field */}
                            <View style={styles.formField}>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"}}>
                                    <ThemedText type="boldText">Quantity</ThemedText>
                                    <Counter value={quantity} onChange={setQuantity} />
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <ThemedText type="boldText">Location</ThemedText>
                                <DropDownPicker 
                                    open={openDropdown}
                                    value={itemLocation}
                                    items={locations}
                                    setOpen={setOpenDropdown}
                                    setValue={setItemLocation}
                                    setItems={setLocations}
                                    style={styles.input}
                                    dropDownContainerStyle={styles.dropdownMenu}
                                    listMode='SCROLLVIEW'
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
        fontSize: 24,
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
        alignItems: 'center',
        padding: 12,
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
        fontSize: 16,
        fontWeight: 500
    },
    
    input: {
        borderWidth: 1,
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
        borderWidth: 1,
        padding: 5,
        borderColor: '#ABA4A461',
        backgroundColor: '#F6F4F4C4',
        borderRadius: 10,
        fontSize: 16,
        lineHeight: 24
    }
});