import * as crypto from 'crypto';
import { Body, Controller, Get, Header, Post, Req, Res } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ProducerService } from 'src/kafka/producer.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly producerService: ProducerService,
  ) {}

  @Post('/add')
  async add(@Body('message') message: string) {
    await this.producerService.produce({
      topic: 'message',
      messages: [
        {
          headers: {
            txId: `${crypto.randomBytes(16).toString('hex')}-${Date.now()}`,
          },
          value: message,
        },
      ],
      acks: -1,
    });
    return { status: 'ok' };
  }

  @Get('/feed')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async getFeed(@Req() req, @Res() res) {
    const sendMessage = (msg: string) => {
      res.write(`${msg}\n`);
    };

    this.messagesService.addListener(sendMessage);

    (await this.messagesService.getAllMessages()).forEach((msg) => {
      sendMessage(msg);
    });

    req.on('close', () => {
      this.messagesService.removeListener(sendMessage);
    });
  }
}
