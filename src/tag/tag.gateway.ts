import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { TagService } from './tag.service';

@WebSocketGateway({ namespace: '/tag', cors: true })
export class TagGateway {
  @WebSocketServer() wss: Server;

  constructor(
    private authService: AuthService,
    private tagService: TagService,
  ) {}

  async handleConnection(socket: Socket) {
    const auth = await this.authService.validateToken(
      socket.handshake.headers.authorization,
      'ws/tag',
    );

    if (!auth) {
      socket.emit('tag', { statusCode: 401, body: 'Unauthorized' });
      socket.disconnect(true);
    } else {
      const room = socket.handshake.query.eventId;

      if (isNaN(Number(room))) {
        socket.emit('tag', {
          statusCode: 401,
          body: 'ID do evento inválido!',
        });
        socket.disconnect(true);
      } else {
        try {
          socket.join(room);

          var msg = await this.tagService.getMonitor(Number(room));
          socket.emit('tag', msg);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  handleDisconnect(client: Socket) {
    let rooms = [...client.rooms];
    rooms.forEach((room) => {
      client.leave(room);
    });
  }

  async notifyMonitors(eventId: number) {
    try {
      var msg = await this.tagService.getMonitor(eventId);

      this.wss.to(`${eventId}`).emit('tag', msg);
    } catch (error) {
      console.error(error);
    }
  }
}
