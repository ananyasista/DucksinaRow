import { Calendar, CalendarEvent, CalendarTouchableOpacityProps, ICalendarEventBase, Mode } from 'react-native-big-calendar'
import { StyleSheet, Dimensions, TouchableOpacity, Modal, Switch, ScrollView, LayoutChangeEvent, Button, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ModalForm from '@/components/modal-form';
import { ThemedText } from '@/components/themed-text';
import {ThemedTextInput} from '@/components/text-input';
import { ThemedSwitch } from '@/components/themed-switch';
import DateTimePicker, { DateTimePickerEvent, Event } from '@react-native-community/datetimepicker';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EventTile } from '@/components/event-tile';

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
    end: new Date(2026, 1, 19, 12, 30),
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
    needsApproval: ['me'],
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
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [mode, setMode] = useState(undefined);
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showEvents, setShowEvents] = useState(false);
  
    
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
    function changeToSchedule()
    {
      setCurrentMode('schedule');
    }
    
    const onChangeStart = (event:DateTimePickerEvent, selectedDate:Date) => {
      const currentDate = selectedDate;
      setStartDate(currentDate);
    };
    const onChangeEnd = (event:DateTimePickerEvent, selectedDate:Date) => {
      const currentDate = selectedDate;
      setEndDate(currentDate);
    }

    const showMode = (currentMode) => {
      setShowStart(true);
      setShowEnd(true);
      setMode(currentMode);
      endDate.setHours(endDate.getHours()+1);
    };

    const showDatepicker = () => {
      showMode('date');
    };

    const showTimepicker = () => {
      showMode('time');
    };

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
          />)
          }
          {/* Event View - Approval vs Approved*/}
          {/*
            //TODO: Add in filters
            //TODO: Map through events that need users approval and create button

          */}
          {showEvents && (
            <ScrollView style={calendarTheme.indent}>
              
              <ThemedText type='subtitle'>Needs Approval</ThemedText>
              {
                events.map((event) =>  {
                  if(event.needsApproval.includes('me'))
                  {
                    return  <EventTile title={event.title} start={event.start} end={event.end} description ={event.description} needsApproval= {event.needsApproval} approval={true}/>;
                  }
                })
              }
              <ThemedText type='subtitle'>Your Events</ThemedText>
              {
                events.map((event) =>  {
                  if(!event.needsApproval.includes('me'))
                  {
                    return  <EventTile title={event.title} start={event.start} end={event.end} description ={event.description} needsApproval= {event.needsApproval} approval={false}/>;
                  }
                })
              }
            </ScrollView>
          )}
          
        </View>
        {/* Create Event Modal */}
        <ModalForm title ="Create Event" >
          <ThemedText type="boldText" >Event Title</ThemedText>
          <ThemedTextInput placeholder="Item Name"/>
          <ThemedText type="boldText">Description</ThemedText>
          <ThemedTextInput size="large" multiline={true} placeholder="Add Details"/>
          <ThemedSwitch label="All-Day" />
          
          <View onLayout={showDatepicker}>
            <ThemedText type='boldText'>Start Date:</ThemedText>
            <Text>Start selected: {startDate.toLocaleString()}</Text>

            {showStart && (
              <DateTimePicker
                testID="dateTimePicker"
                value={startDate}
                mode={mode}
                is24Hour={true}
                onChange={onChangeStart}
                themeVariant='light'
              />
            )}
            {showStart && (
              <DateTimePicker
                testID="dateTimePicker"
                value={startDate}
                mode={'time'}
                is24Hour={true}
                onChange={onChangeStart}
                themeVariant='light'
              />
            )}
            <ThemedText type='boldText'>End Date:</ThemedText>
             {showEnd && (
              <DateTimePicker
                testID="dateTimePicker"
                value={endDate}
                mode={Platform.OS === 'ios'?'datetime':mode}
                is24Hour={true}
                onChange={onChangeEnd}
                themeVariant='light'
              />
            )}
          </View>
          <ThemedText type="boldText">Location</ThemedText>
          <ThemedTextInput placeholder='Living Room'/>
          <ThemedSwitch label="Needs Roommates Approval?"/>
          <ThemedText type='text'>Notify all roommates to approve this event</ThemedText>
        </ModalForm>
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
