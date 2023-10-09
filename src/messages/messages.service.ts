import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessagesService implements OnModuleInit {
  private readonly listeners: any[] = [];

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume(
      { topics: ['message'] },
      {
        eachBatch: async ({ batch }) => {
          await this.addManyMessages(
            batch.messages.map((msg) => ({
              message: msg.value.toString(),
              txId: msg.headers.txId.toString(),
            })),
          );
        },
      },
    );
  }

  async addManyMessages(messages: { message: string; txId: string }[]) {
    console.log('Adding messages:', messages.length);
    try {
      await this.prismaService.$transaction(async (prisma) => {
        await Promise.all(
          messages.map(async (message) => {
            const record = await prisma.message.findFirst({
              where: {
                txId: message.txId,
              },
            });

            if (!record) {
              await prisma.message.create({
                data: {
                  message: message.message,
                  txId: message.txId,
                },
              });
            }
          }),
        );
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002'
      ) {
        throw new InternalServerErrorException(error.message);
      }
    }

    void this.notifyListeners(messages.map((msg) => msg.message));
  }

  async getAllMessages() {
    return (await this.prismaService.message.findMany()).map(
      (msg) => msg.message,
    );
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(messages: string[]) {
    this.listeners.forEach((listener) =>
      messages.forEach((message) => listener(message)),
    );
  }
}
