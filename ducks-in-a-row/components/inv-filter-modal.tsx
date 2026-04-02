import {View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import React, { useState, PropsWithChildren } from 'react'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

type ModalProps = PropsWithChildren<{
    title: string;
    locationFilterList: string[];
    purchaseFilterList: string[];
    stockFilter: boolean;
    setLocationFilterList: React.Dispatch<React.SetStateAction<string[]>>;
    setPurchaseFilterList: React.Dispatch<React.SetStateAction<string[]>>;
    setStockFilter: React.Dispatch<React.SetStateAction<boolean>>;

    purchaseList: { label: string; value: string }[];
    locationList: string[];

    onApply: () => void;

    onClear: () => void;
}>;

export default function InvFilterModal(props: ModalProps) {
    const [visible, setVisible] = useState(false);
    const stockList: string[] = ["Restock Needed"]

    const onClear = () => {
        props.setLocationFilterList([]);
        props.setPurchaseFilterList([]);
        props.setStockFilter(true);

        props.onClear();

        setVisible(false);
    }
    

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
                    <ThemedText type="title">{props.title}</ThemedText>
                    <TouchableOpacity onPress={() => setVisible(false)}>
                        <IconSymbol size={30} name="multiply" color="#000"/>
                    </TouchableOpacity>
                </View>

                <SafeAreaView style={styles.modalContent}>
                    <View>
                        <ThemedText type="subtitle">Location</ThemedText>
                        <View style={styles.chipView}>
                            {props.locationList.map((name => (
                                <Chip 
                                    title={name} 
                                    onPress={() => {
                                        props.setLocationFilterList(prev => {
                                            if(prev.includes(name)) {
                                                return prev.filter(item => item !== name);
                                            } else {
                                                return [...prev, name];
                                            }
                                        })                                }}
                                    selected = {props.locationFilterList.includes(name)}
                                />
                            )))}
                        </View>

                        <ThemedText type="subtitle">Stock</ThemedText>
                        <View style={styles.chipView}>
                            {stockList.map((name => (
                                <Chip 
                                    key={name}
                                    title={name} 
                                    onPress={() => {
                                        props.setStockFilter(prev => !prev);
                                    }}
                                    selected = {props.stockFilter}
                                />
                            )))}
                        </View>

                        <ThemedText type="subtitle">Last Purchased By</ThemedText>
                        <View style={styles.chipView}>
                            {props.purchaseList.map(user => (
                                <Chip
                                    key={user.value}
                                    title={user.label}
                                    onPress={() => {
                                        props.setPurchaseFilterList(prev => {
                                        if (prev.includes(user.value)) {
                                            return prev.filter(item => item !== user.value);
                                        } else {
                                            return [...prev, user.value];
                                        }
                                        });
                                    }}
                                    selected={props.purchaseFilterList.includes(user.value)}
                                />
                            ))}
                        </View>
                    </View>
                    
                    <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <TouchableOpacity 
                            style={styles.stateButtons} 
                            onPress={() => {
                                props.onApply();
                                setVisible(false);
                        }}>
                            <Text style={styles.stateText}>Apply</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.stateButtons} onPress={() => onClear()}>
                            <Text style={styles.stateText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContent: {
        margin: 20,
        flex: 1,
        justifyContent: 'space-between',
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
        fontSize: 16,
        fontWeight: 500
    },

    stateButtons: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
        color: '#000',
        borderColor: '#EC8534',
        justifyContent: 'center',
        alignItems: 'center'
    },

    stateText: {
        fontSize: 24,
        marginVertical: 10,
        marginHorizontal: 40,
        color: '#EC8534'
    }
});