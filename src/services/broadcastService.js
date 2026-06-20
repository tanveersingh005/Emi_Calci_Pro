/**
 * BroadcastChannel service for real-time tab communication.
 * Safe for Next.js SSR.
 */

const CHANNEL_NAME = 'emi_workspace_channel';

class BroadcastService {
  constructor() {
    this.channel = null;
    this.listeners = new Set();
  }

  init() {
    if (typeof window !== 'undefined' && !this.channel) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.listeners.forEach((listener) => listener(event.data));
      };
    }
  }

  subscribe(listener) {
    this.init();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  publish(type, payload) {
    this.init();
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (err) {
        console.error('Error posting message to BroadcastChannel:', err);
      }
    }
  }

  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

// Singleton instance
const broadcastService = new BroadcastService();
export default broadcastService;
