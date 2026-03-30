import {View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { IconSymbol } from './ui/icon-symbol';
import { ChoreAssignment } from '@/api/chores';
import { ThemedText } from './themed-text';

type ModalProps = {
    chore: ChoreAssignment;
    onComplete: (completed: boolean) => void;
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;

}

export default function ChoreViewModal(props: ModalProps) {

    const [complete, setComplete] = useState(props.chore.completed ?? false);

    const handleComplete = () => {
        const newValue = !complete;
        setComplete(newValue);

        props.onComplete(newValue);
        props.onClose();
    }

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
                            <ThemedText type="title">{props.chore.chore.title}</ThemedText>
                            <ThemedText type="secondarySubtitle">{props.chore.chore.details}</ThemedText>
                            <View style={{flexDirection: 'row', gap: 5}}>
                                <IconSymbol name='person.crop.circle.fill' size={30} color="#000"/>
                                <ThemedText type="subtitle">Current Assignee: <ThemedText type="secondarySubtitle">{props.chore.assignee?.first_name}</ThemedText></ThemedText>
                            </View>
                            <View style={{flexDirection: 'row', gap: 5}}>
                                <IconSymbol name='calendar' size={30} color="#000"/>
                                <ThemedText type="subtitle">Chore Due: <ThemedText type="secondarySubtitle">{props.chore.due_date?.toLocaleDateString()}</ThemedText></ThemedText>
                            </View>
                            {props.chore.chore.is_rotating && (
                                <>
                                <View style={{flexDirection: 'row', gap: 5}}>
                                    <IconSymbol name='arrow.right.arrow.left.circle.fill' size={30} color="#000"/>
                                    <ThemedText type="subtitle">Pass chore to next roommate:{"\n"}
                                        <ThemedText type='secondarySubtitle'>{props.chore.chore.pass_to_next_value} {props.chore.chore.pass_to_next_unit}</ThemedText>
                                    </ThemedText>
                                </View>
                                <View style={{flexDirection: 'row', gap: 5}}>
                                    <IconSymbol name='arrow.right.circle.fill' size={30} color="#000"/>
                                    <Text style={styles.subHeading}>Next Up: <Text style={styles.text}>{props.chore.next_assignee?.first_name ?? ""}</Text></Text>
                                </View>
                                <View>
                                    <View style={{flexDirection: 'row', gap: 5}}>
                                        <IconSymbol name='person.2.circle.fill' size={30} color="#000"/>
                                        <ThemedText type="subtitle">Roomates Involved:</ThemedText>
                                    </View>
                                    <View style={styles.chipView}>
                                        {props.chore.chore.roommates_involved.map((r) =>
                                                <Chip 
                                                    key={r.id}
                                                    title={r.first_name}
                                                />
                                        )} 
                                    </View>
                                </View>
                                </>
                            )}
                            <View style={{flexDirection: 'row', gap: 5}}>
                                <IconSymbol name='location.fill' size={30} color="#000"/>
                                <ThemedText type='subtitle'>Location: <ThemedText type='secondarySubtitle'>{props.chore.chore.location}</ThemedText></ThemedText>
                            </View>
                            
                        </View>
                        {!props.chore.completed &&
                            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                                <ThemedText type='subtitle'>Mark as Complete</ThemedText>
                            </TouchableOpacity>
                        } 
                        { props.chore.completed && 
                            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                                <ThemedText type='subtitle'>Chore Completed!</ThemedText>
                            </TouchableOpacity>
                        }
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
        paddingBottom: 10,
        flexWrap: 'wrap'
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