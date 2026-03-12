import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, Switch } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Counter from './counter';
import { InventoryDetails } from '@/api/inventory';
import { IconSymbol } from './ui/icon-symbol';

type ModalProps = {
    item: InventoryDetails;
    //toggleRestock: () => void;
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;

}

export default function InvViewModal(props: ModalProps) {
    

    return (
        <View>

            <Modal
                animationType='slide'
                visible={props.visible}
                presentationStyle='formSheet'
                allowSwipeDismissal={true}
                onRequestClose={props.onClose}
            >

                <View>
                    <View style={{height: 20}}></View>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={props.onClose}>
                            <IconSymbol size={30} name="multiply" color="#000"/>
                        </TouchableOpacity>
                        <View style={{flexDirection: 'row', gap: 20}}>
                            <TouchableOpacity onPress={props.onDelete}>
                                <IconSymbol size={30} name="trash.fill" color="#000"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={props.onEdit}>
                                <IconSymbol size={30} name="pencil" color="#000"/>
                            </TouchableOpacity>
                        </View>
                    </View>


                <SafeAreaView style={styles.modalContent}>
                    <Text style={styles.title}>{props.item.name}</Text>
                    <Text style={styles.text}>{props.item.details}</Text>
                    <Text style={styles.subHeading}>Location: <Text style={styles.text}>{props.item.location}</Text></Text>
                    <Text style={styles.subHeading}>Last Purchased By: <Text style={styles.text}>{props.item.last_purchased_by[0].name}</Text></Text>
                    <Text style={styles.subHeading}>Purchase Date: <Text style={styles.text}>{props.item.last_purchased_date.toDateString()}</Text></Text>
                    <View>
                        <View style={{flexDirection: 'row', gap: 12}}>
                            <Text style={styles.subHeading}>Restock Needed?</Text>
                            <Switch 
                                trackColor={{false: 'red', true: 'green'}}
                                thumbColor={'white'}
                            />
                        </View>
                        <Text style={styles.subtitle}>Toggle when this item needs to be restocked</Text>
                    </View>
                    
                </SafeAreaView>

                </View>
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
        fontWeight: 700
    },

    subHeading: {
        fontSize: 24,
        fontWeight: 600
    },
    
    header: { 
        justifyContent: "space-between",
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12
    },

    text: {
        fontSize: 24,
        fontWeight: 400
    },

    subtitle: {
        fontSize: 18,
        fontWeight: 300
    }

});