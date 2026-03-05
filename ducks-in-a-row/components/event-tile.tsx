import React, {useState} from 'react';
import {Switch, StyleSheet, View, TouchableOpacity} from 'react-native';
import { ThemedText } from './themed-text';
import { Text } from '@react-navigation/elements';
import { IconSymbol } from './ui/icon-symbol';
import { CalendarEvent } from './modal-calendar-form';
import EventModal from './modal-event';

export function EventTile(event:CalendarEvent) {
    const abbrMonth = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const [printDate, setPrintDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [eventDetails, setEventDetails] = useState(false);

    function getPrintDate() {
        var date = "";
        date += abbrMonth[event.start.getMonth()] + " ";
        date += event.start.getDate();
        if(event.start.getDate() === 1 || event.start.getDate() === 21 || event.start.getDate() === 31)
        {
            date += "st";
        } else if (event.start.getDate() === 2 || event.start.getDate() === 22) {
            date += "nd";
        } else if(event.start.getDate() === 3 || event.start.getDate() === 23) {
            date += "rd";
        } else {
            date += "th";
        }
        date += " ";
        if(event.start.getHours() == 0)
        {
            date += "12:" + event.start.getMinutes();
        } else if(event.start.getHours() > 12) {
            date += (event.start.getHours()%12) + ":"+ event.start.getMinutes();
        } else {
            date += event.start.getHours() + ":"+ event.start.getMinutes();
        }
        
        if(event.start.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(event.start.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        date += " - ";
        
        if(event.start.getMonth() !== event.end.getMonth() || event.start.getDate() !== event.end.getDate())
        {
            date += abbrMonth[event.end.getMonth()] + " ";
            date += event.end.getDate() ;
            if(event.end.getDate() === 1 || event.end.getDate() === 21 || event.end.getDate() === 31)
            {
                date += "st";
            } else if (event.end.getDate() === 2 || event.end.getDate() === 22) {
                date += "nd";
            } else if(event.end.getDate() === 3 || event.end.getDate() === 23) {
                date += "rd";
            } else {
                date += "th";
            }
            date += " ";
        } 
        if(event.end.getHours() == 0)
        {
            date += "12:" + event.end.getMinutes();
        } else if(event.end.getHours() > 12) {
            date += (event.end.getHours()%12) + ":"+ event.end.getMinutes();
        } else {
            date += event.end.getHours() + ":"+ event.end.getMinutes();
        }
        
        if(event.end.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(event.end.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        setPrintDate(date);
    }
    //TODO: Add in Created by, Approved by #, Waiting for #, Decline/Approve functionality
  return (
    <TouchableOpacity style={eventTileStyle.container} onPress={() => setEventDetails(true)}>
        <View style={eventTileStyle.titleContainer}>
            <ThemedText type="boldText">{event.title}</ThemedText>
            { !event.needsApproval.includes('me') && event.needsApproval.length === 0 && (
                <Text style={eventTileStyle.approvedBubble}>Approved</Text>
            )}
            { !event.needsApproval.includes('me') && event.needsApproval.length !== 0 && (
                <Text style={eventTileStyle.pendingBubble}>Pending</Text>
            )}
        </View>
        <ThemedText type='text'>{event.description}</ThemedText>
        <View style={eventTileStyle.titleContainer} onLayout={getPrintDate}>
            <IconSymbol size={20} name="calendar" color='black'/>
            <ThemedText type='text'>{printDate}</ThemedText>
            {/* <ThemedText type='text'>{abbrMonth[event.start.getMonth()]} {event.start.getDay().toString()} • {event.start.getHours().toString()}-{event.end.getHours().toString()}:{event.end.getMinutes().toString()}</ThemedText> */}
        </View>
        <View style={eventTileStyle.titleContainer}>
            <IconSymbol size={20} name="pin" color='black'/>
            <ThemedText type='text'>Location</ThemedText>
        </View>
        {event.needsApproval.includes('me') && (
            <View style={{width:'100%'}}>
                <View style={{borderBottomColor: 'rgba(215, 209, 209, 1)', borderBottomWidth: 1, marginTop: 10, marginBottom: 10}}/>
                <ThemedText type='text'>Created By: ADD CREATOR</ThemedText>
                <View style={eventTileStyle.buttonContainer}>
                        <TouchableOpacity style={eventTileStyle.declineButton}>
                            <Text style={eventTileStyle.cancelText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={eventTileStyle.approveButton}>
                            <Text style={eventTileStyle.saveText}>Approve</Text>
                        </TouchableOpacity>
                </View>
            </View>
        )}
        { !event.needsApproval.includes('me') && event.needsApproval.length === 0 && (
           <View style={eventTileStyle.titleContainer}>
            <IconSymbol size={20} name="checkmark" color='black'/>
            <Text style={eventTileStyle.approvedText}>Approved by X roommates</Text>
         </View>
        )}
        { !event.needsApproval.includes('me') && event.needsApproval.length !== 0 && (
            <View style={eventTileStyle.titleContainer}>
                <IconSymbol size={20} name="hourglass" color='black'/>
                <Text style={eventTileStyle.pendingText}>Waiting for approval (#/#)</Text>
             </View>
        )}
        { eventDetails && (
            <EventModal event={event}  onClose={() => setEventDetails(false)}/>
        )}
        
    </TouchableOpacity>
  );
};

const eventTileStyle = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 'auto',
    marginTop: 10,
    marginBottom: 10, 
    marginRight: 10,
    borderRadius: 16,
    padding: 15,
    backgroundColor:'rgba(246, 246, 245, 1)',
  },
  toggleRow: {
    justifyContent:"space-between",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingTop:12
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  approvedBubble: {
    color: 'rgba(93, 149, 109, 1)',
    fontWeight: 600,
    fontSize: 10, 
    backgroundColor: 'rgba(201, 239, 212, 1)',
    borderRadius: 34,
    marginLeft: 5,
    paddingLeft: 10, 
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  approvedText: {
    color: 'rgba(93, 149, 109, 1)',
  },
  pendingBubble: {
    color: 'rgba(220, 146, 34, 1)',
    fontWeight: 600,
    fontSize: 10, 
    backgroundColor: 'rgba(239, 224, 201, 1)',
    borderRadius: 34,
    marginLeft: 5,
    paddingLeft: 10, 
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  pendingText: {
    color: 'rgba(220, 146, 34, 1)',
  },
  buttonContainer: {
    justifyContent:"space-between",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 30,
    paddingRight: 30,
  },
  declineButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 10,
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10, 
        paddingBottom: 10,
        paddingRight: 30,
        paddingLeft: 30
    },
    cancelText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 500
    },
    approveButton: {
        backgroundColor: 'rgba(54, 188, 75, 1)',
        borderRadius: 10,
        color: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10, 
        paddingBottom: 10,
        paddingRight: 30,
        paddingLeft: 30,
        borderWidth: 1
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 500
    }
});
