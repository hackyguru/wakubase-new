import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getNodeType, getNodeUrl } from '@/store/settings';

export interface ContentData {
  timestamp: string;
  payload: string;
  contentTopic: string;
  isNew?: boolean;
}

export function useContentData(selectedTopicId: string | null, topic: string | undefined) {
  const [data, setData] = useState<ContentData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearData = useCallback(() => {
    setData([]);
  }, []);

  const deleteMessage = useCallback((timestamp: string) => {
    setData(prevData => prevData.filter(item => item.timestamp !== timestamp));
  }, []);

  const subscribeToTopic = useCallback(async (topic: string) => {
    const nodeUrl = getNodeUrl();
    try {
      console.log('Subscribing to topic:', topic);
      
      await axios.post(
        `${nodeUrl}/relay/v1/auto/subscriptions`,
        [topic],
        {
          headers: {
            'accept': 'text/plain',
            'content-type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response 
        ? `Failed to subscribe: ${err.response.status} - ${err.response.data}`
        : err.message || 'Failed to subscribe to topic';
      
      console.error('Subscription error:', {
        message: errorMessage,
        error: err,
        nodeUrl,
        topic
      });
      
      setError(errorMessage);
    }
  }, []);

  const fetchData = useCallback(async (topic: string) => {
    const nodeUrl = getNodeUrl();
    try {
      const encodedTopic = encodeURIComponent(topic);
      
      const response = await axios.get(
        `${nodeUrl}/relay/v1/auto/messages/${encodedTopic}`,
        { timeout: 5000 }
      );
      
      if (response.data?.length > 0) {
        setData(prevData => {
          const newData = response.data
            .filter((newItem: ContentData) => 
              newItem.contentTopic === topic && 
              !prevData.some(prevItem => prevItem.timestamp === newItem.timestamp)
            )
            .map((item: ContentData) => ({
              ...item,
              isNew: true
            }));
            
          if (newData.length > 0) {
            console.log('New messages received:', newData.length);
          }
          
          return [...newData, ...prevData];
        });
      }
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response 
        ? `Failed to fetch: ${err.response.status} - ${err.response.data}`
        : err.message || 'Failed to fetch data';
      
      console.error('Fetch error:', {
        message: errorMessage,
        error: err,
        nodeUrl,
        topic
      });
      
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    // Clear existing data when topic changes
    setData([]);
    
    if (!selectedTopicId || !topic || getNodeType() !== 'full') {
      return;
    }

    // Subscribe to topic initially
    subscribeToTopic(topic);

    // Set up polling for data
    const pollInterval = setInterval(() => {
      fetchData(topic);
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [selectedTopicId, topic, subscribeToTopic, fetchData]);

  return {
    data,
    error,
    clearData,
    deleteMessage
  };
} 