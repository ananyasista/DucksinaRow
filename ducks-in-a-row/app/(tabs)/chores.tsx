import {StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import Octicons from "@expo/vector-icons/Octicons";

import ChoreFilterModal from '@/components/chore-filter-modal';
import ChoreTile from '@/components/chore-tile';
import ChoreViewModal from '@/components/chore-view-modal';
import ChoreItemModal from '@/components/chore-item-modal';

type ChoreItem = {
  id: string;
  name: string;
  details: string;
  repeat: string;
  date: Date;
  completed: boolean;
  assignee: string;
  location: string;
  next_assignee: string;
  roommates: string[];
  all_day: boolean;
}

const mockData: ChoreItem[] = [
  {
    id: "123",
    name: "Vacuum",
    details: "Empty when done!",
    date: new Date("2026-03-09"),
    completed: false,
    assignee: "Leyna",
    location: "Living Room",
    next_assignee: "Elle",
    repeat: 'daily',
    roommates: ["Leyna", "Elle", "Ananya", "Sofia"],
    all_day: false
  },
  {
    id: "456",
    name: "Wash Dishes",
    details: "Please clear the drying rack before starting",
    date: new Date("2026-03-09T20:36:26.989156Z"),
    completed: true,
    assignee: "Ananya",
    location: "Kitchen",
    next_assignee: "Sofia",
    repeat: 'daily',
    roommates: ["Ananya", "Sofia"],
    all_day: true
  }
]

export default function InventoryScreen() {
  const itemList = mockData;
  
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [viewItemVisible, setViewItemVisible] = useState(false);
  const [editItemVisible, setEditItemVisible] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChoreItem | null>(null);
  const [searchText, setSearchText] = useState('');

  // TODO: have to create function that triggers when restock toggle is pressed
  


  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.fullLayout}>
          <Text style={styles.title}>Chores</Text>
          <View style={{flexDirection: 'row', gap: 13}}>
            <ChoreFilterModal title='Filters'/>
            <TextInput 
                style={styles.input}
                onChangeText={setSearchText}
                value={searchText}
                placeholder='Search'
                placeholderTextColor='#ABA4A461'
            />
          </View>

          <View style={styles.section}>
            {itemList
                .filter(item => {
                  if(!searchText) return true;
                  return item.name.toLowerCase().includes(searchText.toLowerCase());
                })
                .map((item) => (
                <ChoreTile
                  id={item.id}
                  title={item.name} 
                  completed={item.completed}
                  end_date={item.date}
                  repeat={item.repeat}
                  assignee={item.assignee}
                  onPress={() => {
                    setSelectedItem(item);
                    setViewItemVisible(true);
                  }}
                  onChange={() => console.log("changed")}
                />
              ))
            }
          </View>  

          <View style={styles.addButton}>
            <TouchableOpacity onPress={() => setAddItemVisible(true)}>
              <Octicons name='plus' size = {30} color='#fff'/>
            </TouchableOpacity>
          </View>

          {selectedItem && (
            <ChoreViewModal 
              item={selectedItem}
              visible={viewItemVisible}
              onClose={() => {
                setViewItemVisible(false);
                setSelectedItem(null);
              }}
              onEdit={() => {
                setViewItemVisible(false);
                setEditItemVisible(true);
              }}
              onDelete={() => {
                setViewItemVisible(false);
                // set delete functionality here
              }}
            />
          )}

          <ChoreItemModal 
            title="Add Chore"
            visible={addItemVisible}
            onClose={() => setAddItemVisible(false)}
          />

          {selectedItem && (
            <ChoreItemModal
              visible={editItemVisible}
              onClose={() => setEditItemVisible(false)}
              title="Edit Chore"
              item={selectedItem}
            />
            
          )}
          
          

        </View>    
      </ScrollView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    fontWeight: 700
  },

  fullLayout: {
    flexDirection: 'column',
    gap: 30,
    margin: 20
  },

  section: {
    gap: 15
  },

  addButton: {
        backgroundColor: '#4DC591',
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
  
  input: {
    borderWidth: 2,
    padding: 5,
    borderColor: '#ABA4A461',
    backgroundColor: '#F6F4F4C4',
    borderRadius: 13,
    fontSize: 16,
    flex: 2
  }

  
});

export type {ChoreItem};