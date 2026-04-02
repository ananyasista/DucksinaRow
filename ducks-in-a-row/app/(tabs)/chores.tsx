import {StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';

import { SafeAreaView} from 'react-native-safe-area-context';

import Octicons from "@expo/vector-icons/Octicons";

import ChoreFilterModal from '@/components/chore-filter-modal';
import ChoreTile from '@/components/chore-tile';
import ChoreViewModal from '@/components/chore-view-modal';
import ChoreItemModal from '@/components/chore-item-modal';

import * as choreAPI from '@/api/chores';
import { getHouseholdRoommates, getHouseholdName } from '@/api/household';

import { useChoreSocket } from '@/hooks/use-chore-socket';


export default function ChoreScreen() {
  const [choresList, setChoresList] = useState<choreAPI.ChoreAssignment[]>([]);
  const [roommatesList, setRoommatesList] = useState<choreAPI.UserSummary[]>([]);
  const [locationList, setLocationList] = useState<string[]>([]);
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [viewItemVisible, setViewItemVisible] = useState(false);
  const [editItemVisible, setEditItemVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<choreAPI.ChoreAssignment | null>(null);
  const [searchText, setSearchText] = useState('');

  const [locationFilterList, setLocationFilterList] = useState<string[]>([]);
  const [completedFilter, setCompletedFilter] = useState<boolean>(true);
  const [startDateFilter, setStartDateFilter] = useState<Date>(new Date());
  const [endDateFilter, setEndDateFilter] = useState<Date>(new Date());
  const [assigneeFilterList, setAssigneeFilterList] = useState<string[]>([]);

  const [householdId, setHouseholdId] = useState<string | null>(null);
  const { chores: socketChores } = useChoreSocket();

  useEffect(() => {
    const loadData = async () => {
      const household = await getHouseholdName();
      setHouseholdId(household.id);

      const filterData = await choreAPI.getAssignmentFilterOptions();
      const choreData = await choreAPI.getChoreAssignments();
      const choresWithAssignments = choreData.map((assignment: choreAPI.ChoreAssignment) => {
        const parsedAssignment: choreAPI.ChoreAssignment = {
          ...assignment,
          due_date: assignment.due_date ? new Date(assignment.due_date) : new Date(),
          completed_date: assignment.completed_date ? new Date(assignment.completed_date) : null,
        };

        return parsedAssignment;
      });
    
      const choresMap: Record<string, { all_assignments: choreAPI.ChoreAssignment[]; latest_assignment: choreAPI.ChoreAssignment }> = {};

      choresWithAssignments.forEach(assignment => {
        const choreId = assignment.chore.id;
        if (!choresMap[choreId]) {
          choresMap[choreId] = {
            all_assignments: [assignment],
            latest_assignment: assignment,
          };
        } else {
          choresMap[choreId].all_assignments.push(assignment);

          // Update latest assignment based on due_date
          if (assignment.due_date > choresMap[choreId].latest_assignment.due_date) {
            choresMap[choreId].latest_assignment = assignment;
          }
        }
      });

      getRoommates();
      setLocationList(filterData.locations);
      setRoommatesList(filterData.roommates);
      setChoresList(choresWithAssignments);
    };

    loadData();
  }, []);
  
  // add in date filters
  const applyFilterChanges = async () => {
    const data = await choreAPI.getChoreAssignments({
      completed: completedFilter, 
      assignee: assigneeFilterList, 
      location: locationFilterList, 
    });

    const choresWithDates = data.map(chore => ({
      ...chore,
      due_date: chore.due_date ? new Date(chore.due_date) : new Date(),
    }));

    console.log(assigneeFilterList);
    console.log(completedFilter);
    console.log(locationFilterList);
    console.log(data);
    setChoresList(choresWithDates);
  }

  const refreshChores = async () => {
    const data = await choreAPI.getChoreAssignments();
    const choresWithDates = data.map(chore => ({
      ...chore,
      due_date: chore.due_date ? new Date(chore.due_date) : new Date(),
    }));
    setChoresList(choresWithDates);

    // Sync selectedItem if modal is open
    if (selectedItem) {
      const updatedChore = choresWithDates.find(c => c.id === selectedItem.id);
      if (updatedChore) {
        setSelectedItem(updatedChore);
      }
    }

    return choresWithDates;
  }

  const getChore = async (id: string) => {
    const chore = await choreAPI.getChoreAssignmentById(id);
    chore.due_date = chore.due_date ? new Date(chore.due_date) : new Date();
    setSelectedItem(chore);
  }

  const getRoommates = async () => {
    const roommates = await getHouseholdRoommates();
    const filterRoommates= roommates.map(r => ({
      id: r.id,
      email: r.email,
      first_name: r.first_name,
      last_name: r.last_name,
      name: r.full_name ?? "",
      display_color: r.display_color ?? "#3f4ba1"
    }));
    setRoommatesList(filterRoommates);
  }

  // Merge socket updates into choresList and selectedItem
  useEffect(() => {
    if (socketChores.length > 0) {
      setChoresList(prev => {
        const updated = [...prev];
        socketChores.forEach(socketChore => {
          const index = updated.findIndex(c => c.id === socketChore.id);
          if (index > -1) {
            // Update existing chore
            updated[index] = socketChore;
          } else {
            // Add new chore from socket
            updated.push(socketChore);
          }
        });
        return updated;
      });

      // Update selectedItem if it's being viewed and received a socket update
      if (selectedItem) {
        const updatedChore = socketChores.find(chore => chore.id === selectedItem.id);
        if (updatedChore) {
          setSelectedItem(updatedChore);
        }
      }
    }
  }, [socketChores]);

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
                  return chore.chore.title.toLowerCase().includes(searchText.toLowerCase());
                })
                .map((chore) => (
                <ChoreTile
                  key={chore.id}
                  id={chore.id}
                  title={chore.chore.title} 
                  completed={chore.completed ?? false}
                  due_date={chore.due_date ?? new Date}
                  repeat={chore.chore.repeat_unit}
                  assignee={chore.assignee ?? undefined}
                  onPress={() => {
                    getChore(chore.id);
                    setSelectedItem(chore);
                    setViewItemVisible(true);
                  }}
                  onChange={async (completed) => {
                    try {
                        var { chorePatch, choreAssignmentPatch } = choreAPI.buildChorePatch(chore, {
                          title: chore.chore.title,
                          details: chore.chore.details,
                          location: chore.chore.location,
                          allDay: chore.all_day,
                          dueDate: chore.due_date,
                          completed: completed,
                          repeatUnit: chore.chore.repeat_unit,
                          repeatValue: chore.chore.repeat_value,
                          passToNextUnit: chore.chore.pass_to_next_unit ?? "weeks",
                          passToNextValue: chore.chore.pass_to_next_value ?? 1,
                          isRotating: chore.chore.is_rotating,
                          roommates: chore.chore.roommates_involved
                        });
                        if (Object.keys(chorePatch).length > 0) {
                          await choreAPI.updateChore(chore.chore.id, chorePatch);
                        }
                        if (Object.keys(choreAssignmentPatch).length > 0) {
                          await choreAPI.updateAssignment(chore.id, choreAssignmentPatch);
                        }
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
              const { create } = chore;
              try {
                if (create) {
                  await choreAPI.createChore({
                  title: create.title ?? "",
                  details: create.details ?? "",
                  due_date: create.due_date ?? new Date(),
                  all_day: create.all_day ?? true, 
                  repeat_unit: create.repeat_unit ?? "days",
                  repeat_value: create.repeat_value ?? 1,
                  location: create.location ?? "",
                  is_rotating: create.is_rotating ?? false,
                  pass_to_next_unit: create.pass_to_next_unit ?? "None",
                  pass_to_next_value: create.pass_to_next_value ?? 0,
                  roommates_involved: create.roommates_involved || [],
                })
                }
                
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
                // Refresh data and sync selectedItem
                refreshChores();
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
                        var { chorePatch, choreAssignmentPatch } = choreAPI.buildChorePatch(selectedItem, {
                          title: selectedItem.chore.title,
                          details: selectedItem.chore.details,
                          location: selectedItem.chore.location,
                          allDay: selectedItem.all_day,
                          dueDate: selectedItem.due_date,
                          completed: completed,
                          repeatUnit: selectedItem.chore.repeat_unit,
                          repeatValue: selectedItem.chore.repeat_value,
                          passToNextUnit: selectedItem.chore.pass_to_next_unit ?? "weeks",
                          passToNextValue: selectedItem.chore.pass_to_next_value ?? 1,
                          isRotating: selectedItem.chore.is_rotating,
                          roommates: selectedItem.chore.roommates_involved
                        });
                        if (Object.keys(chorePatch).length > 0) {
                          await choreAPI.updateChore(selectedItem.chore.id, chorePatch);
                        }
                        if (Object.keys(choreAssignmentPatch).length > 0) {
                          await choreAPI.updateAssignment(selectedItem.id, choreAssignmentPatch);
                        }
                        // Refresh data to sync tiles
                        // await refreshChores();
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
              save={async (updatedItem) => {
                if(!selectedItem) return;
                try {
                  const { chorePatch, choreAssignmentPatch } = updatedItem;

                  if (chorePatch && Object.keys(chorePatch).length > 0) {
                    await choreAPI.updateChore(selectedItem.chore.id, chorePatch);
                  }

                  if (choreAssignmentPatch && Object.keys(choreAssignmentPatch).length > 0) {
                    await choreAPI.updateAssignment(selectedItem.id, choreAssignmentPatch);
                  }

                  await refreshChores();
                } catch (err: any) {
                  console.log("ERROR RESPONSE:", err.response?.data);
                  console.log("STATUS:", err.response?.status);
                }
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