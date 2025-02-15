export interface INodeService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(topic: string, message: string): Promise<void>;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
}

export interface NodeConfig {
  type: 'full' | 'light';
  url: string;
  networkType?: 'bootstrap' | 'custom';
  customNetworkUrl?: string;
} 