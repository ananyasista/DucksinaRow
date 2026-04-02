import React, {useEffect, useState} from 'react';
import {Switch, StyleSheet, View, TouchableOpacity} from 'react-native';
import { ThemedText } from './themed-text';
import { Text } from '@react-navigation/elements';
import { IconSymbol } from './ui/icon-symbol';
import {CalendarEvent as APICalendarEvent, ApprovalEvent as APIApprovalEvent, CalendarEvent, getEventId, EventDetails as APIEventDetails, respondApproval} from '@/api/calendar';
import EventModal from './modal-event';
interface EventTileProps {
  event: APICalendarEvent;
  owner: boolean;
  details?: boolean;
  remove?: any;
  updateEvents: () => Promise<void>
}
export function EventTile({event, owner,details= false, ...props}:EventTileProps) {
    const abbrMonth = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const [printDate, setPrintDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [eventDetails, setEventDetails] = useState(false);
    const [startDate, setStartDate] = useState(new Date(event.start_date));
    const [endDate, setEndDate] = useState(event.end_date ? new Date(event.end_date) : new Date(event.start_date+3600*1000));
    const [pending, setPending] = useState<APIEventDetails>();
    useEffect(()=>{
        getPrintDate();
    },[])

    function getPrintDate() {
        var date = "";
        date += abbrMonth[startDate.getMonth()] + " ";
        date += startDate.getDate();
        var day = startDate.getDate()+"";
        const st = new RegExp("/^1|21|31$/");
        const nd = new RegExp("/^2|22$/");
        const rd = new RegExp("/^3|23$/");
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
            var endDay = endDate.getDay()+"";
            date +=  st.test(endDay)? "st" : 
                nd.test(endDay)? "nd" :
                rd.test(endDay)?"rd" :
                "th";
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

    async function openEventDetails() 
    {
        const currPending = await getEventId(event.id);
        setPending(currPending);
        setEventDetails(true);
    }

    async function decline()
    {
        try {
            respondApproval(event.id, false);
            if (props.updateEvents) {
                await props.updateEvents();
            }
            props.remove();
        } catch (e:any) {
            console.log("Error trying to decline event: " + e);
        }
    }

    async function approve() 
    {
        try {
            respondApproval(event.id, true);
            if (props.updateEvents) {
                await props.updateEvents();
            }
            props.remove();
        } catch (e:any) {
            console.log("error approving event: " + e);
        }
    }
    //TODO: Add in Created by, Approved by #, Waiting for #, Decline/Approve functionality
  return (
    <TouchableOpacity id={event.id} style={eventTileStyle.container} onPress={() => openEventDetails()}>
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
        {!owner && !details && (
            <View style={{width:'100%'}}>
                <View style={{borderBottomColor: 'rgba(215, 209, 209, 1)', borderBottomWidth: 1, marginTop: 10, marginBottom: 10}}/>
                <ThemedText type='text'>Created By: {event.event_owner_name}</ThemedText>
                <View style={eventTileStyle.buttonContainer}>
                        <TouchableOpacity style={eventTileStyle.declineButton} onPress={() => decline()}>
                            <Text style={eventTileStyle.cancelText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={eventTileStyle.approveButton} onPress={() => approve()}>
                            <Text style={eventTileStyle.saveText}>Approve</Text>
                        </TouchableOpacity>
                </View>
            </View>
        )}
        { (owner || details )&& event.approval_status && (event.approval_status === "approved" ||(event.approval_counts &&event.approval_counts?.approved >= event.approval_counts.total)) && (
           <View style={eventTileStyle.titleContainer}>
            <IconSymbol size={20} name="checkmark" color='black'/>
            <Text style={eventTileStyle.approvedText}>Approved by all roommates</Text>
         </View>
        )}
       
        { (owner||details) && event.approval_status && ((event.approval_counts &&event.approval_counts?.approved < event.approval_counts.total))&&  (
            <View style={eventTileStyle.titleContainer}>
                <IconSymbol size={20} name="hourglass" color='black'/>
                <Text style={eventTileStyle.pendingText}>Waiting for approval ({(event.approval_counts?.total ?? 0) - (event.approval_counts?.approved ?? 0)}/{event.approval_counts?.total} remaining)</Text>
             </View>
        )}
        { eventDetails && (
            <EventModal event={event} owner={owner && !details} pendingEvent={pending} onClose={() => setEventDetails(false)} updateEvents={props.updateEvents}/>
        )}
        
    </TouchableOpacity>
  );
};

const eventTileStyle = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 'auto',
    margin:10,
    borderRadius: 16,
    padding: 15,
    backgroundColor:'#ffffff',
    shadowColor: 'black',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 14,
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
    justifyContent:"space-around",
    display: "flex",
    flexDirection: "row",
    padding: 12,
    gap: 10,
  },
  declineButton: {
        flex: 1,
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
        flex: 1,
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
        // color: "#fff",
        fontSize: 16,
        fontWeight: 500
    }
});
