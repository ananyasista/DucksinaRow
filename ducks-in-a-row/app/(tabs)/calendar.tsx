import { Calendar, CalendarEvent, ICalendarEventBase, Mode } from 'react-native-big-calendar'
import { StyleSheet, TouchableOpacity, ScrollView, LayoutChangeEvent, Button, Platform, TouchableWithoutFeedback, Modal} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { EventTile } from '@/components/event-tile';
import ModalCalendarForm from '@/components/modal-calendar-form';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  CalendarEvent as APICalendarEvent,
  ApprovalEvent as APIApprovalEvent,
  EventDetails as APIEventDetails,
  listHouseholdEvents,
  listMyEvents,
  listNeedsApproval,
  getEventId,
  getFilterOptions,
} from '@/api/calendar';
import EventModal from '@/components/modal-event';
import { getHouseholdRoommates, Roommate } from '@/api/household';
import { me, ProfileResponse } from '@/api/auth';


export interface CalendarEvent extends ICalendarEventBase {
  id: string;
  display_color?: string | null;
}

export default function CalendarPage () {
    const { mode } = useLocalSearchParams(); //Home Page -> Calendar SPECIFICALLY Event view
    const [calendarHeight, setCalendarHeight] = useState(0);
    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMode, setCurrentMode] = useState<Mode>('week');

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [fullDetailEvent, setFullDetailEvents] = useState<APICalendarEvent[]>([]);
    const [needsMyApproval, setNeedsMyApproval] = useState<APICalendarEvent[]>([]);
    const [myEvents, setMyEvents] = useState<APICalendarEvent[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<APICalendarEvent[]>([]);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showEvents, setShowEvents] = useState(false);

    const [APIEvent, setAPIEvent] = useState<APICalendarEvent|null>(null);
    const [detailsModal, setDetailsModal] = useState(false);
    const [pendingEvent, setPendingEvent] = useState<APIEventDetails|null>(null); 

    const [openDropdown, setOpenDropdown] = useState(false);
    const menuRef = useRef<View>(null);    
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    
    const [isOwner, setIsOwner] = useState(false);
    const [roommates, setRoommates] = useState<Roommate[]>([]);
    const [filtersByRoommate, setFiltersByRoommate] = useState<string[]>([]);
    const [profile, setProfile] = useState<ProfileResponse>();

    const [key, setKey] = useState(0);

    async function loadFilteredCalendarEvents(selectedOwnerIds: string[]) {
      try {
        const filteredEvents =
          selectedOwnerIds.length === 0
            ? await listHouseholdEvents()
            : await getFilterOptions({
                owners: selectedOwnerIds,
              });

        const calenEvents: CalendarEvent[] = filteredEvents.map((event: APICalendarEvent) =>
          APICalEventToCalEvent(event)
        );
        var upcoming: APICalendarEvent[] = [];
        filteredEvents.map((event) => {
          if(new Date(event.start_date) >= new Date())
          {
            upcoming.push(event);
          }
        })

        setFullDetailEvents(filteredEvents);
        setEvents(calenEvents);
        setUpcomingEvents(upcoming);
      } catch (e: any) {
        console.log("Filtered calendar error: " + e);
      }
    }

    useEffect(() => {
      onScreenLoad();
    }, [])

    useEffect(() => {
      loadFilteredCalendarEvents(filtersByRoommate);
    }, [currentDate, filtersByRoommate]);

    function APICalEventToCalEvent(event: APICalendarEvent) {

        var startDate = new Date(event.start_date);
        var endDate = new Date(event.end_date ? event.end_date : new Date(event.start_date + 3600*1000).toISOString());
        
        if(startDate.getMonth() !== endDate.getMonth() || startDate.getDate() != endDate.getDate())
        {
           startDate.setHours(0,0,0,0);
           endDate.setHours(0,0,0,0);
        }
        const calEvent: CalendarEvent = {
            start:startDate,
            end: endDate,
            title: event.title,
            id: event.id,
            display_color: event.display_color ?? null,
        }
        return calEvent;
    }

    function APIApprovalEventToAPICalEvent(e:APIApprovalEvent)
    {
      const approvEvent: APICalendarEvent = {
            id: e.event.id,
            title: e.event.title,
            details: "",
            all_day: (e.event.start_date === e.event.end_date),
            start_date: e.event.start_date,
            end_date: e.event.end_date,
            repeat: "",
            requires_approval: e.event.requires_approval,
            location: e.event.location,
            event_owner_name:  e.event.event_owner_name ?? "",
            display_color: e.event.display_color ?? null,
      }
      return approvEvent;
    }

    const onScreenLoad = async () => {
      try {
        setKey(prev => prev+1);
        setProfile(await me());
        const allEvents = await listHouseholdEvents();
        const loadMyEvents = await listMyEvents();
        const loadNeedMyApproval:APIApprovalEvent[] = await listNeedsApproval();
        const loadRoommates = await getHouseholdRoommates();
        setRoommates(loadRoommates);
        const calenEvents: CalendarEvent[] = 
          allEvents.map((event:APICalendarEvent) => (
            APICalEventToCalEvent(event)
          ));
        const needMyApprovalEvents: APICalendarEvent[] = 
          loadNeedMyApproval.map((e) => (APIApprovalEventToAPICalEvent(e)));        
        
        setEvents(calenEvents);
        setFullDetailEvents(allEvents);
        var upcoming: APICalendarEvent[] = [];
        allEvents.map((event) => {
          if(new Date(event.start_date) >= new Date())
          {
            upcoming.push(event);
          }
        })
        setNeedsMyApproval(needMyApprovalEvents);
        setMyEvents(loadMyEvents);
        setUpcomingEvents(upcoming);
        
      } catch (e: any) {
        console.log("Home page error: " + e);
      }
    };
    
    const calendarLayout = (e:LayoutChangeEvent) => {
      const{height} = e.nativeEvent.layout;
      setCalendarHeight(height);
    }
   
    function changeDateMode(date: Date) {
        setCurrentDate(date);
        setOpenDropdown(false);
        setCurrentMode(currentMode === 'week' ? 'month' : 'week');
    }
    
    function switchToCalendar(mode?: Mode, date?: Date) {
      if(mode)
      {
        router.setParams({mode:mode});
        setCurrentMode(mode);
      }
      if(date)
      {
        setCurrentDate(date);
      }
      setShowCalendar(true);
      setShowEvents(false);
      setOpenDropdown(false);
    }

    function switchToEvents() {
      setShowCalendar(false);
      setShowEvents(true);
      setOpenDropdown(false);
    }
    
    async function showDetailModal(currEvent: CalendarEvent) {
      setOpenDropdown(false);

      const pendingEvent = await getEventId(currEvent.id);
      setPendingEvent(pendingEvent);

      const ownsEvent = myEvents.some((e) => e.id === currEvent.id);
      setIsOwner(ownsEvent);

      const selectedEvent = fullDetailEvent.find((e) => e.id === currEvent.id) ?? null;
      setAPIEvent(selectedEvent);

      setDetailsModal(true);
    }

   
    async function closeDetailModal()
    {
      await updateEvents();
      // setShowCalendar(false);
      // setShowCalendar(true);
      setDetailsModal(false);
    }

    async function updateEvents() {
      try {
        
        setKey(prev => prev+1);
        const refreshedEvents =
          filtersByRoommate.length === 0
            ? await listHouseholdEvents()
            : await getFilterOptions({
                owners: filtersByRoommate,
              });

        const calenEvents: CalendarEvent[] = refreshedEvents.map((event: APICalendarEvent) =>
          APICalEventToCalEvent(event)
        );
        const loadNeedMyApproval:APIApprovalEvent[] = await listNeedsApproval();
        const needMyApprovalEvents: APICalendarEvent[] = 
          loadNeedMyApproval.map((e) => (APIApprovalEventToAPICalEvent(e)));
        const refreshedMyEvents = await listMyEvents(); 
        const allEvents = await listHouseholdEvents();
        var upcoming: APICalendarEvent[] = [];
        allEvents.map((event) => {
          if(new Date(event.start_date) >= new Date())
          {
            upcoming.push(event);
          }
        })
        setEvents(calenEvents);
        setFullDetailEvents(allEvents);
        setNeedsMyApproval(needMyApprovalEvents);
        setMyEvents(refreshedMyEvents);
        setUpcomingEvents(upcoming);
        console.log("Finished updating events...")
      } catch(e: any) {
        console.log("Error updating events: " + e);
      }
    }

    function toggleDropdown() 
    {
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
    useFocusEffect(
      React.useCallback(() => {
        if (mode === 'event') {
          switchToEvents();

          // clear param after using it
          router.setParams({ mode: undefined });
        }
        updateEvents();

      }, [mode])
    );
    function remove(id: string)
    {
       var newNeedsApproval: APICalendarEvent[] = [];
       needsMyApproval.map((e) => {
        if(e.id !== id)
        {
          newNeedsApproval.push(e);
        }
       });
       setNeedsMyApproval(newNeedsApproval);
    }

    function filterBy(roommateId: string | "all") {
      if (roommateId === "all") {
        setFiltersByRoommate([]);
        return;
      }

      const updatedFilters = filtersByRoommate.includes(roommateId)
        ? filtersByRoommate.filter((id) => id !== roommateId)
        : [...filtersByRoommate, roommateId];

      setFiltersByRoommate(updatedFilters);
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
            <TouchableOpacity ref={menuRef} onPress={toggleDropdown} >
              <AntDesign name="menu" size={32} color="black" />
           </TouchableOpacity>
        </View>
        
        {openDropdown && (
        
            <View style={[
                calendarTheme.dropdown,
                { top: dropdownPos.top, right: dropdownPos.right }
              ]} >
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
          {showCalendar && (
            <View>
            <View style={calendarTheme.rowFilter}>
              <TouchableOpacity
                style={filtersByRoommate.length === 0 ? calendarTheme.filter : calendarTheme.filterSelected}
                onPress={() => filterBy("all")}
              >
                <Text style={filtersByRoommate.length === 0 ? calendarTheme.filterText : calendarTheme.filterTextSelected}>
                  All
                </Text>
              </TouchableOpacity>

              {roommates.map((roommate) => {
                if (!roommate.first_name) return null;

                const isSelected = filtersByRoommate.includes(roommate.id);

                return (
                  <TouchableOpacity
                    key={roommate.id}
                    style={isSelected ? calendarTheme.filter : calendarTheme.filterSelected}
                    onPress={() => filterBy(roommate.id)}
                  >
                    <Text style={isSelected ? calendarTheme.filterText : calendarTheme.filterTextSelected}>
                      {roommate.first_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Calendar
              key ={key}
              events={events}
              height={calendarHeight}
              date={currentDate}
              maxVisibleEventCount={2}
              eventCellStyle={(event) => {
                const calEvent = event as CalendarEvent;
                const color = calEvent.display_color || "#4DC591";

                return {
                  backgroundColor: color,
                  borderColor: color,
                  borderWidth: 1,
                  borderRadius: 6,
                };
              }}
              allDayEventCellStyle={(event) => {
                const calEvent = event as CalendarEvent;
                const color = calEvent.display_color || "#4DC591";

                return {
                  backgroundColor: color,
                  borderColor: color,
                  borderWidth: 1,
                  borderRadius: 6,
                };
              }}
              eventCellTextColor="#fff"
              allDayEventCellTextColor="#fff"
              mode={currentMode}
              onPressCell={(date: Date) => changeDateMode(date)}
              onPressDateHeader={(date: Date) => changeDateMode(date)}
              onSwipeEnd={(date: Date) => setCurrentDate(date)}
              theme={theme.calendar}
              verticalScrollEnabled={true}
              showAllDayEventCell={true}
              onPressEvent={(event) => showDetailModal(event as CalendarEvent)}
            />
          </View>)
          }
          {/* Event View - Approval vs Approved*/}
          {/*
            //TODO: Need to edit "Your Events" to check user against event owner
            //TODO: Add in filters -- Filter events by creator 
          */}
          {!showCalendar && (
            <ScrollView key={key}>
              
              <View style={calendarTheme.indent}>
                <ThemedText type='secondarySubtitle'>Needs Approval</ThemedText>
              </View>
                {
                  needsMyApproval.map((event) => {
                    return <EventTile key={event.id} event={event}  owner={false} remove={()=> remove(event.id)}updateEvents={updateEvents}/>
                  })
                }
                {needsMyApproval.length === 0 && 
                    <View style={calendarTheme.indent}><ThemedText type='text'>No events pending your approval</ThemedText></View>
                }
              <View style={{padding:20}}></View>
              
              <View style={calendarTheme.indent}>
                <ThemedText type='secondarySubtitle'>Your Events</ThemedText>
              </View>
              {
                myEvents.map((event) => {
                    if(!event.requires_approval)
                    {
                      return <EventTile key={event.id} event={event} owner={true} updateEvents={updateEvents}/>
                    }
                })
              }
              {
                myEvents.map((event) => {
                    if(event.requires_approval && event.approval_counts && event.approval_counts?.approved < event.approval_counts?.total)
                    {
                      return <EventTile key={event.id} event={event} owner={true} updateEvents={updateEvents}/>
                    }
                })
              }
              {
                myEvents.map((event) => {
                    if(event.requires_approval && event.approval_counts && event.approval_counts?.approved >= event.approval_counts?.total)
                    {
                      return <EventTile key={event.id} event={event} owner={true}updateEvents={updateEvents}/>
                    }
                })
              }
              {myEvents.length === 0 && 
                <View style={calendarTheme.indent}><ThemedText type='text'>You have no events planned</ThemedText></View>              
              }
              <View style={{padding:20}}></View>
              
              <View style={calendarTheme.indent}>
                <ThemedText type='secondarySubtitle'>Upcoming Events in Your House</ThemedText>
              </View>
              {
                upcomingEvents.map((event) => {
                  if(new Date(event.start_date) > new Date())
                  {
                    return <EventTile key = {event.id} event = {event} owner= {profile ? event.event_owner_name === (profile.first_name + " " + profile.last_name) : false} details ={true} updateEvents={updateEvents}/>
                  }
                })
              }   
              {upcomingEvents.length === 0 && 
                <View style={calendarTheme.indent}><ThemedText type='text'>No upcoming events</ThemedText></View>              
              }
            </ScrollView>
          )}
          
        </View>
        {/* Create Event Modal */}
        <ModalCalendarForm event={null}formTitle ="Create Event" edit={false} onClose={() => closeDetailModal()} updateEvents={updateEvents}/>

        {detailsModal && (
          <EventModal 
            event={APIEvent} 
            pendingEvent={pendingEvent} 
            owner={isOwner} 
            onClose={() => closeDetailModal()} 
            updateEvents={updateEvents}/>
        )}

        
    </SafeAreaView>
  )
}
const theme = {
  background: '#rgb(248, 248, 248)',
  text: '#212523',
  calendar: {
    palette: {
      primary: {
        main: '#EC8534',
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
    paddingBottom: 10
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
    backgroundColor: '#79997E',
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
    marginLeft: 15
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
  },
  filter: {
    padding: 5,
    height: 30,
    margin: 5,   
    backgroundColor: '#EC8534',
    borderRadius: 30,
    flexGrow: 1,
    textAlign: 'center',
    justifyContent: 'center'    
  },
  filterText: {
    color: '#fff',
    
    fontSize:12,
    fontFamily: "Cantarell_700Bold",
    fontWeight: 600,
    alignSelf: 'center',
    textAlign: 'center',
  },
  filterSelected: {
    padding: 5,
    margin: 5,   
    height: 30,
    backgroundColor: '#fff',
    borderColor: '#EC8534',
    borderWidth: 1,
    borderRadius: 30,
    flexGrow: 1,
    textAlign: 'center',
    justifyContent: 'center'  
  }, 
  filterTextSelected: {
    color: '#EC8534',
    fontWeight: 600,
    alignSelf: 'center',
    textAlign: 'center',
    
    fontSize:12,
    fontFamily: "Cantarell_700Bold",
  },
  rowFilter: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    paddingBottom: 10
  }
})
