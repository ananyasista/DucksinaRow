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




export default function InventoryScreen() {
  const [itemList, setItemList] = useState<invAPI.InventoryDetails[]>([]);
  const [locationList, setLocationList] = useState<string[]>([]);
  const [purchaseList, setPurchaseList] = useState<Map<string,string>>(new Map());

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

  const applyFilterChanges = async () => {
    const data = await invAPI.getInventory({restock_needed: stockFilter, purchased_by: purchaseFilterList, location: locationFilterList});
    setItemList(data);

  }
 


  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.fullLayout}>
          <Text style={styles.title}>Items</Text>
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
                <InvItemTile
                  id={item.id}
                  title={item.name} 
                  category={item.location}
                  restock={item.restock_needed} 
                  onChange={() => setRestock(!restock)}
                  onPress={() => {
                    setSelectedItem(item);
                    setViewItemVisible(true);
                  }}
                />
              ))
            }
          </View>


          <View style={styles.addButton}>
            <TouchableOpacity onPress={() => setAddItemVisible(true)}>
              <Octicons name='plus' size = {30} color='#fff'/>
            </TouchableOpacity>
          </View>

          <InvItemModal 
            visible = {addItemVisible}
            onClose = {() => setAddItemVisible(false)}
            title = "Add Item"
          />

          {selectedItem && (
            <InvViewModal 
              item = {selectedItem}
              visible = {viewItemVisible}
              onClose={() => setViewItemVisible(false)}
              onEdit = {() => {
                setViewItemVisible(false);
                setEditItemVisible(true);
              }}
              onDelete={() => {
                setViewItemVisible(false);
                // TODO: add delete function call here
              }}
            />
          )}

          {selectedItem && (
            <InvItemModal 
            visible = {editItemVisible}
            onClose = {() => setEditItemVisible(false)}
            title = "Edit Item"
            item = {selectedItem}
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
