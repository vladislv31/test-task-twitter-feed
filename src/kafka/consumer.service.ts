import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['localhost:9092'],
  });
  private readonly consumers: Consumer[] = [];

  async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({
      groupId: 'nestjs-kafka',
      maxBytesPerPartition: 100000,
      minBytes: 1,
      maxBytes: 50 * 1024 * 1024,
      maxWaitTimeInMs: 5000,
      maxInFlightRequests: 1,
      heartbeatInterval: 5000,
      sessionTimeout: 10000,
    });

    await consumer.connect();
    await consumer.subscribe(topics);
    await consumer.run(config);

    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
