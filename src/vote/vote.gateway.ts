import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { VoteService } from './vote.service';

@WebSocketGateway({ namespace: '/vote', cors: true })
export class VoteGateway {
  @WebSocketServer() wss: Server;

  constructor(
    private authService: AuthService,
    private voteService: VoteService,
  ) {}
  async handleConnection(socket: Socket) {
    const auth = await this.authService.validateToken(
      socket.handshake.headers.authorization,
      'ws/vote',
    );

    if (!auth) {
      socket.emit('vote', { statusCode: 401, body: 'Unauthorized' });
      socket.disconnect(true);
    } else {
      const room = socket.handshake.query.eventId;

      if (isNaN(Number(room))) {
        socket.emit('vote', {
          statusCode: 401,
          body: 'ID do evento inválido!',
        });
        socket.disconnect(true);
      } else {
        try {
          socket.join(room);

          var msg = await this.voteService.getMonitor(Number(room));
          socket.emit('vote', msg);
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
      var msg = await this.voteService.getMonitor(eventId);

      this.wss.to(`${eventId}`).emit('vote', msg);
    } catch (error) {
      console.error(error);
    }
  }
}
