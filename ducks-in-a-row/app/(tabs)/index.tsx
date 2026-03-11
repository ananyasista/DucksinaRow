import { Image } from 'expo-image';
import {StyleSheet, View, Text, ScrollView, LayoutChangeEvent, TouchableOpacity,  } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';

import PendingTile from '@/components/pending-tile';
import CheckboxTile from '@/components/checkbox-tile';
import { useEffect, useState } from 'react';
import {CalendarEvent, listHouseholdEvents, listMyEvents, listNeedsApproval} from '../../api/calendar';
import { ThemedText } from '@/components/themed-text';
import { Calendar} from 'react-native-big-calendar';

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
  const groupName = mockData.groupName;
  const [pendingNum, setPendingNum] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [needsApproval, setNeedsApproval] = useState(0);
  const [giveApproval, setGiveApproval] = useState(0);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const choreList = mockData.chores;

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
  )
  const calendarLayout = (e:LayoutChangeEvent) => {
        const{height} = e.nativeEvent.layout;
        setCalendarHeight(height);
      }
  const onScreenLoad = async () => {
    try {
      const allEvents = await listHouseholdEvents();
      const currNeedsApproval = await listNeedsApproval();
      const currGiveApproval = await listMyEvents();

      setNeedsApproval(currNeedsApproval.length);
      setGiveApproval(currGiveApproval.length);

      var i = 0; 
      if(currNeedsApproval.length > 0){i++;}
      if(currGiveApproval.length > 0){i++;}
      setPendingNum(i);

      setUpcomingEvents([]);
      currGiveApproval.forEach((event) => {
        if(event.end_date === undefined || event.end_date === null)
        {
          event.end_date = (new Date(event.start_date).getTime()+3600*1000) + " ";
        }
        if(new Date(event.start_date) > new Date() && new Date(event.end_date) < (new Date(new Date().getTime() + 7)))
        {
          var e = upcomingEvents;
          e.push(event);
          setUpcomingEvents(e);
        }
      })
      
    } catch (e: any) {
      console.log("Home page error: " + e);
    }
  }

  useEffect(() => {
    onScreenLoad();
  }, [])





  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={{flex: 1}}>
        <View style={styles.header}></View>
        <View style={styles.fullLayout}>

          <Text style={styles.title}>Welcome Back, {groupName}!</Text>

          {/* // rendering for pending events section */}
          <View style={styles.section}>
              {pendingNum && pendingNum >= 1 && (
              <>
              <Text style={styles.subtitle}>Pending Events ({pendingNum}):</Text>
                <View style={styles.pendingArea}>
                  {tilesToShow.map((tile) => (
                    <View key={tile.key} style={styles.tileWrapper}>
                      <TouchableOpacity onPress={()=>{router.navigate({pathname:'/(tabs)/calendar', params:{mode:'month'}})}}>
                        <PendingTile
                          numEvents={tile.num}
                          title={tile.title}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
          

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
          
          {/* Rendering for Upcoming events section; TILE NOT MADE YET */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>Upcoming Week Events:</Text>
            {upcomingEvents.length==0 && 
            <ThemedText type='subtitle'>You week is empty!</ThemedText>}
            
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
    flexDirection: 'row',
    gap: 40
  },

  tileWrapper: {
    flex: 1
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
    gap: 15
  },

  header: {
    backgroundColor: '#00664F',
    flex: 2,
    aspectRatio: 2.5
  }

  
});
