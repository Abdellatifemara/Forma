import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { EncryptionService } from './encryption.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, EncryptionService],
  exports: [ChatService, EncryptionService],
})
export class ChatModule {}
