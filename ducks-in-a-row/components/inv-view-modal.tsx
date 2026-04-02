import {View, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { InventoryDetails } from '@/api/inventory';
import { IconSymbol } from './ui/icon-symbol';
import { ThemedText } from './themed-text';
import { ThemedSwitch } from './themed-switch';

type ModalProps = {
    item: InventoryDetails;
    //toggleRestock: () => void;
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onRestockChange: (value: boolean, id: string) => void;
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
                        <ThemedText type="title">{props.item.name}</ThemedText>
                        <ThemedText type="secondarySubtitle">{props.item.details}</ThemedText>
                        <View style={styles.rowStart}> 
                            <IconSymbol size={30} name="pin.fill" color="#000"/>
                            <ThemedText type="subtitle">Location: <ThemedText type="secondarySubtitle">{props.item.location}</ThemedText></ThemedText>
                        </View>
                        <View style={styles.rowStart}> 
                            <IconSymbol size={30} name="person.fill" color="#000"/>
                            <ThemedText type="subtitle">Last Purchased By: <ThemedText type="secondarySubtitle">{props.item.last_purchased_by.first_name}</ThemedText></ThemedText>
                        </View>
                        <View style={styles.rowStart}> 
                            <IconSymbol size={30} name="calendar" color="#000"/>
                            <ThemedText type="subtitle">Purchase Date: <ThemedText type="secondarySubtitle">{props.item.last_purchased_date ? new Date(props.item.last_purchased_date).toLocaleDateString()  : "N/A"}</ThemedText></ThemedText>
                        </View>
                        <View>                            
                            <ThemedSwitch 
                                label="Restock Needed?" 
                                value={props.item.restock_needed} 
                                onChangeSwitch={(value) => {
                                    props.onRestockChange(value, props.item.id);
                                }}
                            />
                            <ThemedText type="text">Toggle when this item needs to be restocked</ThemedText>
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
    },

    rowStart: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: "center",
        gap: 5
    }

});