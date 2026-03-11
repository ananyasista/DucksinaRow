import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native'
import React, { useState, PropsWithChildren } from 'react'
import { Button, Header } from '@react-navigation/elements'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';

type ModalProps = PropsWithChildren<{
    title: string;
    locationFilterList: string[];
    purchaseFilterList: string[];
    stockFilter: boolean;
    setLocationFilterList: React.Dispatch<React.SetStateAction<string[]>>;
    setPurchaseFilterList: React.Dispatch<React.SetStateAction<string[]>>;
    setStockFilter: React.Dispatch<React.SetStateAction<boolean>>;

    purchaseList: Map<string, string>;
    locationList: string[];

    onApply: () => void;
}>;

export default function InvFilterModal(props: ModalProps) {
    const [visible, setVisible] = useState(false);
    const stockList: string[] = ["Restock Needed"]

    const onClear = () => {
        props.setLocationFilterList([]);
        props.setPurchaseFilterList([]);
        props.setStockFilter(true);
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
                    <Text style={styles.title}>{props.title}</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setVisible(false)}>
                        <Text style={styles.cancelText}>Close</Text>
                    </TouchableOpacity>
                </View>


                <SafeAreaView style={styles.modalContent}>
                    <View>
                        <Text style={styles.subHeading}>Location</Text>
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

                        <Text style={styles.subHeading}>Stock</Text>
                        <View style={styles.chipView}>
                            {stockList.map((name => (
                                <Chip 
                                    title={name} 
                                    onPress={() => {
                                        props.setStockFilter(prev => !prev);
                                    }}
                                    selected = {props.stockFilter}
                                    />
                            )))}

                        </View>

                        <Text style={styles.subHeading}>Last Purchased By</Text>
                        <View style={styles.chipView}>
                            {Array.from(props.purchaseList.entries()).map(([id, name]) => (
                                <Chip
                                key={id}
                                title={name}
                                onPress={() => {
                                    props.setPurchaseFilterList(prev => {
                                    if (prev.includes(id)) {
                                        return prev.filter(item => item !== id);
                                    } else {
                                        return [...prev, id];
                                    }
                                    });
                                }}
                                selected={props.purchaseFilterList.includes(id)}
                                />
                            ))}
                            </View>

                    </View>
                    
                    <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <TouchableOpacity style={styles.stateButtons} onPress={() => setVisible(false)}>
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
        justifyContent: 'space-between'
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
    },

    stateButtons: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },

    stateText: {
        fontSize: 30,
        marginVertical: 10,
        marginHorizontal: 40
    }
});