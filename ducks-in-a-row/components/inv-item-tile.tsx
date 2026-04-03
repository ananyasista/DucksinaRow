import {View, StyleSheet, TouchableOpacity} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedSwitch } from './themed-switch';

type InvItemTileProps = {
    id: string;
    title: string;
    restock: boolean;
    category: string;
    quantity?: number;
    onChange: (restock: boolean) => void;
    onPress: () => void;
}

export default function InvItemTile(props: InvItemTileProps){
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={[styles.tile, props.restock && styles.restockTile]}>
                <ThemedText type="subtitle">{props.title}</ThemedText>
                <ThemedText type="secondarySubtitle">Category: {props.category}</ThemedText>
                <View style={styles.subView}>
                    <ThemedText type="secondarySubtitle">Stock: {props.quantity}</ThemedText>
                    <View>
                        <ThemedSwitch label="Restock Needed? " value={props.restock} onChangeSwitch={props.onChange}/>
                    </View>
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
        backgroundColor: "#1433487f",
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
    }
})