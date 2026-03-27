import {StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import InvFilterModal from '@/components/inv-filter-modal';
import InvItemModal from '@/components/inv-item-modal';
import Octicons from "@expo/vector-icons/Octicons";

import InvItemTile from '@/components/inv-item-tile';
import InvViewModal from '@/components/inv-view-modal';

import * as invAPI from '@/api/inventory';
import { ThemedText } from '@/components/themed-text';

export default function InventoryScreen() {
  const [itemList, setItemList] = useState<invAPI.InventoryDetails[]>([]);
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
    itemList.map(item => console.log("ITEM:", item.name, item.restock_needed));
    
  }, []);

  const applyFilterChanges = async () => {
    const data = await invAPI.getInventory({restock_needed: stockFilter, purchased_by: purchaseFilterList, location: locationFilterList});
    setItemList(data);

  }

  const refreshItems = async () => {
    const data = await invAPI.getInventory();
    setItemList(data);
  }

  const getItem = async (id: string) => {
    const item = await invAPI.getItemById(id);
    item.last_purchased_date = new Date(item.last_purchased_date);
    setSelectedItem(item);
  }

  const handleRestockToggle = async (newValue: boolean, item: string) => {
    const id = item;
    setItemList(prev => prev.map(i => i.id === id ? { ...i, restock_needed: restock } : i));

    await invAPI.updateItem(item, {
      restock_needed: newValue,
    })
    await refreshItems();
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
            />
            <TextInput 
                style={styles.input}
                onChangeText={setSearchText}
                value={searchText}
                placeholder='Search'
                placeholderTextColor='rgba(171, 164, 164, 0.58)'
            />
          </View>
          
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
                  onChange={(newValue) => handleRestockToggle(newValue, item.id)}
                  onPress={() => {
                    getItem(item.id);
                    setViewItemVisible(true);
                  }}
                />
              ))
            }
          </View>

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

          {selectedItem && (
            <InvViewModal 
              item = {selectedItem}
              visible = {viewItemVisible}
              onClose={() => {
                setViewItemVisible(false)
                refreshItems();
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
        backgroundColor: '#4DC591',
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 25,
        right: 25,
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
