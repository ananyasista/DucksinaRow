import {View, StyleSheet, Switch, Text, TouchableOpacity} from 'react-native';
import { useState } from 'react';
import { isEnabled } from 'react-native/Libraries/Performance/Systrace';
import CircularCheckbox from './circle-checkbox';

type ChoreTileProps = {
    id: string;
    title: string;
    completed: boolean;
    due_date: Date;
    repeat: string;
    assignee: {
        email: string,
        first_name: string,
        id: string
        last_name: string
        name: string
    };
    onChange: () => void;
    onPress: () => void;
}

export default function ChoreTile(props: ChoreTileProps){
    const [checked, setChecked] = useState(props.completed);

    return (
        <TouchableOpacity onPress={props.onPress}>
        <View 
            style={[styles.tile, props.completed && styles.restockTile]}
            
        >
            <Text style={styles.titleHeading}>{props.title}</Text>
            <View style={styles.content}>
                <View>
                    <Text>Repeats {props.repeat}</Text>
                    <Text>Due on {props.due_date.toDateString()}</Text>
                </View>
                <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                    <View style={styles.profile}><Text style={{color: '#fff'}}>{props.assignee.name.charAt(0)}</Text></View>
                    <Text>{props.assignee.first_name}</Text>
                </View>
                <CircularCheckbox 
                    checked = {checked}
                    onToggle={() => setChecked(!checked)}
                />
            </View>
            
        </View>
        </TouchableOpacity>

    )
}

const styles = StyleSheet.create({
    titleHeading: {
        fontSize: 24,
        fontWeight: 600
    },
    tile: {
        backgroundColor: "#F6F6F5",
        borderRadius: 16,
        padding: 20,
        fontSize: 24,
        color: "#000000",
        borderWidth: 2,
        gap: 5
    },

    restockTile: {
        backgroundColor: "#f6f6f593",
        borderRadius: 16,
        padding: 20,
        fontSize: 24,
        color: "#000000",
        borderWidth: 2,
        gap: 5
    },

    subheading: {
        fontSize: 16,
        paddingTop: 5,
        fontWeight: 600
    },

    subView: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    content: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center'
    },

    profile: {
        width: 25,
        height: 25,
        borderRadius: 20,
        backgroundColor: '#3f4ba1',
        alignItems: 'center',
        justifyContent: 'center'
    }
})