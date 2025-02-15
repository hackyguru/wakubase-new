import { useState, useEffect } from 'react';
import { getNodeUrl, getNodeType, settingsStore } from '@/store/settings';

export const useNodeHealth = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    const nodeType = getNodeType();
    const nodeUrl = getNodeUrl();

    // Early return if not a full node
    if (nodeType !== 'full') {
      setIsHealthy(false);
      return;
    }

    setIsChecking(true);
    try {
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${nodeUrl}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Only consider it healthy if we get a 200 OK response
      setIsHealthy(response.status === 200);
    } catch (error) {
      console.error('Node health check failed:', error);
      setIsHealthy(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Poll every 5 seconds
    const interval = setInterval(checkHealth, 5000);

    // Subscribe to store changes
    const unsubscribe = settingsStore.onDidChange('nodeUrl', () => {
      // Immediate check when URL changes
      checkHealth();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return { isHealthy, isChecking };
}; 