import { Response } from 'express';

interface SSEClient {
  id: string;
  userId?: string;
  res: Response;
}

class RealtimeHub {
  private clients: Map<string, SSEClient> = new Map();

  constructor() {
    // Send periodic heartbeats every 25 seconds to keep connection alive
    setInterval(() => {
      this.broadcast('HEARTBEAT', { timestamp: new Date().toISOString() });
    }, 25000);
  }

  addClient(id: string, res: Response, userId?: string) {
    this.clients.set(id, { id, userId, res });
    
    // Initial welcome event
    this.sendToClient(id, 'CONNECTED', { clientId: id, connectedAt: new Date().toISOString() });
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  sendToClient(clientId: string, eventType: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        this.clients.delete(clientId);
      }
    }
  }

  sendToUser(userId: string, eventType: string, data: any) {
    for (const [id, client] of this.clients.entries()) {
      if (client.userId === userId) {
        try {
          client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch (err) {
          this.clients.delete(id);
        }
      }
    }
  }

  broadcast(eventType: string, data: any) {
    const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(message);
      } catch (err) {
        this.clients.delete(id);
      }
    }
  }

  getConnectedCount(): number {
    return this.clients.size;
  }
}

export const realtime = new RealtimeHub();
