import {View, StyleSheet, Image} from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';


type PendingTileProps = {
    numEvents: number;
    title: string;
}

export default function PendingTile(props: PendingTileProps){
    return (
        <View style={styles.tile}>
            <ThemedText style={styles.tileHeading}>{props.title}</ThemedText>
            <ThemedText style={styles.eventNumber}>{props.numEvents}
                <ThemedText style={styles.bodyText}> events</ThemedText>
            </ThemedText>
            <View style={styles.iconRow}>
                <IconSymbol  size={36} name="chevron.right" color="#000000"></IconSymbol>
            </View>
        </View>
        
    )
}

const styles = StyleSheet.create({
    tileHeading: {
        fontSize: 24,
        fontWeight: 600,
        paddingBottom: 40,
        textAlign: 'center'
    },
    tile: {
        backgroundColor: "#F8DA79",
        borderRadius: 16,
        padding: 20,
        fontSize: 24,
        color: "#000000",
    },
    eventNumber: {
        fontSize: 48,
        textAlign: "center"
    },
    bodyText: {
        fontSize: 24
    },
    iconRow: {
        alignItems: "flex-end"
    }
});