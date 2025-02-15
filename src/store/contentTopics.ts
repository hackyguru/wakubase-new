const CONTENT_TOPICS_KEY = 'wakubase_content_topics';

export interface ContentTopic {
  id: string;
  topic: string;
  createdAt: string;
}

class ContentTopicsStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeStore();
  }

  private initializeStore(): void {
    try {
      if (!localStorage.getItem(CONTENT_TOPICS_KEY)) {
        localStorage.setItem(CONTENT_TOPICS_KEY, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Failed to initialize content topics store:', error);
    }
  }

  getTopics(): ContentTopic[] {
    try {
      const topics = localStorage.getItem(CONTENT_TOPICS_KEY);
      return topics ? JSON.parse(topics) : [];
    } catch (error) {
      console.error('Failed to get content topics:', error);
      return [];
    }
  }

  addTopic(topic: string): ContentTopic {
    try {
      const topics = this.getTopics();
      const newTopic: ContentTopic = {
        id: crypto.randomUUID(),
        topic,
        createdAt: new Date().toISOString(),
      };
      
      topics.unshift(newTopic);
      localStorage.setItem(CONTENT_TOPICS_KEY, JSON.stringify(topics));
      this.notifyListeners();
      return newTopic;
    } catch (error) {
      console.error('Failed to add content topic:', error);
      throw error;
    }
  }

  deleteTopic(id: string): void {
    try {
      const topics = this.getTopics();
      const filteredTopics = topics.filter(topic => topic.id !== id);
      
      // Only update if we actually removed a topic
      if (filteredTopics.length !== topics.length) {
        localStorage.setItem(CONTENT_TOPICS_KEY, JSON.stringify(filteredTopics));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to delete content topic:', error);
      throw error;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Failed to notify listener:', error);
      }
    });
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const contentTopicsStore = new ContentTopicsStore(); 