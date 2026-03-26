import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Switch } from 'react-native'
import React, { useState, PropsWithChildren } from 'react'
import { Button, Header } from '@react-navigation/elements'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedSwitch } from './themed-switch';
import { IconSymbol } from './ui/icon-symbol';
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';

type ModalProps = PropsWithChildren<{
    title: string;
    locationFilterList: string[];
    assigneeFilterList: string[];
    completedFilter: boolean;
    startDateFilter: Date;
    endDateFilter: Date;
    setLocationFilterList: React.Dispatch<React.SetStateAction<string[]>>;
    setAssigneeFilterList: React.Dispatch<React.SetStateAction<string[]>>;
    setCompletedFilter: React.Dispatch<React.SetStateAction<boolean>>;
    setEndDateFilter: React.Dispatch<React.SetStateAction<Date>>;
    setStartDateFilter: React.Dispatch<React.SetStateAction<Date>>;

    assigneeList: {
        email: string,
        first_name: string,
        id: string,
        last_name: string,
        name: string,
    }[];

    locationList: string[];

    onApply: () => void;
}>;

export default function ChoreFilterModal(props: ModalProps) {
    const [visible, setVisible] = useState(false);
    
    const onChangeStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate ? selectedDate : new Date();
        props.setStartDateFilter(currentDate);
    };

    const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate ? selectedDate : new Date();
        props.setEndDateFilter(currentDate);
    };

    const onClear = () => {
        props.setLocationFilterList([]);
        props.setAssigneeFilterList([]);
        props.setCompletedFilter(true);
        props.setStartDateFilter(new Date());
        props.setEndDateFilter(new Date());
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
                    <View style={{gap: 10}}>
                    <Text style={styles.subHeading}>Assignee</Text>
                    <View style={styles.chipView}>
                        {props.assigneeList.map((name => (
                            <Chip 
                                key={name.id}
                                title={name.first_name} 
                                onPress={() => {
                                    props.setAssigneeFilterList(prev => {
                                        if(prev.includes(name.first_name)) {
                                            return prev.filter(item => item !== name.first_name);
                                        } else {
                                            return [...prev, name.first_name];
                                        }
                                    })                                }}
                                selected = {props.assigneeFilterList.includes(name.first_name)}
                            
                            />
                        )))}

                    </View>

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={styles.subHeading}>Show Completed</Text>
                        <Switch onValueChange={() => props.setCompletedFilter(prev => !prev)} value={props.completedFilter}/>
                    </View>

                    <View>
                        <Text style={[styles.subHeading, {paddingBottom: 5}]}>Due Date Range</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            <View style={{justifyContent: 'center', gap: 7}}>
                                <Text style={styles.dateHeader}>Start Date</Text>
                                <View style={{flexDirection: 'row'}}>
                                    <IconSymbol name='calendar' size={30} color="#000"/>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={props.startDateFilter}
                                        is24Hour={true}
                                        onChange={onChangeStartDate}
                                        mode={'date'}
                                        display = 'default'
                                        themeVariant='light'
                                    />
                                </View>
                            </View>
                            <View style={{justifyContent: 'center', gap: 7}}>
                                <Text style={styles.dateHeader}>End Date</Text>
                                <View style={{flexDirection: 'row'}}>
                                    <IconSymbol name='calendar' size={30} color="#000"/>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={props.endDateFilter}
                                        is24Hour={true}
                                        onChange={onChangeEndDate}
                                        mode={'date'}
                                        display = 'default'
                                        themeVariant='light'
                                    />
                                </View>
                            </View>
                        </View>
                        
                    </View>

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
        gap: 20,
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
        padding: 30
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

    dateHeader: {
        fontSize: 18,
        textDecorationLine: 'underline'
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