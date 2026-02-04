import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Body() dto: CreateConversationDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.chatService.createOrGetConversation(req.user.id, dto.participantId);
  }

  @Get('conversations')
  async getConversations(@Request() req: { user: { id: string } }) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.chatService.getMessages(req.user.id, conversationId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('messages')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.chatService.sendMessage(req.user.id, dto);
  }

  @Post('conversations/:id/read')
  async markAsRead(
    @Param('id') conversationId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.chatService.markAsRead(req.user.id, conversationId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: { user: { id: string } }) {
    return this.chatService.getUnreadCount(req.user.id);
  }
}
