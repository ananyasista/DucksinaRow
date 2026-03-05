import React, {useState} from 'react';
import {Switch, StyleSheet, View, TouchableOpacity} from 'react-native';
import { ThemedText } from './themed-text';
import { Text } from '@react-navigation/elements';
import { IconSymbol } from './ui/icon-symbol';
type EventTileProps = {
    title: string, 
    start: Date,
    end: Date, 
    description: string,
    needsApproval: string[],
    approval: boolean
};
export function EventTile(data:EventTileProps) {
    const abbrMonth = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const [printDate, setPrintDate] = useState("");

    function getPrintDate() {
        var date = "";
        date += abbrMonth[data.start.getMonth()] + " ";
        date += data.start.getDate();
        if(data.start.getDate() === 1 || data.start.getDate() === 21 || data.start.getDate() === 31)
        {
            date += "st";
        } else if (data.start.getDate() === 2 || data.start.getDate() === 22) {
            date += "nd";
        } else if(data.start.getDate() === 3 || data.start.getDate() === 23) {
            date += "rd";
        } else {
            date += "th";
        }
        date += " ";
        if(data.start.getHours() == 0)
        {
            date += "12:" + data.start.getMinutes();
        } else if(data.start.getHours() > 12) {
            date += (data.start.getHours()%12) + ":"+ data.start.getMinutes();
        } else {
            date += data.start.getHours() + ":"+ data.start.getMinutes();
        }
        
        if(data.start.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(data.start.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        date += " - ";
        
        if(data.start.getMonth() !== data.end.getMonth() || data.start.getDate() !== data.end.getDate())
        {
            date += abbrMonth[data.end.getMonth()] + " ";
            date += data.end.getDate() ;
            if(data.end.getDate() === 1 || data.end.getDate() === 21 || data.end.getDate() === 31)
            {
                date += "st";
            } else if (data.end.getDate() === 2 || data.end.getDate() === 22) {
                date += "nd";
            } else if(data.end.getDate() === 3 || data.end.getDate() === 23) {
                date += "rd";
            } else {
                date += "th";
            }
            date += " ";
        } 
        if(data.end.getHours() == 0)
        {
            date += "12:" + data.end.getMinutes();
        } else if(data.end.getHours() > 12) {
            date += (data.end.getHours()%12) + ":"+ data.end.getMinutes();
        } else {
            date += data.end.getHours() + ":"+ data.end.getMinutes();
        }
        
        if(data.end.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(data.end.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        setPrintDate(date);
    }

    //TODO: Add in Created by, Approved by #, Waiting for #, Decline/Approve functionality
  return (
    <View style={eventTileStyle.container}>
        <View style={eventTileStyle.titleContainer}>
            <ThemedText type="boldText">{data.title}</ThemedText>
            { !data.approval && data.needsApproval.length === 0 && (
                <Text style={eventTileStyle.approvedBubble}>Approved</Text>
            )}
            { !data.approval && data.needsApproval.length !== 0 && (
                <Text style={eventTileStyle.pendingBubble}>Pending</Text>
            )}
        </View>
        <ThemedText type='text'>{data.description}</ThemedText>
        <View style={eventTileStyle.titleContainer} onLayout={getPrintDate}>
            <IconSymbol size={20} name="calendar" color='black'/>
            <ThemedText type='text'>{printDate}</ThemedText>
            {/* <ThemedText type='text'>{abbrMonth[data.start.getMonth()]} {data.start.getDay().toString()} • {data.start.getHours().toString()}-{data.end.getHours().toString()}:{data.end.getMinutes().toString()}</ThemedText> */}
        </View>
        <View style={eventTileStyle.titleContainer}>
            <IconSymbol size={20} name="pin" color='black'/>
            <ThemedText type='text'>Location</ThemedText>
        </View>
        {data.approval && (
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
        { !data.approval && data.needsApproval.length === 0 && (
           <View style={eventTileStyle.titleContainer}>
            <IconSymbol size={20} name="checkmark" color='black'/>
            <Text style={eventTileStyle.approvedText}>Approved by X roommates</Text>
         </View>
        )}
        { !data.approval && data.needsApproval.length !== 0 && (
            <View style={eventTileStyle.titleContainer}>
                <IconSymbol size={20} name="hourglass" color='black'/>
                <Text style={eventTileStyle.pendingText}>Waiting for approval (#/#)</Text>
             </View>
        )}
    </View>
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
