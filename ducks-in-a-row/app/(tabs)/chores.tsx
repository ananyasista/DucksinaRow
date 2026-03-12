import {StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import Octicons from "@expo/vector-icons/Octicons";

import ChoreFilterModal from '@/components/chore-filter-modal';
import ChoreTile from '@/components/chore-tile';
import ChoreViewModal from '@/components/chore-view-modal';
import ChoreItemModal from '@/components/chore-item-modal';

import * as choreAPI from '@/api/chores';
import { getHouseholdRoommates } from '@/api/household';

// type ChoreItem = {
//   id: string;
//   title: string;
//   details: string;
//   repeat: string;
//   date: Date;
//   completed: boolean;
//   assignee: string;
//   location: string;
//   next_assignee: string;
//   roommates: string[];
//   all_day: boolean;
// }

// const mockData: ChoreItem[] = [
//   {
//     id: "123",
//     name: "Vacuum",
//     details: "Empty when done!",
//     date: new Date("2026-03-09"),
//     completed: false,
//     assignee: "Leyna",
//     location: "Living Room",
//     next_assignee: "Elle",
//     repeat: 'daily',
//     roommates: ["Leyna", "Elle", "Ananya", "Sofia"],
//     all_day: false
//   },
//   {
//     id: "456",
//     name: "Wash Dishes",
//     details: "Please clear the drying rack before starting",
//     date: new Date("2026-03-09T20:36:26.989156Z"),
//     completed: true,
//     assignee: "Ananya",
//     location: "Kitchen",
//     next_assignee: "Sofia",
//     repeat: 'daily',
//     roommates: ["Ananya", "Sofia"],
//     all_day: true
//   }
// ]

export default function InventoryScreen() {
  const [choresList, setChoresList] = useState<choreAPI.ChoreDetail[]>([]);
  const [roommatesList, setRoommatesList] = useState<{
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
  }[]>([]);

  const [addItemVisible, setAddItemVisible] = useState(false);
  const [viewItemVisible, setViewItemVisible] = useState(false);
  const [editItemVisible, setEditItemVisible] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<choreAPI.ChoreDetail | null>(null);
  const [searchText, setSearchText] = useState('');

  const [locationFilterList, setLocationFilterList] = useState<string[]>([]);
  const [roommateFilterList, setRoommateFilterList] = useState<string[]>([]);
  const [completedFilter, setCompletedFilter] = useState<boolean>(true);
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);



  // TODO: have to create function that triggers when restock toggle is pressed
  useEffect(() => {
      const loadData = async () => {
        const filterData = await choreAPI.getChoreFilterOptions();
        const choreData = await choreAPI.getChores();
        const choresWithDates = choreData.map(chore => ({
          ...chore,
          due_date: new Date(chore.due_date),
        }));
        getRoommates();
  
        setLocationFilterList(filterData.locations);
        setRoommateFilterList(filterData.roommates);
        setChoresList(choresWithDates);
      };
  
      loadData();
    }, []);
    
    // add in date filters
    const applyFilterChanges = async () => {
      const data = await choreAPI.getChores({completed: completedFilter, assignee: roommateFilterList, location: locationFilterList});
      const choresWithDates = data.map(chore => ({
        ...chore,
        due_date: new Date(chore.due_date),
      }));
      setChoresList(choresWithDates);
  
    }
  
    const refreshChores = async () => {
      const data = await choreAPI.getChores();
      const choresWithDates = data.map(chore => ({
        ...chore,
        due_date: new Date(chore.due_date),
      }));
      setChoresList(choresWithDates);
    }
  
    const getChore = async (id: string) => {
      const chore = await choreAPI.getChoreById(id);
      chore.due_date = new Date(chore.due_date);
      console.log(chore);
      setSelectedItem(chore);
    }

    const getRoommates = async () => {
      const roommates = await getHouseholdRoommates();
      const filterRoommates= roommates.map(r => ({
        id: r.id,
        email: r.email,
        first_name: r.first_name,
        last_name: r.last_name,
        name: r.full_name
      }));
      setRoommatesList(filterRoommates);
    }


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
            {choresList
                .filter(item => {
                  if(!searchText) return true;
                  return item.title.toLowerCase().includes(searchText.toLowerCase());
                })
                .map((item) => (
                <ChoreTile
                  id={item.id}
                  title={item.title} 
                  completed={item.completed}
                  due_date={item.due_date ?? new Date()}
                  repeat={item.repeat_unit}
                  assignee={item.assignee}
                  onPress={() => {
                    getChore(item.id);
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

          <ChoreItemModal 
            visible={addItemVisible}
            onClose={() => setAddItemVisible(false)}
            title="Add Chore"
            save={async (chore) => {
              await choreAPI.createChore({
                title: chore.title ?? "",
                details: chore.details ?? "",
                due_date: chore.due_date ?? new Date(),
                repeat_unit: chore.repeat_unit ?? "daily",
                repeat_value: chore.repeat_value ?? 1,
                location: chore.location ?? "",
                is_rotating: chore.is_rotating ?? false,
                pass_to_next_unit: chore.pass_to_next_unit ?? "None",
                pass_to_next_value: chore.pass_to_next_value ?? 0,
                all_day: chore.all_day ?? true,
                roommates_involved: chore.roommates_involved || [],
              })
              refreshChores();
            }}
            allRoommates={roommatesList}
          />

          {selectedItem && (
            <ChoreViewModal 
              chore={selectedItem}
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
                choreAPI.deleteChore(selectedItem.id);
                setViewItemVisible(false);
                refreshChores();
              }}
            />
          )}

          {selectedItem && (
            <ChoreItemModal
              visible={editItemVisible}
              onClose={() => setEditItemVisible(false)}
              title="Edit Chore"
              chore={selectedItem}
              save={async (chore) => {
                if(!selectedItem) return;
                await choreAPI.updateChore(selectedItem.id, chore);
                refreshChores();
              }}
              allRoommates={roommatesList}
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