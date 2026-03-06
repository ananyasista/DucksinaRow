import {View, StyleSheet, Switch, Text, TouchableOpacity} from 'react-native';
import { useState } from 'react';
import { isEnabled } from 'react-native/Libraries/Performance/Systrace';

type InvItemTileProps = {
    id: string;
    title: string;
    restock: boolean;
    category: string;
    stock?: number;
    onChange: () => void;
    onPress: () => void;
}

export default function InvItemTile(props: InvItemTileProps){
    
    return (
        <TouchableOpacity onPress={props.onPress}>
                    <View style={styles.tile}>
            <Text style={styles.titleHeading}>{props.title}</Text>
            <Text style={styles.subheading}>Category: {props.category}</Text>
            <View style={styles.subView}>
                <Text style={styles.subheading}>Stock: {props.stock}</Text>
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.subheading}>Restock? </Text>
                    <Switch 
                        trackColor={{false: 'red', true: 'green'}}
                        thumbColor={'white'}
                        onValueChange={props.onChange}
                        value={props.restock}
                    />
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
        backgroundColor: "##F6F6F5",
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