import { Calendar, CalendarEvent, ICalendarEventBase, Mode } from 'react-native-big-calendar'
import { StyleSheet, TouchableOpacity, ScrollView, LayoutChangeEvent, Button, Platform, TouchableWithoutFeedback, Modal} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EventTile } from '@/components/event-tile';
import ModalCalendarForm from '@/components/modal-calendar-form';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AntDesign from '@expo/vector-icons/AntDesign';

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

export default function CalendarPage () {
    const {mode:modeParam} = useLocalSearchParams();
    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const[currentDate, setCurrentDate] = useState(new Date());
    const [openDropdown, setOpenDropdown] = useState(false);
    const[currentMode, setCurrentMode] = useState<Mode>('week');
    const[calendarHeight, setCalendarHeight] = useState(0);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showEvents, setShowEvents] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [event, setEvent] = useState<CalendarEvent|null>(null);
    const memoizedEvents = React.useMemo(() => events, [events]);
    const menuRef = useRef<View>(null);    
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

    const calendarLayout = (e:LayoutChangeEvent) => {
      const{height} = e.nativeEvent.layout;
      setCalendarHeight(height);
    }
    function changeView(date: Date, switchView: Boolean) {
      console.log("Requested change view. Currently: " + currentMode);
        setCurrentDate(date);
        // setCurrentMode(currentMode==='week'?'month':'week');
        console.log("After request: " + currentMode);
    } 
    function switchToCalendar(mode?: Mode, date?: Date) {
      if(mode)
      {
        setCurrentMode(mode);
      }
      if(date)
      {
        setCurrentDate(date);
      }
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
    function toggleDropdown() {
        if (menuRef.current) {
          menuRef.current.measureInWindow((x, y, width, height) => {
            setDropdownPos({
              top: y + height,
              right: 20
            });
          });
        }
         setOpenDropdown(!openDropdown);

      }
    
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background}}>
      
        {/*Date and Today Button*/}
        <View style={calendarTheme.header}>
            <View style={calendarTheme.dateContainer}>
              <View style={calendarTheme.dateTextStack}>
              <ThemedText type='title'>Calendar</ThemedText>
              {showCalendar && (<ThemedText type='secondarySubtitle'>{month[currentDate.getMonth()]} {currentDate.getFullYear()}</ThemedText>)}
              </View>
            </View>
            <TouchableOpacity ref={menuRef} onPress={toggleDropdown}>
        <AntDesign name="menu" size={32} color="black" />
      </TouchableOpacity>
        </View>
        {openDropdown && (
            <View style={[
                calendarTheme.dropdown,
                { top: dropdownPos.top, right: dropdownPos.right }
              ]}>
              <TouchableOpacity style={calendarTheme.item} onPress={() => switchToCalendar(undefined, new Date())}><ThemedText type='boldText'>Today</ThemedText></TouchableOpacity>
              <TouchableOpacity style={calendarTheme.item} onPress={() => switchToCalendar('day')}><ThemedText type='boldText'>Day</ThemedText></TouchableOpacity>
              <TouchableOpacity style={calendarTheme.item} onPress={() => switchToCalendar('3days')}><ThemedText type='boldText'>3-Day</ThemedText></TouchableOpacity>
              <TouchableOpacity style={calendarTheme.item} onPress={() => switchToCalendar('week')}><ThemedText type='boldText'>Week</ThemedText></TouchableOpacity>
              <TouchableOpacity style={calendarTheme.item} onPress={() => switchToCalendar('month')}><ThemedText type='boldText'>Month</ThemedText></TouchableOpacity>
              <TouchableOpacity style={calendarTheme.item} onPress={()=> switchToEvents()}><ThemedText type='boldText'>All Events</ThemedText></TouchableOpacity>
            </View>
            
        )}
        
        {/*Calendar*/}
        <View
          style={{ flex: 1 }}
          onLayout={calendarLayout}
        >
          {showCalendar && (<Calendar
              events={memoizedEvents}
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
  },
  dropdown: {
    position: "absolute",
    top: 45,
    right: 20,
    width: 150,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 20
  },

  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  }
})
