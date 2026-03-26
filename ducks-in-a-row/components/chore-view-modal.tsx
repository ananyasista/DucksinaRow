import {View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, Switch } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { IconSymbol } from './ui/icon-symbol';
import { ChoreDetail } from '@/api/chores';

type ModalProps = {
    chore: ChoreDetail;
    //toggleRestock: () => void;
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;

}

export default function ChoreViewModal(props: ModalProps) {
    

    return (
            <Modal
                animationType='slide'
                visible={props.visible}
                presentationStyle='formSheet'
                allowSwipeDismissal={true}
                onRequestClose={props.onClose}
            >

                <View style={{flex: 1}}>
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
                    <View style={{gap: 10}}>
                        <Text style={styles.title}>{props.chore.title}</Text>
                        <Text style={styles.text}>{props.chore.details}</Text>
                        <Text style={styles.subHeading}>Current Assignee: <Text style={styles.text}>{props.chore.current_assignment?.assignee.first_name}</Text></Text>
                        <View style={{flexDirection: 'row'}}>
                            <IconSymbol name='calendar' size={30} color="#000"/>
                            <Text style={styles.subHeading}>Chore Due: <Text style={styles.text}>{props.chore.due_date.toLocaleDateString()}</Text></Text>
                        </View>
                        {props.chore.is_rotating && (
                            <>
                        
                        <Text style={styles.subHeading}>Pass chore to next roommate: <Text style={styles.text}>{props.chore.pass_to_next_value} {props.chore.pass_to_next_unit}</Text></Text>
                        <Text style={styles.subHeading}>Next Up: <Text style={styles.text}>{props.chore.current_assignment?.next_assignee?.first_name ?? ""}</Text></Text>
                        <View>
                            <Text style={styles.subHeading}>Roomates Involved:</Text>
                            <View style={styles.chipView}>
                            {props.chore.roommates_involved.map((r) =>
                                    <Chip 
                                        key={r.id}
                                        title={r.first_name}
                                    />
                                )} 
                            </View>
                            
                        </View>
                            </>
                        )}
                        
                        <Text style={styles.subHeading}>Location: <Text style={styles.text}>{props.chore.location}</Text></Text>
                        
                    </View>
                    
                    <TouchableOpacity style={styles.completeButton} onPress={() => props.onClose()}>
                        <Text style={styles.subHeading}>Mark as Complete</Text>
                    </TouchableOpacity>
                     
                </SafeAreaView>

                </View>
            </Modal>
        
    )
}

const styles = StyleSheet.create({
    modalContent: {
        margin: 20,
        gap: 20,
        flex: 1,
        justifyContent: 'space-between'
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
    },

    chipView: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 10,
        paddingBottom: 10
    },

    completeButton: {
        borderWidth: 2,
        padding: 5,
        borderColor: '#ABA4A461',
        backgroundColor: '#F6F4F4C4',
        borderRadius: 13,
        fontSize: 16,
        justifyContent: 'center',
        alignItems: 'center'
    }

});