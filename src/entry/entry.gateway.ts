import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { EntryService } from './entry.service';

@WebSocketGateway({ namespace: '/entry', cors: true })
export class EntryGateway {
  @WebSocketServer() wss: Server;

  constructor(
    private authService: AuthService,
    private entryService: EntryService,
  ) {}

  async handleConnection(socket: Socket) {
    const auth = await this.authService.validateToken(
      socket.handshake.headers.authorization,
      'ws/entry',
    );

    if (!auth) {
      socket.emit('entry', { statusCode: 401, body: 'Unauthorized' });
      socket.disconnect(true);
    } else {
      const room = socket.handshake.query.eventId;

      if (isNaN(Number(room))) {
        socket.emit('entry', {
          statusCode: 401,
          body: 'ID do evento inválido!',
        });
        socket.disconnect(true);
      } else {
        try {
          socket.join(room);

          var msg = await this.entryService.getMonitor(Number(room));
          socket.emit('entry', msg);
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
      var msg = await this.entryService.getMonitor(eventId);

      this.wss.to(`${eventId}`).emit('entry', msg);
    } catch (error) {
      console.error(error);
    }
  }
}
