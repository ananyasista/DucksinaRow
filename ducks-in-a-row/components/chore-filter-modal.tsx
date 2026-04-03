import {View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import React, { useState, PropsWithChildren } from 'react'
import Chip from './chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedSwitch } from './themed-switch';
import { IconSymbol } from './ui/icon-symbol';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ThemedText } from './themed-text';

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
    setEndDateFilter: React.Dispatch<React.SetStateAction<Date | undefined>>;
    setStartDateFilter: React.Dispatch<React.SetStateAction<Date | undefined>>;

    assigneeList: {
        email: string,
        first_name: string,
        id: string,
        last_name: string,
        name: string,
    }[];

    locationList: string[];

    onApply: () => void;
    onClear?: () => void;
}>;

export default function ChoreFilterModal(props: ModalProps) {
    const [visible, setVisible] = useState(false);
    const [dateVisible, setDateVisible] = useState(false);
    
    const onChangeStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate ? selectedDate : new Date();
        props.setStartDateFilter(currentDate);
    };

    const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate ? selectedDate : new Date();
        props.setEndDateFilter(currentDate);
    };

    const onClear = () => {
        console.log("Assignee Filter IDs: ", props.assigneeFilterList);
        props.setLocationFilterList([]);
        props.setAssigneeFilterList([]);
        props.setCompletedFilter(true);
        props.setStartDateFilter(new Date());
        props.setEndDateFilter(new Date());
        props.onClear?.();

        setVisible(false);
    }

    const dateToggle = () => {
        if(dateVisible){
            props.setStartDateFilter(undefined);
            props.setEndDateFilter(undefined);
        } else {
            props.setStartDateFilter(new Date());
            props.setEndDateFilter(new Date());
        }

        setDateVisible(!dateVisible);
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
                    <ThemedText type='title'>{props.title}</ThemedText>
                    <TouchableOpacity onPress={() => setVisible(false)}>
                        <IconSymbol size={30} name="multiply" color="#143348"/>
                    </TouchableOpacity>
                </View>

                <SafeAreaView style={styles.modalContent}>
                    <View style={{gap: 10}}>
                    <ThemedText type='subtitle'>Assignee</ThemedText>
                    <View style={styles.chipView}>
                        {props.assigneeList.map((name => (
                            <Chip 
                                key={name.id}
                                title={name.first_name} 
                                onPress={() => {
                                    props.setAssigneeFilterList(prev => {
                                        if(prev.includes(name.id)) {
                                            return prev.filter(item => item !== name.id);
                                        } else {
                                            return [...prev, name.id];
                                        }
                                    })                                }}
                                selected = {props.assigneeFilterList.includes(name.id)}
                            />
                        )))}

                    </View>

                    <ThemedText type='subtitle'>Location</ThemedText>
                        <View style={styles.chipView}>
                            {props.locationList.map((name => (
                                <Chip 
                                    key={name}
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


                    <View style={{gap: 10}}>
                        <ThemedText type='subtitle'>Due Date Range</ThemedText>
                        <ThemedSwitch label='Set Due Date Range' value={dateVisible} onChangeSwitch={() => dateToggle()} labelType='subtitle'></ThemedSwitch>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            {dateVisible && (<>
                            
                            <View style={{justifyContent: 'center', gap: 7}}>
                                {/* <ThemedText type='boldText'>Start Date</ThemedText> */}
                                <View style={{flexDirection: 'row'}}>
                                    <IconSymbol name='calendar' size={30} color="#143348"/>
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
                                {/* <ThemedText type='secondarySubtitle'>End Date</ThemedText> */}
                                <View style={{flexDirection: 'row'}}>
                                    <IconSymbol name='calendar' size={30} color="#143348"/>
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
                            
                            </>)}
                            
                        </View>
                        
                    </View>

                    <View>
                        <ThemedSwitch label="Show Completed" value={props.completedFilter} labelType="subtitle" onChangeSwitch={() => props.setCompletedFilter(prev => !prev)}/>
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
        paddingTop: 0,
        paddingBottom: 10,
        flexWrap: 'wrap',
        width: '100%',
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

    dateHeader: {
        fontSize: 18,
        textDecorationLine: 'underline'
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