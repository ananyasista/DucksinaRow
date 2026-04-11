import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import type { ICalendarEventBase } from 'react-native-big-calendar';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { getHouseholdName } from '@/api/household';
import { updateAssignment, getChoreAssignments, updateChore, buildChorePatch, ChoreAssignment } from '@/api/chores';
import { me } from '@/api/auth';
import {
  CalendarEvent,
  EventDetails,
  getEventId,
  listHouseholdEvents,
  listMyEvents,
  listNeedsApproval,
} from '../../api/calendar';
import EventModal from '@/components/modal-event';
import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type HomeCalendarEvent = ICalendarEventBase & {
  details?: string;
  location?: string;
  event_owner_name?: string;
  rawId?: string;
  display_color?: string | null;
};

const COLORS = {
  card: '#FFFFFF',
  yellow: '#FEE27A',
  gold: '#FAAE43',
  orange: '#EC8534',
  rust: '#AC5736',
  sage: '#79997E',
  navy: '#143348',
  muted: '#666768',
  text: '#222222',
  white: '#FFFFFF',
  toggleGreen: '#18A51B',
};

const FONT = {
  heading: "PTSansCaption_700Bold",
  body: 'Rubik_300Light',
  bodyMedium: "Cantarell_400Regular",
};

const getInitial = (fullName?: string) => {
  if (!fullName) return '?';
  return fullName.trim().charAt(0).toUpperCase();
};

export default function HomeScreen() {
  const [pendingNum, setPendingNum] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(0);
  const [giveApproval, setGiveApproval] = useState(0);
  const [groupName, setGroupName] = useState('Household');
  const [choreList, setChoreList] = useState<ChoreAssignment[]>([]);
  const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<HomeCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventDetails, setEventDetails] = useState(false);
  const [currEvent, setCurrEvent] = useState<EventDetails>();
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const loadHomeData = async () => {
    try {
      const user = await me();

      const householdData = await getHouseholdName();
      setGroupName(householdData.household_name || 'Household');

      const choreData = await getChoreAssignments({
        completed: false,
        assignee: [user.id],
      });

      setChoreList(choreData);
    } catch (e: any) {
      console.log('Auth error:', e?.response?.data || e.message);
      router.replace('/login'); 
    }
  };

  const onScreenLoad = async () => {
    try {
      const currNeedsApproval = await listNeedsApproval();
      const currMyEvents = await listMyEvents();

      const currGiveApproval = currMyEvents.filter(
        (event) =>
          event.requires_approval &&
          event.approval_counts &&
          event.approval_counts.approved < event.approval_counts.total
      );

      setMyEvents(currMyEvents);
      setNeedsApproval(currNeedsApproval.length);
      setGiveApproval(currGiveApproval.length);

      let i = 0;
      if (currNeedsApproval.length > 0) i++;
      if (currGiveApproval.length > 0) i++;
      setPendingNum(i);
    } catch (e: any) {
      console.log('Home page error:', e?.response?.data || e.message);
      if (e?.response?.status === 401) {
        router.replace('/login');
        return;
      }
    }
  };

  const updateEvents = async () => {
    try {
      const currNeedsApproval = await listNeedsApproval();
      const currMyEvents = await listMyEvents();

      const currGiveApproval = currMyEvents.filter(
        (event) =>
          event.requires_approval &&
          event.approval_counts &&
          event.approval_counts.approved < event.approval_counts.total
      );

      setMyEvents(currMyEvents);
      setNeedsApproval(currNeedsApproval.length);
      setGiveApproval(currGiveApproval.length);

      let i = 0;
      if (currNeedsApproval.length > 0) i++;
      if (currGiveApproval.length > 0) i++;
      setPendingNum(i);
      loadUpcomingWeekEvents();
    } catch (e: any) {
      console.log('Home page error:', e?.response?.data || e.message);
      if (e?.response?.status === 401) {
        router.replace('/login');
        return;
      }
    }
  }
  const loadUpcomingWeekEvents = async () => {
    try {
      const allEvents = await listHouseholdEvents();

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
            event_owner_name: event.event_owner_name,
            rawId: event.id,
            display_color: event.display_color ?? null,
          };
        })
        .filter((event) => {
          return (
            !isNaN(event.start.getTime()) &&
            event.start.getTime() >= today.getTime() &&
            event.start.getTime() <= nextWeek.getTime()
          );
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      setUpcomingEvents(mappedEvents);
    } catch (e: any) {
      console.log('Upcoming events error:', e?.response?.data || e.message);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadCurrentChores = async () => {
    try {
      const user = await me();

      const choreData = await getChoreAssignments({
        completed: false,
        assignee: [user.id],
      });

      setChoreList(choreData);
    } catch (e: any) {
      console.log('Auth error:', e?.response?.data || e.message);
      router.replace('/login'); 
    }
  }
  useFocusEffect(
        React.useCallback(() => {
            loadUpcomingWeekEvents();
            loadCurrentChores();
            updateEvents();
        }, [])
      );

  useEffect(() => {
    const loadAll = async () => {
      const MIN_LOADING_TIME = 1500; // 1.5 seconds

      try {
        setLoading(true);

        const startTime = Date.now();

        await Promise.all([
          loadHomeData(),
          onScreenLoad(),
          loadUpcomingWeekEvents(),
        ]);

        const elapsed = Date.now() - startTime;
        const remaining = MIN_LOADING_TIME - elapsed;

        if (remaining > 0) {
          await new Promise((res) => setTimeout(res, remaining));
        }

      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await me();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  const tilesToShow = [
    needsApproval >= 1 && {
      key: 'need',
      num: needsApproval,
      title: 'Your approvals needed:',
    },
    giveApproval >= 1 && {
      key: 'give',
      num: giveApproval,
      title: 'Your events missing approvals:',
    },
  ].filter(
    (tile): tile is { key: string; num: number; title: string } => Boolean(tile)
  );

  async function openEventDetails(event: any) {
    const selectedEvent = await getEventId(event.rawId);
   
    const ownsEvent = myEvents.some((e) => e.id === selectedEvent.id);
   
    setIsOwner(ownsEvent);
    setCurrEvent(selectedEvent);
    setEventDetails(true);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ImageBackground
          source={require('@/assets/images/blueBackgroundTwo.png')}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
          resizeMode="cover"
        >
         
          
        </ImageBackground>
      <View style={styles.screen}>
        <View style={styles.rowCenter}>
          <Image
                source={require('@/assets/images/ducksLogo.png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
            <ThemedText type='title'>Welcome Back, {groupName}!</ThemedText>
          </View>
        <View style={styles.contentCard}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Events ({pendingNum}):</Text>
                {pendingNum === 0 && 
                  <View style={styles.row}>
                    <IconSymbol size={20} name="checkmark" color='#5B6267'/>
                    <Text style={styles.emptyText}> You have no pending events! </Text>
                  </View>
                }
                <View style={styles.pendingGrid}>
                  {tilesToShow.map((tile) => (
                    <TouchableOpacity
                      key={tile.key}
                      style={styles.pendingCard}
                      onPress={() =>
                        router.navigate({ pathname: '/(tabs)/calendar', params: { mode: 'event' } })
                      }
                    >
                      <Text style={styles.pendingLabel}>{tile.title}</Text>
                      <View style={styles.pendingBottomRow}>
                        <View style={styles.pendingCountRow}>
                          <Text style={styles.pendingCount}>{tile.num}</Text>
                          <Text style={styles.pendingCountSub}>events</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={26} color={COLORS.rust} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick To-Do List</Text>
              {choreList.length >= 1 ? (
                <View style={styles.todoList}>
                  {choreList.map((assignment) => {
                    const completed = assignment.completed ?? false;
                    const choreColor = completed ? COLORS.sage : COLORS.orange;

                    return (
                      <TouchableOpacity
                        key={assignment.id}
                        style={[styles.choreCard, { backgroundColor: choreColor }]}
                        onPress={() => {
                          router.navigate({ pathname: '/(tabs)/chores' });
                        }}
                      >
                        <Text style={styles.choreCardText}>{assignment.chore.title}</Text>

                        <TouchableOpacity
                          style={[
                            styles.choreCircle,
                            completed && styles.choreCircleCompleted,
                          ]}
                          onPress={async () => {
                            try {
                              const { chorePatch, choreAssignmentPatch } = buildChorePatch(
                                assignment,
                                {
                                  title: assignment.chore.title,
                                  details: assignment.chore.details,
                                  location: assignment.chore.location,
                                  allDay: assignment.all_day,
                                  dueDate: assignment.due_date,
                                  completed: !completed,
                                  repeatUnit: assignment.chore.repeat_unit,
                                  repeatValue: assignment.chore.repeat_value,
                                  passToNextUnit: assignment.chore.pass_to_next_unit ?? 'weeks',
                                  passToNextValue: assignment.chore.pass_to_next_value ?? 1,
                                  isRotating: assignment.chore.is_rotating,
                                  roommates: assignment.chore.roommates_involved,
                                }
                              );

                              if (Object.keys(chorePatch).length > 0) {
                                await updateChore(assignment.chore.id, chorePatch);
                              }

                              if (Object.keys(choreAssignmentPatch).length > 0) {
                                await updateAssignment(assignment.id, choreAssignmentPatch);
                              }

                              await loadHomeData();
                            } catch (err: any) {
                              console.log('ERROR RESPONSE:', err.response?.data);
                              console.log('STATUS:', err.response?.status);
                            }
                          }}
                        >
                          {completed ? (
                            <Ionicons name="checkmark" size={18} color={COLORS.white} />
                          ) : null}
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.row}>
                    <IconSymbol size={20} name="checkmark" color='#5B6267'/>
                    <Text style={styles.emptyText}> Your to-do list is empty!</Text>
                  </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Week Events</Text>
              <View style={styles.row}>
                    <IconSymbol size={20} name="calendar" color='#5B6267'/>
                    <Text style={styles.sectionSubtitle}> Events coming up</Text>
              </View>

              {loadingEvents ? (
                <Text style={styles.emptyText}>Loading events...</Text>
              ) : upcomingEvents.length > 0 ? (
                <View style={styles.eventList}>
                  {upcomingEvents.map((event) => (
                    <TouchableOpacity
                      key={event.rawId ?? `${event.title}-${event.start.toISOString()}`}
                      style={[
                        styles.eventCard,
                        { backgroundColor: event.display_color || COLORS.sage },
                      ]}
                      onPress={() => openEventDetails(event)}
                    >
                      <Text style={styles.eventTitle}>{event.title}</Text>

                      {event.details ? (
                        <Text style={styles.eventDetails}>{event.details}</Text>
                      ) : null}

                      {event.location ? (
                        <View style={styles.eventInfoRow}>
                          <Ionicons name="location-outline" size={16} color={COLORS.white} />
                          <Text style={styles.eventMeta}>{event.location}</Text>
                        </View>
                      ) : null}

                      <View style={styles.eventInfoRow}>
                        <View
                          style={[
                            styles.initialCircle,
                            {
                              backgroundColor: COLORS.white,
                              borderColor: event.display_color || COLORS.sage,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.initialText,
                              { color: event.display_color || COLORS.sage },
                            ]}
                          >
                            {getInitial(event.event_owner_name)}
                          </Text>
                        </View>
                        <Text style={styles.eventMeta}>{event.event_owner_name || 'Unknown'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No events coming up this week.</Text>
              )}
            </View>
          </ScrollView>
        </View>

        {eventDetails && (
          <EventModal
            event={currEvent ?? null}
            owner={isOwner}
            pendingEvent={currEvent}
            onClose={() => setEventDetails(false)}
            updateEvents={() => updateEvents()}
          />
        )}

            {loading && (
      <View style={styles.loadingOverlay}>
        <Image
          source={require('@/assets/images/loadingDucks.gif')}
          style={styles.loadingGif}
          resizeMode="contain"
        />
        <Text style={styles.loadingText}>Loading your home...</Text>
      </View>
    )}
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  heroBackground: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },
  
  rowCenter: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 30,
    width: '100%',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent:"center",
  },
  heroBackgroundImage: {
    width: '100%',
    height: '100%',
    zIndex: 0
  },
  heroLogo: {
    alignItems:"center", 
    width: 200,
    height: 96,
    marginBottom: -10,
  },
  contentCard: {
    flex: 1,
    marginTop: 10,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 34,
    gap: 34,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: FONT.heading,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: FONT.heading,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontFamily: FONT.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.muted,
  },
  pendingGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  pendingCard: {
    flex: 1,
    backgroundColor: COLORS.gold,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 118,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  pendingLabel: {
    fontFamily: FONT.bodyMedium,
    color: COLORS.rust,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    margin: 6
  },
  pendingBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pendingCountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  pendingCount: {
    fontFamily: FONT.heading,
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '900',
    color: COLORS.white,
  },
  pendingCountSub: {
    fontFamily: FONT.bodyMedium,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  todoList: {
    gap: 14,
  },
  emptyText: {
    fontFamily: FONT.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: COLORS.muted,
  },
  choreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    
  },
  choreCardText: {
    fontFamily: FONT.heading,
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  choreCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choreCircleCompleted: {
    backgroundColor: COLORS.toggleGreen,
    borderColor: COLORS.toggleGreen,
  },
  eventList: {
    gap: 16,
  },
  eventCard: {
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  eventTitle: {
    fontFamily: FONT.heading,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  eventDetails: {
    fontFamily: FONT.bodyMedium,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventMeta: {
    fontFamily: FONT.bodyMedium,
    fontSize: 14,
    lineHeight: 18,
    color: COLORS.white,
    fontWeight: '600',
  },
  initialCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  initialText: {
    fontFamily: FONT.heading,
    fontSize: 13,
    fontWeight: '800',
  },
    loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  loadingGif: {
    width: 200,
    height: 200,
  },

  loadingText: {
    marginTop: -60,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});