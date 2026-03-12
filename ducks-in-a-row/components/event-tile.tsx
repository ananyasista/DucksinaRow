import React, {useEffect, useState} from 'react';
import {Switch, StyleSheet, View, TouchableOpacity} from 'react-native';
import { ThemedText } from './themed-text';
import { Text } from '@react-navigation/elements';
import { IconSymbol } from './ui/icon-symbol';
import {CalendarEvent as APICalendarEvent} from '@/api/calendar';
import EventModal from './modal-event';
interface EventTileProps {
  event: APICalendarEvent;
  owner: boolean;
}
export function EventTile({event, owner}:EventTileProps) {
    const abbrMonth = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const [printDate, setPrintDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [eventDetails, setEventDetails] = useState(false);
    const [startDate, setStartDate] = useState(new Date(event.start_date));
    const [endDate, setEndDate] = useState(event.end_date ? new Date(event.end_date) : new Date(event.start_date+3600*1000));
    useEffect(()=>{
        getPrintDate();
    },[])
    function getPrintDate() {
        var date = "";
        date += abbrMonth[startDate.getMonth()] + " ";
        date += startDate.getDate();
        var day = startDate.getDate()+"";
        const st = new RegExp("$1|21|31^");
        const nd = new RegExp("$2|22^");
        const rd = new RegExp("$3|23^");
        date +=  st.test(day)? "st" : 
                nd.test(day)? "nd" :
                rd.test(day)?"rd" :
                "th";
        date += " ";

        if(startDate.getHours() == 0)
        {
            date += "12:" + startDate.getMinutes();
        } else if(startDate.getHours() > 12) {
            date += (startDate.getHours()%12) + ":"+ startDate.getMinutes();
        } else {
            date += startDate.getHours() + ":"+ startDate.getMinutes();
        }
        
        if(startDate.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(startDate.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        date += " - ";
        
        if(startDate.getMonth() !== endDate.getMonth() || startDate.getDate() !== endDate.getDate())
        {
            date += abbrMonth[endDate.getMonth()] + " ";
            date += endDate.getDate() ;
            if(endDate.getDate() === 1 || endDate.getDate() === 21 || endDate.getDate() === 31)
            {
                date += "st";
            } else if (endDate.getDate() === 2 || endDate.getDate() === 22) {
                date += "nd";
            } else if(endDate.getDate() === 3 || endDate.getDate() === 23) {
                date += "rd";
            } else {
                date += "th";
            }
            date += " ";
        } 
        if(endDate.getHours() == 0)
        {
            date += "12:" + endDate.getMinutes();
        } else if(endDate.getHours() > 12) {
            date += (endDate.getHours()%12) + ":"+ endDate.getMinutes();
        } else {
            date += endDate.getHours() + ":"+ endDate.getMinutes();
        }
        
        if(endDate.getMinutes() === 0)
        {
            date += "0";
        }
        date += " ";
        if(endDate.getHours() < 12)
        {
            date += "AM";
        } else {
            date += "PM";
        }
        setPrintDate(date);
    }
    //TODO: Add in Created by, Approved by #, Waiting for #, Decline/Approve functionality
  return (
    <TouchableOpacity id={event.id} style={eventTileStyle.container} onPress={() => setEventDetails(true)}>
        <View style={eventTileStyle.titleContainer}>
            <ThemedText type="boldText">{event.title}</ThemedText>
            { owner && event.approval_status && (event.approval_status === "approved" ||(event.approval_counts &&event.approval_counts?.approved >= event.approval_counts.total)) && (
                <Text style={eventTileStyle.approvedBubble}>Approved</Text>
            )}
            { owner && event.approval_status && ((event.approval_counts && event.approval_counts?.approved < event.approval_counts.total)) && (
                <Text style={eventTileStyle.pendingBubble}>Pending</Text>
            )}
        </View>
        <ThemedText type='text'>{event.details}</ThemedText>
        <View style={eventTileStyle.titleContainer} onLayout={getPrintDate}>
            <IconSymbol size={20} name="calendar" color='black'/>
            <ThemedText type='text'>{printDate}</ThemedText>
        </View>
        <View style={eventTileStyle.titleContainer}>
            { event.location && event.location !== "" &&
                <IconSymbol name='pin' size={20} color="black"/> &&
                <ThemedText type='text'>Location: {event.location} </ThemedText>
            }
            
        </View>
        {!owner && (
            <View style={{width:'100%'}}>
                <View style={{borderBottomColor: 'rgba(215, 209, 209, 1)', borderBottomWidth: 1, marginTop: 10, marginBottom: 10}}/>
                <ThemedText type='text'>Created By: {event.event_owner_name?.full_name}</ThemedText>
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
        { owner && event.approval_status && (event.approval_status === "approved" ||(event.approval_counts &&event.approval_counts?.approved >= event.approval_counts.total)) && (
           <View style={eventTileStyle.titleContainer}>
            <IconSymbol size={20} name="checkmark" color='black'/>
            <Text style={eventTileStyle.approvedText}>Approved by all roommates</Text>
         </View>
        )}
       
        { owner && event.approval_status && ((event.approval_counts &&event.approval_counts?.approved < event.approval_counts.total))&&  (
            <View style={eventTileStyle.titleContainer}>
                <IconSymbol size={20} name="hourglass" color='black'/>
                <Text style={eventTileStyle.pendingText}>Waiting for approval ({(event.approval_counts?.total ?? 0) - (event.approval_counts?.approved ?? 0)}/{event.approval_counts?.total} remaining)</Text>
             </View>
        )}
        { eventDetails && (
            <EventModal event={event} printDate={printDate}  onClose={() => setEventDetails(false)}/>
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
