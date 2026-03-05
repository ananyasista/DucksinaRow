import {View, StyleSheet} from 'react-native';
import { ThemedText } from './themed-text';
import CircularCheckbox from './circle-checkbox';
import { useState } from 'react';
type CheckboxTileProps = {
    title: string;
    complete: boolean;
}

export default function CheckboxTile(props: CheckboxTileProps){
    const [isChecked, setChecked] = useState(props.complete);

    return (
        <View style={styles.tile}>
            <ThemedText style={styles.titleHeading}>{props.title}</ThemedText>
            <CircularCheckbox
                checked={isChecked}
                onToggle={() => setChecked(!isChecked)}
            />          
        </View>
    )
}

const styles = StyleSheet.create({
    titleHeading: {
        fontSize: 24,
        fontWeight: 600
    },
    tile: {
        backgroundColor: "#FF7648",
        borderRadius: 16,
        padding: 20,
        fontSize: 24,
        color: "#000000",
        justifyContent: "space-between",
        flexDirection: 'row'
    },
    checkbox: {
        alignItems: "flex-end",
        transform: [{ scaleX: 2.0 }, { scaleY: 2.0 }],
    },
    testcheckbox: {
        borderRadius: 2000,
        backgroundColor: "#FFFFFF",
        width: 25,
        height: 25
    }
})