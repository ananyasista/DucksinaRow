import { Image } from 'expo-image';
import {StyleSheet, View, Text } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Link } from 'expo-router';

import PendingTile from '@/components/pending-tile';
import CheckboxTile from '@/components/checkbox-tile';


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
  pendingNum: 6,
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
  const pendingNum = mockData.pendingNum;
  const needApproval = mockData.needApprovals ?? 0;
  const giveApproval = mockData.giveApprovals ?? 0;
  const choreList = mockData.chores;

  const tilesToShow = [
    needApproval >= 1 && {
      key: 'need',
      num: needApproval,
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




  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#00664F', dark: '#00664F' }}
      headerImage={
        <Image
          source={null}
        />
      }>

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
                    <PendingTile
                      numEvents={tile.num}
                      title={tile.title}
                    />
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
          <Text style={styles.subtitle2}>Events Coming Up</Text>
          {/* {choreList.length >= 1 ? (
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
          )} */}
        </View>


      </View>    
      
    </ParallaxScrollView>
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
    flex: 1,
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
    gap: 30
  },
  section: {
    gap: 15
  }

  
});
