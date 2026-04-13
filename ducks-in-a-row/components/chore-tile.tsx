import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { useState, useEffect } from 'react';
import CircularCheckbox from './circle-checkbox';
import { UserSummary } from '@/api/chores';
import { ThemedText } from './themed-text';

type ChoreTileProps = {
    id: string;
    title: string;
    completed: boolean;
    due_date: Date;
    repeat: string;
    assignee?: UserSummary;
    onChange: (completed: boolean) => void;
    onPress: () => void;
}

export const formatDueDate = (date: Date) => {
    const hasTime =
        date.getHours() !== 0 || date.getMinutes() !== 0;

    if (hasTime) {
        return date.toLocaleString(undefined, {
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    return date.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
    });
};

export default function ChoreTile(props: ChoreTileProps){
    const [checked, setChecked] = useState(props.completed);

    const handleToggle = () => {
        const newValue = !checked;
        setChecked(newValue);

        props.onChange(newValue);
    }

    useEffect(() => {
        setChecked(props.completed);
    }, [props.completed]);

    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={[styles.tile, new Date() > props.due_date && !props.completed && styles.restockTile]}>
                <View style={styles.tileContainer}>
                    {/* LEFT: CHECKBOX */}
                    <View style={styles.checkboxContainer}>
                        <CircularCheckbox
                            checked={checked}
                            onToggle={handleToggle}
                        />
                    </View>

                    {/* MIDDLE & RIGHT: CONTENT */}
                    <View style={styles.contentSection}>
                        {/* ROW 1: TITLE AND REPEATS */}
                        <View style={styles.choreTitleRow}>
                            <ThemedText type="secondarySubtitle">{props.title}</ThemedText>
                            <ThemedText type="default">Repeats {props.repeat}</ThemedText>
                        </View>

                        {/* ROW 2: PROFILE AND DUE DATE */}
                        <View style={styles.choreUserRow}>
                            <View style={styles.profileContainer}>
                                <View style={[styles.profile, {backgroundColor: props.assignee?.display_color}]}>
                                    <ThemedText type="text" style={{color: '#fff'}}>
                                        {(props.assignee?.first_name ?? "U").charAt(0)}
                                    </ThemedText>
                                </View>
                                <ThemedText numberOfLines={1} type="default" style={styles.assigneeText}>
                                    {props.assignee?.first_name ?? "Unassigned"}
                                </ThemedText>
                            </View>
                            <ThemedText type="default">
                                Due {formatDueDate(props.due_date)}
                            </ThemedText>
                        </View>
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
        elevation: 2,
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
    },

    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    profile: {
        width: 20,
        height: 20,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3f4ba1',
    },

    tileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 12,
    },

    contentSection: {
        flex: 1,
        gap: 8,
    },

    choreTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },

    choreUserRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },

    checkboxContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    assigneeText: {
        maxWidth: 80
    },
})