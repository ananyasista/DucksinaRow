import {StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import InvFilterModal from '@/components/inv-filter-modal';
import InvItemModal from '@/components/inv-item-modal';
import Octicons from "@expo/vector-icons/Octicons";

import InvItemTile from '@/components/inv-item-tile';



export default function InventoryScreen() {
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [restock, setRestock] = useState(false);


  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.fullLayout}>
          <Text style={styles.title}>Items</Text>
          <InvFilterModal title='Filters'/>

          <View>
            <InvItemTile title='Paper Towel' category='Kitchen' restock={restock} onChange={() => setRestock(!restock)}></InvItemTile>
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
    }

  
});
