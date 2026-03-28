import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../config/constants';

export const BAZAR_CATEGORIES = [
  { id: 'retail', label: 'Retail & Daily Use', icon: '🛒' },
  { id: 'food', label: 'Food & Dining', icon: '🍔' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'education', label: 'Education & Training', icon: '🎓' },
  { id: 'technical', label: 'Technical & Home Services', icon: '🔧' },
  { id: 'automobile', label: 'Automobile', icon: '🚗' },
  { id: 'construction', label: 'Construction & Material', icon: '🏗️' },
  { id: 'realestate', label: 'Real Estate', icon: '🏠' },
  { id: 'finance', label: 'Finance & Business', icon: '💰' },
  { id: 'fashion', label: 'Fashion & Beauty', icon: '👗' },
  { id: 'logistics', label: 'Logistics & Delivery', icon: '📦' },
  { id: 'govt', label: 'Offices & Government', icon: '🏢' },
  { id: 'religious', label: 'Religious & Welfare', icon: '🕌' },
  { id: 'events', label: 'Events & Entertainment', icon: '🎉' },
  { id: 'agriculture', label: 'Agriculture & Livestock', icon: '🌾' },
  { id: 'it', label: 'IT & Digital', icon: '💻' },
  { id: 'travel', label: 'Travel & Hospitality', icon: '🧳' },
  { id: 'security', label: 'Security & Safety', icon: '🛡️' },
  { id: 'media', label: 'Media & Communication', icon: '📰' },
  { id: 'legal', label: 'Legal & Consultancy', icon: '⚖️' },
  { id: 'ngo', label: 'NGOs & Community', icon: '🤝' },
  { id: 'jobs', label: 'Jobs & Employment', icon: '💼' },
  { id: 'pets', label: 'Pets & Animals', icon: '🐾' },
  { id: 'sports', label: 'Sports & Fitness', icon: '🏋️' },
  { id: 'transport', label: 'Transport & Ride Services', icon: '🚖' },
  { id: 'installment', label: 'Installment & Finance', icon: '🏦' },
  { id: 'misc', label: 'Miscellaneous', icon: '📦' },
];

export const FOOD_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'fastfood', label: 'Fast Food', icon: '🍔' },
  { id: 'pizza', label: 'Pizza', icon: '🍕' },
  { id: 'bbq', label: 'BBQ / Desi', icon: '🍖' },
  { id: 'bakery', label: 'Bakery/Sweets', icon: '🎂' },
  { id: 'juice', label: 'Juice / Shake', icon: '🥤' },
  { id: 'icecream', label: 'Ice Cream', icon: '🍦' },
  { id: 'dhaba', label: 'Tea / Dhaba', icon: '☕' },
  { id: 'catering', label: 'Catering', icon: '🍱' },
];

export function CategoryFilterBar({
  selected,
  onSelect,
  categories = BAZAR_CATEGORIES,
  style,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.filterBarContent, style]}
    >
      <TouchableOpacity
        style={[
          styles.filterChip,
          selected === null ? styles.filterChipActive : styles.filterChipInactive,
        ]}
        onPress={() => onSelect?.(null)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.filterChipText,
            selected === null ? styles.filterChipTextActive : styles.filterChipTextInactive,
          ]}
        >
          🔥 All
        </Text>
      </TouchableOpacity>

      {categories.map((cat) => {
        const active = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.filterChip,
              active ? styles.filterChipActive : styles.filterChipInactive,
            ]}
            onPress={() => onSelect?.(cat.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                active ? styles.filterChipTextActive : styles.filterChipTextInactive,
              ]}
            >
              {cat.icon} {cat.label.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function CategoryPicker({ value = [], onChange, maxSelect = 5 }) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const selected = Array.isArray(value) ? value : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BAZAR_CATEGORIES;
    return BAZAR_CATEGORIES.filter(
      (cat) => cat.label.toLowerCase().includes(q) || cat.id.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleCategory = (catId) => {
    const isSelected = selected.includes(catId);
    if (isSelected) {
      onChange?.(selected.filter((id) => id !== catId));
      return;
    }
    if (selected.length >= maxSelect) return;
    onChange?.([...selected, catId]);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        {selected.length === 0 ? (
          <Text style={styles.placeholder}>Select categories...</Text>
        ) : (
          <View style={styles.selectedWrap}>
            {selected.map((catId) => {
              const cat = BAZAR_CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <View key={catId} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>
                    {cat.icon} {cat.label.split(' ')[0]}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Select Categories</Text>
              <Text style={styles.modalSub}>{selected.length}/{maxSelect} selected</Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Done ✓</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              placeholderTextColor={COLORS.textLight}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {selected.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedStrip}
            >
              {selected.map((catId) => {
                const cat = BAZAR_CATEGORIES.find((c) => c.id === catId);
                if (!cat) return null;
                return (
                  <TouchableOpacity
                    key={catId}
                    onPress={() => toggleCategory(catId)}
                    style={styles.stripChip}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.stripChipText}>{cat.icon} {cat.label.split(' ')[0]} ✕</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <FlatList
            data={filtered}
            numColumns={3}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.id);
              const isDisabled = !isSelected && selected.length >= maxSelect;
              return (
                <TouchableOpacity
                  style={[
                    styles.catCell,
                    isSelected && styles.catCellSelected,
                    isDisabled && styles.catCellDisabled,
                  ]}
                  onPress={() => toggleCategory(item.id)}
                  disabled={isDisabled}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                  <Text style={styles.catIcon}>{item.icon}</Text>
                  <Text style={styles.catLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipTextInactive: {
    color: COLORS.text,
  },

  trigger: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'center',
  },
  placeholder: {
    color: COLORS.textLight,
    fontSize: 13,
  },
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedChip: {
    backgroundColor: COLORS.primary + '12',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  selectedChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  modalSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  doneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  searchWrap: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },

  selectedStrip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  stripChip: {
    backgroundColor: COLORS.primary + '12',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  stripChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  grid: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 24,
  },
  catCell: {
    flex: 1,
    margin: 6,
    minHeight: 118,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    position: 'relative',
  },
  catCellSelected: {
    backgroundColor: COLORS.primary + '12',
    borderColor: COLORS.primary,
  },
  catCellDisabled: {
    opacity: 0.35,
  },
  checkBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  catIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 15,
    fontWeight: '600',
  },
});
