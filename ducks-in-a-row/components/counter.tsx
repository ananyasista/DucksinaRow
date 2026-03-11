import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

type CounterProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function Counter({ value, onChange }: CounterProps) {

  const decrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    onChange(value + 1);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={decrement}>
        <IconSymbol
            size={30}
            name='minus.circle'
            color="#000000"
        />
      </Pressable>

      <Text style={styles.value}>{value}</Text>

      <Pressable style={styles.button} onPress={increment}>
        <IconSymbol
            size={30}
            name='plus.circle'
            color="#000000"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 12,
    alignSelf: 'flex-start'
  },

  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center'
  },

  symbol: {
    fontSize: 22,
    fontWeight: '600'
  },

  value: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center'
  }
});