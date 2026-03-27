import {StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';

import { SafeAreaView} from 'react-native-safe-area-context';

import Octicons from "@expo/vector-icons/Octicons";

import ChoreFilterModal from '@/components/chore-filter-modal';
import ChoreTile from '@/components/chore-tile';
import ChoreViewModal from '@/components/chore-view-modal';
import ChoreItemModal from '@/components/chore-item-modal';

import * as choreAPI from '@/api/chores';
import { getHouseholdRoommates } from '@/api/household';


export default function ChoreScreen() {
  const [choresList, setChoresList] = useState<choreAPI.Chore[]>([]);
  const [roommatesList, setRoommatesList] = useState<{
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
  }[]>([]);
  const [locationList, setLocationList] = useState<string[]>([]);
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [viewItemVisible, setViewItemVisible] = useState(false);
  const [editItemVisible, setEditItemVisible] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<choreAPI.Chore | null>(null);
  const [searchText, setSearchText] = useState('');

  const [locationFilterList, setLocationFilterList] = useState<string[]>([]);
  const [completedFilter, setCompletedFilter] = useState<boolean>(true);
  const [startDateFilter, setStartDateFilter] = useState<Date>(new Date());
  const [endDateFilter, setEndDateFilter] = useState<Date>(new Date());
  const [assigneeFilterList, setAssigneeFilterList] = useState<string[]>([]);


  // TODO: have to create function that triggers when restock toggle is pressed
  useEffect(() => {
      const loadData = async () => {
        const filterData = await choreAPI.getAssignmentFilterOptions();
        const choreData = await choreAPI.getChores();
        const choresWithAssignments = choreData.map(chore => {
          const allAssignments = chore.all_assignments.map((assignment: any) => ({
            ...assignment,
            due_date: assignment.due_date ? new Date(assignment.due_date) : new Date(),
          }));

          // Optional: pick the latest assignment by createdAt or due_date
          const latestAssignment = allAssignments.reduce((latest, current) =>
            current.due_date > latest.due_date ? current : latest
          , allAssignments[0]);

          return {
            ...chore,
            all_assignments: allAssignments,    // for rendering multiple cards
            latest_assignment: latestAssignment, // for filters, summary info
          };
        });
        getRoommates();
  
        setLocationList(filterData.locations);
        setRoommatesList(filterData.roommates);
        setChoresList(choresWithAssignments);
        // setLocationList()
      };
  
      loadData();
    }, []);
    
    // add in date filters
    const applyFilterChanges = async () => {
      const data = await choreAPI.getChores({
        completed: completedFilter, 
        assignee: assigneeFilterList, 
        location: locationFilterList, 
      });

      const choresWithDates = data.map(chore => ({
        ...chore,
        due_date: chore.latest_assignment.due_date ? new Date(chore.latest_assignment.due_date) : new Date(),
      }));

      console.log(assigneeFilterList);
      console.log(completedFilter);
      console.log(locationFilterList);
      console.log(data);
      setChoresList(choresWithDates);
    }
  
    const refreshChores = async () => {
      const data = await choreAPI.getChores();
      const choresWithDates = data.map(chore => ({
        ...chore,
        due_date: chore.latest_assignment.due_date ? new Date(chore.latest_assignment.due_date) : new Date(),
      }));
      setChoresList(choresWithDates);
    }
  
    const getChore = async (id: string) => {
      const chore = await choreAPI.getChoreById(id);
      chore.latest_assignment.due_date = chore.latest_assignment.due_date ? new Date(chore.latest_assignment.due_date) : new Date();
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
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={{paddingBottom: 100}}>
        <View style={styles.fullLayout}>
          <Text style={styles.title}>Chores</Text>
          <View style={{flexDirection: 'row', gap: 13}}>
            <ChoreFilterModal 
              title='Filters'
              locationFilterList={locationFilterList}
              assigneeFilterList={assigneeFilterList}
              completedFilter={completedFilter}
              startDateFilter={startDateFilter}
              endDateFilter={endDateFilter}
              setLocationFilterList={setLocationFilterList}
              setAssigneeFilterList={setAssigneeFilterList}
              setCompletedFilter={setCompletedFilter}
              setEndDateFilter={setEndDateFilter}
              setStartDateFilter={setStartDateFilter}
              assigneeList={roommatesList}
              locationList={locationList}
              onApply={() => applyFilterChanges()}

            />
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
                .filter(chore => {
                  if(!searchText) return true;
                  return chore.title.toLowerCase().includes(searchText.toLowerCase());
                })
                .map((chore) => (
                <ChoreTile
                  key={chore.id}
                  id={chore.id}
                  title={chore.title} 
                  completed={chore.latest_assignment.completed ?? false}
                  due_date={chore.latest_assignment.due_date ?? new Date}
                  repeat={chore.repeat_unit}
                  assignee={chore.latest_assignment.assignee ?? undefined}
                  onPress={() => {
                    getChore(chore.id);
                    setSelectedItem(chore);
                    setViewItemVisible(true);
                  }}
                  onChange={async (completed) => {
                    try {
                        await choreAPI.updateChore(chore.id, choreAPI.buildChorePatch(chore, {
                          title: chore.title,
                          details: chore.details,
                          location: chore.location,
                          allDay: chore.latest_assignment.all_day,
                          dueDate: chore.latest_assignment.due_date,
                          completed: completed,
                          repeatUnit: chore.repeat_unit,
                          repeatValue: chore.repeat_value,
                          passToNextUnit: chore.pass_to_next_unit ?? "weeks",
                          passToNextValue: chore.pass_to_next_value ?? 1,
                          isRotating: chore.is_rotating,
                          roommates: chore.roommates_involved
                        }));
                      } catch (err: any) {
                        console.log("ERROR RESPONSE:", err.response?.data);
                        console.log("STATUS:", err.response?.status);
                      }
                    }}
                />
              ))
            }
          </View>  

          <ChoreItemModal 
            visible={addItemVisible}
            onClose={() => setAddItemVisible(false)}
            title="Add Chore"
            save={async (chore) => {
              try {
                await choreAPI.createChore({
                  title: chore.title ?? "",
                  details: chore.details ?? "",
                  due_date: chore.latest_assignment?.due_date ?? new Date(),
                  all_day: chore.latest_assignment?.all_day ?? true, 
                  repeat_unit: chore.repeat_unit ?? "days",
                  repeat_value: chore.repeat_value ?? 1,
                  location: chore.location ?? "",
                  is_rotating: chore.is_rotating ?? false,
                  pass_to_next_unit: chore.pass_to_next_unit ?? "None",
                  pass_to_next_value: chore.pass_to_next_value ?? 0,
                  roommates_involved: chore.roommates_involved || [],
                })
              } catch (err: any){
                console.log("ERROR", err.response?.data);
              }
              
              await refreshChores();
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
                console.log(selectedItem);
                setViewItemVisible(false);
                setEditItemVisible(true);
              }}
              onDelete={() => {
                choreAPI.deleteChoreAssignment(selectedItem.id);
                setViewItemVisible(false);
                refreshChores();
              }}
              onComplete={async (completed) => {
                    try {
                        await choreAPI.updateChore(selectedItem.id, choreAPI.buildChorePatch(selectedItem, {
                          title: selectedItem.title,
                          details: selectedItem.details,
                          location: selectedItem.location,
                          allDay: selectedItem.latest_assignment.all_day,
                          dueDate: selectedItem.latest_assignment.due_date,
                          completed: completed,
                          repeatUnit: selectedItem.repeat_unit,
                          repeatValue: selectedItem.repeat_value,
                          passToNextUnit: selectedItem.pass_to_next_unit ?? "weeks",
                          passToNextValue: selectedItem.pass_to_next_value ?? 1,
                          isRotating: selectedItem.is_rotating,
                          roommates: selectedItem.roommates_involved
                        }));
                      } catch (err: any) {
                        console.log("ERROR RESPONSE:", err.response?.data);
                        console.log("STATUS:", err.response?.status);
                      }
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
                await refreshChores();
              }}
              allRoommates={roommatesList}
            />
            
          )}
          
          

        </View>    
      </ScrollView>
        <View style={styles.addButton}>
          <TouchableOpacity onPress={() => setAddItemVisible(true)}>
            <Octicons name='plus' size = {30} color='#fff'/>
          </TouchableOpacity>
        </View>
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
        backgroundColor: '#79997E',
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 25,
        right: 25,
        zIndex: 3000
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