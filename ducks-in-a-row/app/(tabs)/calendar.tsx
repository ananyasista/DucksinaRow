import { Calendar, Mode } from 'react-native-big-calendar'
import { StyleSheet, Dimensions, TouchableOpacity, Modal} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
// import { View } from 'react-native-reanimated/lib/typescript/Animated';
import { View, Text } from 'react-native';
import { Button, Header } from '@react-navigation/elements';
import Octicons from "@expo/vector-icons/Octicons";
import ModalForm from '@/components/modal-form';
import { ThemedText } from '@/components/themed-text';
const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const events = [
  {
    title: 'Meeting',
    start: new Date(2026, 1, 18, 10, 0),
    end: new Date(2026, 1, 18, 12, 30),
  },
  {
    title: 'Twerk',
    start: new Date(2026, 1, 19, 8, 0),
    end: new Date(2026, 1, 19, 12, 30),
  },
  {
    title: 'lil break',
    start: new Date(2026, 1, 19, 12, 35),
    end: new Date(2026, 1, 19, 13, 30),
  },
  {
    title: 'Twerk',
    start: new Date(2026, 1, 19, 13, 35),
    end: new Date(2026, 1, 19, 20, 30),
  },
  {
    title: 'Coffee break',
    start: new Date(2020, 1, 11, 15, 45),
    end: new Date(2020, 1, 11, 16, 30),
  },
  
]

export default function CalendarPage() {
    const abbrMonth = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
    const abbrDay = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    const[currentDate, setCurrentDate] = useState(new Date());
    const[currentMonth, setCurrentMonth] = useState(abbrMonth[currentDate.getMonth()]);
    const[currentMode, setCurrentMode] = useState<Mode>('week');
    const[addVisible, setAddVisible] = useState(false);
    function changeView(date: Date, switchView: Boolean) {
        if(switchView === true) {
            setCurrentMode(currentMode==='week'? 'month' : 'week' );
        }
        setCurrentDate(date);
        setCurrentMonth(abbrMonth[date.getMonth()]);
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
            <Text style={calendarTheme.tabsText} onPress={() => setCurrentMode('week')}>Calendar</Text>
            <Text style={calendarTheme.tabsText} onPress={() => setCurrentMode('schedule')}>Events</Text>
        </View>
        {/*Calendar*/}
        <Calendar
            events={events}
            height={SCREEN_HEIGHT}
            date = {currentDate}
            eventCellStyle = {calendarTheme.eventStyle}
            mode={currentMode}
            onPressDateHeader={(date:Date) =>changeView(date, true)}
            onSwipeEnd = {(date:Date) => changeView(date, false)}
            theme = {theme.calendar}
        />

        {/*Create Event Modal*/}
        <ModalForm title ="Create Event">
          
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
});
