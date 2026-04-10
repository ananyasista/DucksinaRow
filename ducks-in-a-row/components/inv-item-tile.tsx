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
                <ThemedText type="secondarySubtitleBold">{props.title}</ThemedText>
                <ThemedText type="default">Category: {props.category}</ThemedText>
                <View style={styles.subView}>
                    <ThemedText type="default">Stock: {props.quantity}</ThemedText>
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
        gap: 5,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2
    },

    restockTile: {
        backgroundColor: "#f9d8bf",
        borderRadius: 16,
        padding: 20,
        fontSize: 24,
        color: "#000000",
        gap: 5,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2
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