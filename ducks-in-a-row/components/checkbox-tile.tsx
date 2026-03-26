import {View, StyleSheet, TouchableOpacity} from 'react-native';
import { ThemedText } from './themed-text';
import CircularCheckbox from './circle-checkbox';
import { useState } from 'react';
import { ChoreDetail } from '@/api/chores';
type CheckboxTileProps = {
    title: string;
    complete: boolean;
    id: string;
    onPress: () => void;
    onToggle: (chore: Partial<ChoreDetail>) => void;
}

export default function CheckboxTile(props: CheckboxTileProps){
    const [isChecked, setChecked] = useState(props.complete);

    const handleToggle = () => {
        const newValue = !isChecked;
        setChecked(newValue);
        const udpatedChore: Partial<ChoreDetail> = {
            id: props.id,
            completed: newValue
        }

        props.onToggle(udpatedChore);
    }

    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={styles.tile}>
            <ThemedText style={styles.titleHeading}>{props.title}</ThemedText>
            <CircularCheckbox
                checked={isChecked}
                onToggle={handleToggle}
            />          
        </View>
        </TouchableOpacity>
        
    )
}

const styles = StyleSheet.create({
    titleHeading: {
        fontSize: 24,
        fontWeight: 600,
    },
    tile: {
        backgroundColor: "#FF7648",
        borderRadius: 16,
        padding: 15,
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 24,
        color: "#000000",
        justifyContent: "space-between",
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkbox: {
        alignItems: "flex-end",
        transform: [{ scaleX: 2.0 }, { scaleY: 2.0 }],
    },
    testcheckbox: {
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        width: 25,
        height: 25
    }
})