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
            <View style={styles.rowSpace}>
                <ThemedText style={styles.eventNumber}>{props.numEvents}
                    <ThemedText style={styles.bodyText}> events</ThemedText>
                </ThemedText>
                <View style={styles.iconRow}>
                    <IconSymbol  size={24} name="chevron.right" color="#000000"></IconSymbol>
                </View>
            </View>
        </View>
        
    )
}

const styles = StyleSheet.create({
    tileHeading: {
        fontSize: 22,
        fontWeight: 600,
        paddingBottom: 20,
    },
    tile: {
        backgroundColor: "#F8DA79",
        borderRadius: 16,
        paddingTop: 20,
        paddingRight: 20, 
        paddingBottom: 10,
        paddingLeft: 20,
    },
    eventNumber: {
        fontSize: 48,
        margin: 0,
        lineHeight: 50,
        paddingBottom: 2
    },
    bodyText: {
        fontSize: 24
    },
    iconRow: {
        alignItems: "flex-end"
    },
    rowSpace: {
        justifyContent:"space-between",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    
    }
});