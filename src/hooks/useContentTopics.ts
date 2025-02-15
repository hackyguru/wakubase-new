import { useCallback, useEffect, useState } from 'react';
import { ContentTopic, contentTopicsStore } from '../store/contentTopics';

export function useContentTopics() {
  const [topics, setTopics] = useState<ContentTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  useEffect(() => {
    const initialTopics = contentTopicsStore.getTopics();
    setTopics(initialTopics);
    
    if (initialTopics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(initialTopics[0].id);
    }

    const unsubscribe = contentTopicsStore.subscribe(() => {
      const updatedTopics = contentTopicsStore.getTopics();
      setTopics(updatedTopics);
      
      // If the selected topic was deleted, select the first available topic
      if (selectedTopicId && !updatedTopics.find(topic => topic.id === selectedTopicId)) {
        setSelectedTopicId(updatedTopics.length > 0 ? updatedTopics[0].id : null);
      }
    });

    return () => unsubscribe();
  }, [selectedTopicId]);

  const addTopic = useCallback((topic: string) => {
    const newTopic = contentTopicsStore.addTopic(topic);
    setSelectedTopicId(newTopic.id);
    return newTopic;
  }, []);

  const deleteTopic = useCallback((id: string) => {
    contentTopicsStore.deleteTopic(id);
  }, []);

  return {
    topics,
    selectedTopicId,
    setSelectedTopicId,
    addTopic,
    deleteTopic,
  };
} 