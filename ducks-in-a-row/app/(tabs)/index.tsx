import {StyleSheet, View, Text, ScrollView, LayoutChangeEvent, TouchableOpacity,  } from 'react-native';
import type { ICalendarEventBase } from 'react-native-big-calendar';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';

import PendingTile from '@/components/pending-tile';
import CheckboxTile from '@/components/checkbox-tile';
import { ThemedText } from '@/components/themed-text';

import { getHouseholdName } from '@/api/household';
import { listHouseholdEvents, listMyEvents, listNeedsApproval } from '../../api/calendar';

type ApprovalEvent = {
  id: string;
  event: {
    id: string;
    title: string;
    start_date: string;
    end_date?: string | null;
    location?: string;
    requires_approval: boolean;
  };
  approved: boolean;
  response_time?: string | null;
};

type UserData = {
  needApprovals?: number
  giveApprovals?: number
  pendingNum?: number
  groupName: string
  chores: Chore[]
}

type Chore = {
  key: number
  title: string
  complete: boolean
}

type HomeCalendarEvent = ICalendarEventBase & {
  details?: string;
  location?: string;
  event_owner_name?: string;
  rawId?: string;
};

const getInitial = (fullName?: string) => {
  if (!fullName) return '?';
  return fullName.trim().charAt(0).toUpperCase();
};

const mockData: UserData = {
  groupName: "Area 52",
  needApprovals: 10,
  giveApprovals: 4,
  pendingNum: 10,
  chores: [
    {
      key: 1,
      title: "Take out trash",
      complete: false
    },
    {
      key: 2,
      title: "Empty Dishwasher",
      complete: true
    }
  ]
}


export default function HomeScreen() {
  const [pendingNum, setPendingNum] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(0);
  const [giveApproval, setGiveApproval] = useState(0);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const [groupName, setGroupName] = useState('Household');
  const choreList = mockData.chores;
  const [upcomingEvents, setUpcomingEvents] = useState<HomeCalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Fetch Household Name
  const loadHomeData = async () => {
    try {
      const householdData = await getHouseholdName();
      setGroupName(householdData.household_name || 'Household');
    } catch (e: any) {
      console.log('Home page error:', e?.response?.data || e.message);
    }
  };
  
  useEffect(() => {
    loadHomeData();
  }, []);

  const tilesToShow = [
    needsApproval >= 1 && {
      key: 'need',
      num: needsApproval,
      title: 'Needs Your Approval',
    },
    giveApproval >= 1 && {
      key: 'give',
      num: giveApproval,
      title: 'Pending Roommate Approval',
    },
  ].filter(
    (tile): tile is { key: string; num: number; title: string } => Boolean(tile)
  )
  const calendarLayout = (e:LayoutChangeEvent) => {
        const{height} = e.nativeEvent.layout;
        setCalendarHeight(height);
      }

  const onScreenLoad = async () => {
    try {
      const currNeedsApproval = await listNeedsApproval();
      const currGiveApproval = await listMyEvents();

      setNeedsApproval(currNeedsApproval.length);
      setGiveApproval(currGiveApproval.length);

      var i = 0; 
      if(currNeedsApproval.length > 0){i++;}
      if(currGiveApproval.length > 0){i++;}
      setPendingNum(i);
      
    } catch (e: any) {
      console.log("Home page error: " + e);
    }
  }

  useEffect(() => {
    onScreenLoad();
  }, [])


    // Fetch Upcoming Week's Events
  const loadUpcomingWeekEvents = async () => {
  try {
    const allEvents = await listHouseholdEvents();
    console.log("ALL EVENTS:", allEvents);

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const mappedEvents: HomeCalendarEvent[] = allEvents
      .map((event) => {
        const start = new Date(event.start_date);
        const end = event.end_date
          ? new Date(event.end_date)
          : new Date(start.getTime() + 60 * 60 * 1000);

        return {
          title: event.title,
          start,
          end,
          details: event.details,
          location: event.location,
          event_owner_name:
            typeof event.event_owner_name === 'string'
              ? event.event_owner_name
              : event.event_owner_name?.full_name,
          rawId: event.id,
        };
      })
      // Filters for only events in the week
      .filter((event) => {
        return !isNaN(event.start.getTime()) &&
               event.start.getTime() >= today.getTime() &&
               event.start.getTime() <= nextWeek.getTime();
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    setUpcomingEvents(mappedEvents);
  } catch (e: any) {
    console.log("Upcoming events error:", e?.response?.data || e.message);
  } finally {
    setLoadingEvents(false);
  }
};

  useEffect(() => {
    loadUpcomingWeekEvents();
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={{flex: 1}}>
        <View style={styles.header}></View>
        <View style={styles.fullLayout}>

          <ThemedText type="title">Welcome Back, {groupName}!</ThemedText>

          {/* // rendering for pending events section */}
          {pendingNum >= 1  && (
          <View style={styles.section}>
              <>
              <Text style={styles.subtitle}>Pending Events ({pendingNum}):</Text>
                <View style={styles.pendingArea}>
                  {tilesToShow.map((tile) => (
                    <View key={tile.key} style={styles.tileWrapper}>
                      <TouchableOpacity onPress={()=>{router.navigate({pathname:'/(tabs)/calendar', params:{mode:'event'}})}}>
                        <PendingTile
                          numEvents={tile.num}
                          title={tile.title}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            </View>
          )}

          {/* // rendering for chores section */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>Quick To-Do List:</Text>
            {choreList.length >= 1 ? (
              <>
                {choreList.map((chore) => (
                  <CheckboxTile
                    title={chore.title}
                    complete={chore.complete}
                  ></CheckboxTile>
                ))}
              </>
            ) : (
              <Text style={styles.subtitle2}>Your to-do list is empty!</Text>
            )}
          </View>
          
          {/* rendering for upcoming events section*/}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Upcoming Week Events</Text>
          <Text style={styles.subtitle2}>Events coming up</Text>

          {loadingEvents ? (
            <Text style={styles.subtitle2}>Loading events...</Text>
          ) : upcomingEvents.length > 0 ? (
            <>
          {upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.rawId ?? `${event.title}-${event.start.toISOString()}`}
              style={styles.eventCard}
              onPress={() =>
                router.navigate({
                  pathname: '/(tabs)/calendar',
                  params: { mode: 'month' },
                })
              }
            >
              <Text style={styles.eventTitle}>{event.title}</Text>

              {event.details ? (
                <Text style={styles.eventDetails}>{event.details}</Text>
              ) : null}

              {event.location ? (
                <View style={styles.eventInfoRow}>
                  <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.eventMeta}>{event.location}</Text>
                </View>
              ) : null}

              <View style={styles.eventInfoRow}>
                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>
                    {getInitial(event.event_owner_name)}
                  </Text>
                </View>
                <Text style={styles.eventMeta}>
                  {event.event_owner_name || 'Unknown' }
                </Text>
              </View>
            </TouchableOpacity>
          ))}
            </>
          ) : (
            <Text style={styles.subtitle2}>No events coming up this week.</Text>
          )}
        </View>
        </View>    
      </ScrollView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    
  },
  
  pendingArea: {
    flexDirection: 'column',
    gap: 15,
  },

  tileWrapper: {
    flex: 1,
  },

  subtitle: {
    fontSize: 24,
    fontWeight: 700
  },

  subtitle2: {
    fontSize: 16,
    fontWeight: 600
  },

  title: {
    fontSize: 40,
    fontWeight: 700
  },

  fullLayout: {
    flexDirection: 'column',
    gap: 30,
    margin: 20,
    flex: 3
  },

  section: {
    gap: 15,
  },

  header: {
    backgroundColor: '#00664F',
    flex: 2,
    aspectRatio: 2.5
  },
  
  eventCard: {
    backgroundColor: '#57C690',
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  eventDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  eventMeta: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  initialCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F6E7D8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  initialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D2D',
  },

});
