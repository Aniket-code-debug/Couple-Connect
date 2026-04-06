import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, SectionList, Image, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { usePairStore } from '../../store/usePairStore';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { Clock, Filter, Image as ImageIcon, Video, FileText, X } from 'lucide-react-native';

const MemoryGallery = () => {
  const { pairId } = usePairStore();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (!pairId) return;

    const q = query(
      collection(db, 'pairs', pairId, 'timeline'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() || new Date()
      }));

      // Filter
      const filtered = items.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'photos') return item.type === 'media' && !item.mediaUrl.includes('.mp4');
        if (filter === 'videos') return item.type === 'media' && item.mediaUrl.includes('.mp4');
        if (filter === 'text') return item.type === 'text';
        return true;
      });

      // Group by month
      const groups = filtered.reduce((acc, item) => {
        const month = format(item.date, 'MMMM yyyy');
        if (!acc[month]) acc[month] = [];
        acc[month].push(item);
        return acc;
      }, {});

      const newSections = Object.keys(groups).map(month => ({
        title: month,
        data: groups[month]
      }));

      setSections(newSections);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pairId, filter]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => item.type === 'media' && setSelectedMedia(item)}
      className="bg-gray-50 mb-3 rounded-2xl overflow-hidden border border-gray-100 flex-row"
    >
      {item.type === 'media' ? (
        <Image source={{ uri: item.mediaUrl }} className="w-24 h-24" />
      ) : (
        <View className="w-24 h-24 bg-rose-50 items-center justify-center">
          <FileText size={24} color="#f43f5e" />
        </View>
      )}
      <View className="flex-1 p-4 justify-center">
        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">{format(item.date, 'eee, d MMM • p')}</Text>
        <Text className="text-gray-800 font-medium" numberOfLines={2}>
          {item.type === 'text' ? item.content : 'Shared a memory'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-4 flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-gray-900">Timeline</Text>
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <Filter size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0 mb-6">
          {['all', 'photos', 'videos', 'text'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`mr-3 px-6 py-2.5 rounded-full ${filter === f ? 'bg-rose-600' : 'bg-gray-100'}`}
            >
              <Text className={`font-bold capitalize ${filter === f ? 'text-white' : 'text-gray-500'}`}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator className="mt-20" color="#f43f5e" />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-6 mb-4">{title}</Text>
            )}
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={<Text className="text-center text-gray-400 mt-20">No memories yet.</Text>}
          />
        )}
      </View>

      {/* Media Viewer Modal */}
      <Modal visible={!!selectedMedia} transparent animationType="fade">
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity 
            onPress={() => setSelectedMedia(null)}
            className="absolute top-12 right-6 z-10 p-2 bg-white/10 rounded-full"
          >
            <X size={24} color="white" />
          </TouchableOpacity>
          {selectedMedia && (
            <Image 
              source={{ uri: selectedMedia.mediaUrl }} 
              className="w-full h-[70%] rounded-xl"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MemoryGallery;
