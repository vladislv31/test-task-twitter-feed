import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [KafkaModule, PrismaModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
