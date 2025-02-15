import { INodeService, NodeConfig } from './types';
import { FullNodeService } from './FullNodeService';

export class NodeServiceFactory {
  static createNodeService(config: NodeConfig): INodeService {
    switch (config.type) {
      case 'full':
        return new FullNodeService(config);
      case 'light':
        // TODO: Implement light node service
        throw new Error('Light node service not yet implemented');
      default:
        throw new Error('Invalid node type');
    }
  }
} 