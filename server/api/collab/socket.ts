import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Server as SocketIOServer } from 'socket.io';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse } from '../../utils/response';
import { WebSocketEvent } from '../../types';

class CollaborationManager {
  private io: SocketIOServer;
  private activeConnections: Map<string, any> = new Map();
  private projectRooms: Map<string, Set<string>> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: any) {
    const userId = socket.handshake.auth.userId;
    const projectId = socket.handshake.auth.projectId;
    const username = socket.handshake.auth.username;
    const joinCode = socket.handshake.auth.joinCode;

    if (!userId || !projectId || !username) {
      socket.disconnect();
      return;
    }

    this.activeConnections.set(socket.id, {
      userId,
      projectId,
      username,
      socket,
    });

    socket.join(projectId);
    this.addToProjectRoom(projectId, socket.id);

    this.setupSocketHandlers(socket, userId, projectId, username);
    this.startHeartbeat(socket.id);

    this.broadcastToProject(projectId, 'user_join', {
      userId,
      username,
      timestamp: new Date(),
    });
  }

  private setupSocketHandlers(socket: any, userId: string, projectId: string, username: string) {
    socket.on('cursor_move', (data: any) => {
      this.broadcastToProject(projectId, 'cursor_move', {
        userId,
        username,
        cursor: data.cursor,
        timestamp: new Date(),
      });
    });

    socket.on('code_change', (data: any) => {
      this.broadcastToProject(projectId, 'code_change', {
        userId,
        username,
        filePath: data.filePath,
        changes: data.changes,
        timestamp: new Date(),
      });
    });

    socket.on('file_open', (data: any) => {
      this.broadcastToProject(projectId, 'file_open', {
        userId,
        username,
        filePath: data.filePath,
        timestamp: new Date(),
      });
    });

    socket.on('file_close', (data: any) => {
      this.broadcastToProject(projectId, 'file_close', {
        userId,
        username,
        filePath: data.filePath,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      this.handleDisconnection(socket.id, projectId, userId, username);
    });

    socket.on('heartbeat', () => {
      this.resetHeartbeat(socket.id);
    });
  }

  private handleDisconnection(socketId: string, projectId: string, userId: string, username: string) {
    this.activeConnections.delete(socketId);
    this.removeFromProjectRoom(projectId, socketId);
    this.stopHeartbeat(socketId);

    this.broadcastToProject(projectId, 'user_leave', {
      userId,
      username,
      timestamp: new Date(),
    });
  }

  private addToProjectRoom(projectId: string, socketId: string) {
    if (!this.projectRooms.has(projectId)) {
      this.projectRooms.set(projectId, new Set());
    }
    this.projectRooms.get(projectId)!.add(socketId);
  }

  private removeFromProjectRoom(projectId: string, socketId: string) {
    const room = this.projectRooms.get(projectId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.projectRooms.delete(projectId);
      }
    }
  }

  private broadcastToProject(projectId: string, event: string, data: any) {
    this.io.to(projectId).emit(event, data);
  }

  private startHeartbeat(socketId: string) {
    const interval = setInterval(() => {
      const connection = this.activeConnections.get(socketId);
      if (connection) {
        connection.socket.emit('ping');
      }
    }, 30000);

    this.heartbeatIntervals.set(socketId, interval);
  }

  private resetHeartbeat(socketId: string) {
    const interval = this.heartbeatIntervals.get(socketId);
    if (interval) {
      clearInterval(interval);
      this.startHeartbeat(socketId);
    }
  }

  private stopHeartbeat(socketId: string) {
    const interval = this.heartbeatIntervals.get(socketId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(socketId);
    }
  }

  public getStats() {
    return {
      totalConnections: this.activeConnections.size,
      activeProjects: this.projectRooms.size,
      projectStats: Array.from(this.projectRooms.entries()).map(([projectId, connections]) => ({
        projectId,
        activeUsers: connections.size,
      })),
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return createUnauthorizedResponse('Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const action = searchParams.get('action');

    if (action === 'stats') {
      return createSuccessResponse({ message: 'Stats endpoint - implement with Socket.IO server' });
    }

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400);
    }

    return createSuccessResponse({ message: 'WebSocket endpoint - implement with Socket.IO server' });
  } catch (error) {
    return createErrorResponse(`WebSocket handler failed: ${error}`, 500);
  }
}

export async function GET_STATS() {
  try {
    return createSuccessResponse({ message: 'Stats endpoint - implement with Socket.IO server' });
  } catch (error) {
    return createErrorResponse(`Failed to get stats: ${error}`, 500);
  }
}
