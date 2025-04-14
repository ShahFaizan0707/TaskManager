// services/websocketService.ts
import {
  IWebSocketMessage,
  IUser,
  TaskStatus
} from '../types/project';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  // Properties to store for reconnection
  private userId: number | null = null;
  private projectId: number | null = null;

  // Connect to WebSocket server
  connect(userId: number, projectId?: number): Promise<void> {
    console.log('Connecting to WebSocket server...', userId, projectId);
    return new Promise<void>((resolve, reject) => {
      try {
        // Store for reconnection
        this.userId = userId;
        if (projectId) this.projectId = projectId;

        const apiUrl = import.meta.env.VITE_APP_WS_URL || "ws://localhost:3000";

        const wsBase = apiUrl.replace(/^http/, 'ws');
        // Fix: Use /ws instead of /api/ws to match server configuration
        const url = `${wsBase}/ws?userId=${userId}${projectId ? `&projectId=${projectId}` : ''}`;

        console.log('WebSocket URL:', url);
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          this.startPingInterval();
          resolve();
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket connection closed', event);
          this.handleDisconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const message: IWebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Join a project - as implemented in the backend
  joinProject(projectId: number): void {
    this.projectId = projectId;
    console.log('Joining project:', projectId, "with userId:", this.userId);
    this.sendMessage('JOIN_PROJECT', { projectId, userId: this.userId });
  }

  // Leave a project - as implemented in the backend
  leaveProject(): void {
    const projectId = this.projectId;
    this.projectId = null;
    if (projectId) {
      this.sendMessage('LEAVE_PROJECT', { projectId });
    }
  }

  // Send a typing notification - as implemented in the backend
  sendTyping(context: 'project' | 'task', contextId: string): void {
    this.sendMessage('USER_TYPING', { context, contextId });
  }

  // Send task status change - as implemented in the backend
  sendTaskStatusChange(taskId: string, status: TaskStatus): void {
    this.sendMessage('TASK_STATUS_CHANGE', { taskId, status });
  }

  // Send a new task message - NEW METHOD
  sendTaskMessage(taskId: string, content: string): void {
    this.sendMessage('NEW_TASK_MESSAGE', { taskId, content });
  }

  // Send custom message
  sendMessage(type: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      window.location.href = `/project/${this.projectId}`;
      console.warn('WebSocket is not connected, message not sent');
    }
  }

  // Add event listener
  on(type: string, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  // Remove event listener
  off(type: string, callback: (data: any) => void): void {
    this.listeners.get(type)?.delete(callback);
  }

  // Remove all listeners of a specific type
  removeAllListeners(type: string): void {
    this.listeners.delete(type);
  }

  // Handle incoming message
  private handleMessage(message: IWebSocketMessage): void {

    const callbacks = this.listeners.get(message.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error('Error in WebSocket listener callback:', error);
        }
      });
    }
  }

  // Handle disconnection and reconnection
  private handleDisconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId, this.projectId || undefined)
            .catch(error => console.error('Reconnection failed:', error));
        }
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error('Maximum reconnection attempts reached');
    }
  }

  // Keep connection alive with ping/pong
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.sendMessage('PING', { timestamp: new Date().toISOString() });
    }, 30000); // Send ping every 30 seconds
  }


  // Get active users in a project - Fix: Update the API endpoint
  async getActiveProjectUsers(projectId: string): Promise<IUser[]> {
    try {
      const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/ws/active-users/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching active project users:', error);
      return [];
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;