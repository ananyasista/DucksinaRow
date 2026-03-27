import { View, StyleSheet, Text, Pressable, TouchableOpacity } from 'react-native';
import { IconSymbol, IconSymbolName } from './ui/icon-symbol';
import { PropsWithChildren } from 'react';

type ChipProps = PropsWithChildren<{
  title: string;
  iconName?: IconSymbolName;
  onPress?: () => void;
  selected?: boolean
}>;

export default function Chip({
  title,
  iconName,
  onPress,
  children,
  selected = false,
}: ChipProps) {

  const ContentContainer = onPress ? TouchableOpacity : View;
  const isSelectable = !!onPress;

  return (
      
      <ContentContainer onPress={onPress} style={[
        styles.chip, 
        isSelectable && !selected && styles.unselectedChip,
        selected && styles.selectedChip
      ]}>
        {iconName && (
        <IconSymbol
          style={styles.icon}
          size={30}
          name={iconName}
          color={
            selected
              ? "#ffffff"
              : isSelectable
              ? "#EC8534"
              : "#ffffff"
          }
        />
      )}

      <Text style={[
        styles.title, 
        isSelectable && !selected && styles.unselectedTitle,
        selected && styles.selectedTitle
      ]}>{title}</Text>

      {children}

      </ContentContainer>
  );
}

const styles = StyleSheet.create({
    chip: {
        backgroundColor: '#EC8534',
        borderRadius: 16,
        padding: 10,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignContent: 'center'
    },

    title: {
        textAlignVertical: 'center',
        color: '#ffffff',
        fontSize: 18
    },

    icon: {
        marginRight: 5
    },

    unselectedChip: {
      backgroundColor: '#ffffff',
      borderWidth: 2,
      borderColor: '#EC8534'
    },

    unselectedTitle: {
      color: '#EC8534'
    },

    selectedChip: {
     backgroundColor: '#EC8534',
      borderWidth: 2,
      borderColor: '#EC8534'
    },

    selectedTitle: {
      color: '#ffffff'
    }
});