import { Calendar, CalendarEvent, ICalendarEventBase, Mode } from 'react-native-big-calendar'
import { StyleSheet, TouchableOpacity, ScrollView, LayoutChangeEvent, Button, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EventTile } from '@/components/event-tile';
import ModalCalendarForm from '@/components/modal-calendar-form';

const events = [
  {
    title: 'Meeting',
    start: new Date(2026, 1, 18, 10, 0),
    end: new Date(2026, 1, 18, 12, 30),
    description: "a",
    needsApproval: ['dadf'],
  },
  {
    title: 'Twerk',
    start: new Date(2026, 1, 19, 8, 0),
    end: new Date(2026, 1, 19, 14, 30),
    description: "b",
    needsApproval: ['me'],
  },
  {
    title: 'lil break',
    start: new Date(2026, 1, 19, 12, 35),
    end: new Date(2026, 1, 19, 13, 30),
    description: "c",
    needsApproval: ['sd'],
  },
  {
    title: 'Twerk',
    start: new Date(2026, 1, 19, 13, 35),
    end: new Date(2026, 1, 19, 20, 30),
    description: "d",
    needsApproval: [],
  },
  {
    title: 'Coffee break',
    start: new Date(2026, 2, 31, 15, 45),
    end: new Date(2026, 2, 31, 16, 30),
    description: 'what is up', 
    needsApproval: ['me'],
  },
  {
    title: 'Multi DAY',
    start: new Date(2026, 2, 2, 15, 45),
    end: new Date(2026, 2, 31, 16, 30),
    description: 'what is up', 
    needsApproval: ['me', 'you'],
  },
]
export interface CalendarEvent extends ICalendarEventBase {
  description: string;
  needsApproval:any;

}

export default function CalendarPage() {
    const abbrMonth = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const abbrDay = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    const[currentDate, setCurrentDate] = useState(new Date());
    const[currentMonth, setCurrentMonth] = useState(abbrMonth[currentDate.getMonth()]);
    const[currentMode, setCurrentMode] = useState<Mode>('week');
    const[calendarHeight, setCalendarHeight] = useState(0);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showEvents, setShowEvents] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [event, setEvent] = useState<CalendarEvent|null>(null);
    const calendarLayout = (e:LayoutChangeEvent) => {
      const{height} = e.nativeEvent.layout;
      setCalendarHeight(height);
    }
    function changeView(date: Date, switchView: Boolean) {
        if(switchView === true) {
            setCurrentMode(currentMode==='week'? 'month' : 'week' );
        }
        setCurrentDate(date);
        setCurrentMonth(abbrMonth[date.getMonth()]);
    } 
    function switchToCalendar() {
      setShowCalendar(true);
      setShowEvents(false);
    }
    function switchToEvents() {
      setShowCalendar(false);
      setShowEvents(true);
    }
    
    function showEditModal(event:CalendarEvent|null)
    {
        setEditModal(!editModal);
        setEvent(event);
    }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background}}>
      
        {/*Date and Today Button*/}
        <View style={calendarTheme.header}>
            <View style = {calendarTheme.dateContainer}>
                <Text style = {calendarTheme.bigDateText}>
                    {currentDate.getDate()}
                </Text>
                <View style ={calendarTheme.dateTextStack}>
                    <Text style = {calendarTheme.smallDateText}>
                        {abbrDay[currentDate.getDay()]}
                    </Text>
                    <Text style = {calendarTheme.smallDateText}>
                        {abbrMonth[currentDate.getMonth()] + " " + currentDate.getFullYear()}
                    </Text>
                </View>
            </View>       
            <View >
                <TouchableOpacity style = {calendarTheme.todayButton} onPress={()=> changeView(new Date(), false)}>
                    <Text style = {calendarTheme.todayButtonText}>
                        Today
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
        
        {/*Calendar & Events Tabs */}
        <View style={calendarTheme.tabs}>
            <Text style={calendarTheme.tabsText} onPress={() => switchToCalendar()}>Calendar</Text>
            <Text style={calendarTheme.tabsText} onPress={() => switchToEvents()}>Events</Text>
        </View>
        
        {/*Calendar*/}
        <View
          style={{ flex: 1 }}
          onLayout={calendarLayout}
        >
          {showCalendar && (<Calendar
              events={events}
              height={calendarHeight}
              date = {currentDate}
              eventCellStyle = {calendarTheme.eventStyle}
              mode={currentMode}
              onPressDateHeader={(date:Date) =>changeView(date, true)}
              onSwipeEnd = {(date:Date) => changeView(date, false)}
              theme = {theme.calendar}
              onPressEvent={(event) => showEditModal( event as CalendarEvent)}
          />)
          }
          {/* Event View - Approval vs Approved*/}
          {/*
            //TODO: Need to edit "Your Events" to check user against event owner
            //TODO: Add in filters -- Filter events by creator 
          */}
          {showEvents && (
            <ScrollView style={calendarTheme.indent}>
              <ThemedText type='subtitle'>Needs Approval</ThemedText>
              {
                events.map((event) =>  {
                  if(event.needsApproval.includes('me'))
                  {
                    return  <EventTile title={event.title} start={event.start} end={event.end} description ={event.description} needsApproval= {event.needsApproval} />;
                  }
                })
              }
              <ThemedText type='subtitle'>Your Events</ThemedText>
              {
                events.map((event) =>  {
                  if(!event.needsApproval.includes('me'))
                  {
                    return  <EventTile title={event.title} start={event.start} end={event.end} description ={event.description} needsApproval= {event.needsApproval}/>;
                  }
                })
              }
            </ScrollView>
          )}
          
        </View>
        {/* Create Event Modal */}
        <ModalCalendarForm formTitle ="Create Event" edit={false} onClose={() => setEditModal(false)} />

        {editModal && (
          <ModalCalendarForm formTitle="Edit Event" edit={true} event={event} onClose={() => setEditModal(false)}/>
          )}
    </SafeAreaView>
  )
}
const theme = {
  background: '#ffffff',
  text: '#212523',
  calendar: {
    palette: {
      primary: {
        main: '#FF7648',
        contrastText: '#fff',
      },
      gray: {
        '100': '#ffffff',
        '200': '#e5e7eb',
        '300': '#d1d5db',
        '500': '#6b7280',
        '800': '#111827',
      },
    },
  },
};

const calendarTheme = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#BFD7C8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  tabsText: {
    color: '#000',
    fontSize: 32,
  },
  dateTextStack: {
    alignSelf: 'center',
  },
  bigDateText: {
    fontSize: 44,
    fontWeight: '600',
    color: '#212523',
  },
  smallDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BCC1CD',
  },
  todayButton: {
    backgroundColor: '#4dc59127',
    borderRadius: 6,
    width: 100,
    height: 50,
    alignItems: "center",
    justifyContent: "space-around"
  },
  todayButtonText: {
    color: '#4DC591',
    fontWeight: '600',
    fontSize: 22
  },
  eventStyle: {
    backgroundColor: '#4DC591',
    borderColor: '#12935b',
    borderWidth: 1,
  },
  dateTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 4,
    borderColor: "#ba1a1a"
  },
  dateTime: {
    height: 36,
    backgroundColor: 'rgba(237, 237, 237, 1)',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    width: 100
  },
  indent: {
    marginLeft: 10
  }
});
