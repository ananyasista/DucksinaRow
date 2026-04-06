import {StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

import InvFilterModal from '@/components/inv-filter-modal';
import InvItemModal from '@/components/inv-item-modal';
import Octicons from "@expo/vector-icons/Octicons";

import InvItemTile from '@/components/inv-item-tile';
import InvViewModal from '@/components/inv-view-modal';

import * as invAPI from '@/api/inventory';
import { ThemedText } from '@/components/themed-text';

import { useInventorySocket } from '@/hooks/use-inventory-socket';


export default function InventoryScreen() {
  const [itemList, setItemList] = useState<invAPI.InventoryDetails[]>([]);
  const { inventory: socketInventory } = useInventorySocket();
  const [locationList, setLocationList] = useState<string[]>([]);
  const [purchaseList, setPurchaseList] = useState<{ label: string; value: string }[]>([]);

  const [addItemVisible, setAddItemVisible] = useState(false);
  const [viewItemVisible, setViewItemVisible] = useState(false);
  const [editItemVisible, setEditItemVisible] = useState(false);
  const [restock, setRestock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<invAPI.InventoryDetails | null>(null);
  const [searchText, setSearchText] = useState('');

  const [locationFilterList, setLocationFilterList] = useState<string[]>([]);
  const [purchaseFilterList, setPurchaseFilterList] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      const filterData = await invAPI.getInventoryFilterOptions();
      const itemData = await invAPI.getInventory();

      setLocationList(filterData.locations);
      setPurchaseList(filterData.purchased_by);
      setItemList(itemData);
    };

    loadData();
  }, []);

  // Merge socket updates into itemList and selectedItem
  useEffect(() => {
    if (socketInventory.length > 0) {
      setItemList(prev => {
        const updated = [...prev];
        socketInventory.forEach(socketItem => {
          const index = updated.findIndex(i => i.id === socketItem.id);
          if (index > -1) {
            // Update existing item
            updated[index] = socketItem;
          } else {
            // Add new item from socket
            updated.push(socketItem);
          }
        });
        return updated;
      });

      // Update selectedItem if it's being viewed and received a socket update
      if (selectedItem) {
        const updatedItem = socketInventory.find(item => item.id === selectedItem.id);
        if (updatedItem) {
          setSelectedItem(updatedItem);
        }
      }
    }
  }, [socketInventory, selectedItem?.id]);

  const applyFilterChanges = async () => {
    const data = await invAPI.getInventory({restock_needed: stockFilter, purchased_by: purchaseFilterList, location: locationFilterList});
    setItemList(data);

  }

  const refreshItems = async () => {
    const data = await invAPI.getInventory();
    setItemList(data);
    return data;
  }

  const getItem = async (id: string) => {
    const item = await invAPI.getItemById(id);
    item.last_purchased_date = new Date(item.last_purchased_date);
    setSelectedItem(item);
  }

  const handleRestockToggle = async (newValue: boolean, itemId: string) => {
    // Optimistic update: immediately update UI with the new value
    const originalItem = itemList.find(i => i.id === itemId);
    setItemList(prev => prev.map(i => i.id === itemId ? { ...i, restock_needed: newValue } : i));

    // Update selected item if currently viewing it
    if (selectedItem?.id === itemId) {
      setSelectedItem(prev => prev ? { ...prev, restock_needed: newValue } : prev);
    }

    try {
      // Persist change to backend
      await invAPI.updateItem(itemId, {
        restock_needed: newValue,
      });
    } catch (error) {
      // Revert on error
      if (originalItem) {
        setItemList(prev => prev.map(i => i.id === itemId ? originalItem : i));
        if (selectedItem?.id === itemId) {
          setSelectedItem(originalItem);
        }
      }
      console.error('Failed to update restock status:', error);
    }
  }
 
  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{paddingBottom: 40}}>
        <View style={styles.fullLayout}>
          <ThemedText type="title">Items</ThemedText>
          <View style={{flexDirection: 'row', gap: 13}}>
            <InvFilterModal 
              title='Filters'
              locationFilterList={locationFilterList}
              setLocationFilterList={setLocationFilterList}
              purchaseFilterList={purchaseFilterList}
              setPurchaseFilterList={setPurchaseFilterList}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              locationList={locationList}
              purchaseList={purchaseList}
              onApply={() => applyFilterChanges()}
              onClear={() => refreshItems()}
            />
            <TextInput 
                style={styles.input}
                onChangeText={setSearchText}
                value={searchText}
                placeholder='Search'
                placeholderTextColor='rgba(171, 164, 164, 0.58)'
            />
          </View>

          {/* VIEW TILES */}
          <View style={styles.section}>
            {itemList
                .filter(item => {
                  if(!searchText) return true;
                  return item.name.toLowerCase().includes(searchText.toLowerCase());
                })
                .map((item) => (
                <InvItemTile
                  key={item.id}
                  id={item.id}
                  title={item.name} 
                  category={item.location ?? ''}
                  restock={item.restock_needed}
                  quantity={item.quantity}
                  onChange={(value) => handleRestockToggle(value, item.id)} // consider passing by reference 
                  onPress={() => {
                    getItem(item.id);
                    setViewItemVisible(true);
                  }}
                />
              ))
            }
          </View>
          
          {/* CREATE ITEM */}
          <InvItemModal 
            visible = {addItemVisible}
            onClose = {() => setAddItemVisible(false)}
            title = "Add Item"
            save={async (item) => {
                await invAPI.createItem({
                  name: item.name ?? "",
                  details: item.details ?? "",
                  location: item.location ?? null,
                  quantity: item.quantity ?? 1,
                  restock_needed: false,
                });

              refreshItems();
            }}
          />

          {/* VIEW ITME MODAL */}
          {selectedItem && (
            <InvViewModal 
              item = {selectedItem}
              visible = {viewItemVisible}
              onClose={() => {
                setViewItemVisible(false)
                // Refresh data and sync selectedItem with fresh data
                refreshItems().then((freshData) => {
                  if (selectedItem) {
                    const updatedItem = freshData.find(i => i.id === selectedItem.id);
                    if (updatedItem) {
                      setSelectedItem(updatedItem);
                    }
                  }
                });
              }}
              onEdit = {() => {
                setViewItemVisible(false);
                setEditItemVisible(true);
              }}
              onDelete={() => {
                invAPI.deleteItem(selectedItem.id);
                setViewItemVisible(false);
                refreshItems();
              }}
              onRestockChange={handleRestockToggle}
            />
          )}

          {/* EDIT ITEM */}
          {selectedItem && (
            <InvItemModal 
            visible = {editItemVisible}
            onClose = {() => setEditItemVisible(false)}
            title = "Edit Item"
            item = {selectedItem}
            save={async (item) => {
              if (!selectedItem) return;
              await invAPI.updateItem(selectedItem.id, item);
              refreshItems();
            }}
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
        bottom: 40,
        right: 30,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5
    },
  
  input: {
    borderWidth: 1,
    padding: 5,
    borderColor: '#ABA4A461',
    backgroundColor: '#F6F4F4C4',
    borderRadius: 13,
    fontSize: 16,
    flex: 2
  }

  
});
