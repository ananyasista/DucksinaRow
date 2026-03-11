import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native'
import React, { useState, PropsWithChildren } from 'react'
import { Button, Header } from '@react-navigation/elements'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';

type ModalProps = PropsWithChildren<{
    title: string;
}>;

export default function InvFilterModal(props: ModalProps) {
    const [visible, setVisible] = useState(false);
    const locationList: string[] = ["Kitchen", "Living Room"];
    const stockList: string[] = ["Needs Restock"];
    const purchaseList: string[] = ["Last Month", "Last Week"];

    const [stockFilter, setStockFilter] = useState(false);
    const [locationFilterList, setLocationFilterList] = useState<string[]>([]);
    const [purchaseFilterList, setPurchaseFilterList] = useState<string[]>([]);


    

    return (
        <View>
            <Chip 
            title="Filter" 
            iconName='slider.horizontal.3'
            onPress={() => setVisible(true)}
            selected = {true}
            />

            <Modal
                animationType='slide'
                visible={visible}
                presentationStyle='formSheet'
                allowSwipeDismissal={true}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{props.title}</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setVisible(false)}>
                        <Text style={styles.cancelText}>Close</Text>
                    </TouchableOpacity>
                </View>


                <SafeAreaView style={styles.modalContent}>
                    <Text style={styles.subHeading}>Location</Text>
                    <View style={styles.chipView}>
                        {locationList.map((name => (
                            <Chip 
                                title={name} 
                                onPress={() => {
                                    setLocationFilterList(prev => {
                                        if(prev.includes(name)) {
                                            return prev.filter(item => item !== name);
                                        } else {
                                            return [...prev, name];
                                        }
                                    })                                }}
                                selected = {locationFilterList.includes(name)}
                            />
                        )))}

                    </View>

                    <Text style={styles.subHeading}>Stock</Text>
                    <View style={styles.chipView}>
                        {stockList.map((name => (
                            <Chip 
                                title={name} 
                                onPress={() => {
                                    setStockFilter(!stockFilter);
                                }}
                                selected = {stockFilter}
                                />
                        )))}

                    </View>

                    <Text style={styles.subHeading}>Last Purchased By</Text>
                    <View style={styles.chipView}>
                        {purchaseList.map((name => (
                            <Chip 
                                title={name} 
                                onPress={() => {
                                    setPurchaseFilterList(prev => {
                                        if(prev.includes(name)) {
                                            return prev.filter(item => item !== name);
                                        } else {
                                            return [...prev, name];
                                        }
                                    })                                }}
                                selected = {purchaseFilterList.includes(name)}
                            
                            />
                        )))}

                    </View>

                </SafeAreaView>
                
            </Modal>
        </View>
        
    )
}

const styles = StyleSheet.create({
    modalContent: {
        margin: 20
    },

    title: {
        fontSize: 48,
        fontWeight: 600
    },

    subHeading: {
        fontSize: 36,
        fontWeight: 400,
        marginTop: 10
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
        padding: 20
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
        fontSize: 20
    }
});