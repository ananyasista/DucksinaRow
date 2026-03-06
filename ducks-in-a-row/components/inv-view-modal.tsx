import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, Switch } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Counter from './counter';
import { InvItem } from '@/app/(tabs)/inventory';
import { IconSymbol } from './ui/icon-symbol';

type ModalProps = {
    item: InvItem;
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
                            <IconSymbol size={30} name="x.square" color="#000"/>
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
                    <Text style={styles.subHeading}>Location: {props.item.location}</Text>
                    <Text style={styles.subHeading}>Last Purchased By: {props.item.last_purchased_by}</Text>
                    <Text style={styles.subHeading}>Purchase Date: {props.item.last_purchased_date.toString()}</Text>
                    <View>
                        <View style={{flexDirection: 'row', gap: 12}}>
                            <Text style={styles.subHeading}>Restock Needed?</Text>
                            <Switch />
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
        fontWeight: 600
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
        fontSize: 24
    },

    subtitle: {
        fontSize: 18,
        fontWeight: 300
    }

});