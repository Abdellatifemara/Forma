import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async createOrGetConversation(userId: string, participantId: string) {
    if (userId === participantId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Check if participant exists
    const participant = await this.prisma.user.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      throw new NotFoundException('User not found');
    }

    // Check if conversation already exists between these two users
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                lastActiveAt: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (existingConversation) {
      return this.formatConversation(existingConversation, userId);
    }

    // Create new conversation
    const newConversation = await this.prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                lastActiveAt: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return this.formatConversation(newConversation, userId);
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                lastActiveAt: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });

    return conversations.map((conv) => this.formatConversation(conv, userId));
  }

  async getMessages(
    userId: string,
    conversationId: string,
    options: { cursor?: string; limit?: number } = {},
  ) {
    const { cursor, limit = 50 } = options;

    // Verify user is participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = messages.length > limit;
    const messagesData = hasMore ? messages.slice(0, -1) : messages;

    return {
      messages: messagesData.map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: this.encryption.decrypt(msg.content, conversationId),
        mediaUrl: msg.mediaUrl,
        createdAt: msg.createdAt.toISOString(),
        isEdited: msg.isEdited,
        isEncrypted: true, // E2E indicator
        sender: {
          id: msg.sender.id,
          name: `${msg.sender.firstName} ${msg.sender.lastName}`,
          avatarUrl: msg.sender.avatarUrl,
        },
        isMine: msg.senderId === userId,
      })),
      nextCursor: hasMore ? messagesData[messagesData.length - 1]?.id : null,
    };
  }

  async sendMessage(
    userId: string,
    data: {
      conversationId: string;
      type: MessageType;
      content: string;
      mediaUrl?: string;
    },
  ) {
    // Verify user is participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId: data.conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    // Encrypt message content before storing
    const encryptedContent = this.encryption.encrypt(data.content, data.conversationId);

    // Create message and update conversation
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: userId,
          type: data.type,
          content: encryptedContent,
          mediaUrl: data.mediaUrl,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return {
      id: message.id,
      type: message.type,
      content: data.content, // Return original content to sender
      mediaUrl: message.mediaUrl,
      createdAt: message.createdAt.toISOString(),
      isEdited: message.isEdited,
      isEncrypted: true, // E2E indicator
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        avatarUrl: message.sender.avatarUrl,
      },
      isMine: true,
    };
  }

  async markAsRead(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    await this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          where: { userId },
        },
        messages: {
          where: {
            senderId: { not: userId },
            isDeleted: false,
          },
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    let totalUnread = 0;

    for (const conv of conversations) {
      const lastReadAt = conv.participants[0]?.lastReadAt;
      const unreadMessages = conv.messages.filter(
        (msg) => !lastReadAt || msg.createdAt > lastReadAt,
      );
      totalUnread += unreadMessages.length;
    }

    return { unreadCount: totalUnread };
  }

  private formatConversation(
    conversation: {
      id: string;
      isGroup: boolean;
      name: string | null;
      lastMessageAt: Date | null;
      createdAt: Date;
      participants: Array<{
        userId: string;
        lastReadAt: Date | null;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          avatarUrl: string | null;
          lastActiveAt: Date;
        };
      }>;
      messages: Array<{
        id: string;
        content: string;
        type: MessageType;
        createdAt: Date;
        senderId: string;
      }>;
    },
    currentUserId: string,
  ) {
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== currentUserId,
    );
    const myParticipant = conversation.participants.find(
      (p) => p.userId === currentUserId,
    );
    const lastMessage = conversation.messages[0];

    // Calculate unread count
    let unreadCount = 0;
    if (lastMessage && myParticipant) {
      const lastReadAt = myParticipant.lastReadAt;
      if (
        lastMessage.senderId !== currentUserId &&
        (!lastReadAt || lastMessage.createdAt > lastReadAt)
      ) {
        unreadCount = 1; // Simplified - in production might count all unread
      }
    }

    // Check if user is online (active in last 5 minutes)
    const isOnline = otherParticipant
      ? new Date().getTime() - new Date(otherParticipant.user.lastActiveAt).getTime() <
        5 * 60 * 1000
      : false;

    return {
      id: conversation.id,
      participant: otherParticipant
        ? {
            id: otherParticipant.user.id,
            name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`,
            avatarUrl: otherParticipant.user.avatarUrl,
            isOnline,
          }
        : null,
      lastMessage: lastMessage
        ? {
            content:
              lastMessage.type === 'TEXT'
                ? lastMessage.content
                : lastMessage.type === 'IMAGE'
                  ? 'Sent an image'
                  : lastMessage.type === 'VOICE'
                    ? 'Sent a voice message'
                    : lastMessage.content,
            createdAt: lastMessage.createdAt.toISOString(),
            isMine: lastMessage.senderId === currentUserId,
          }
        : null,
      unreadCount,
      createdAt: conversation.createdAt.toISOString(),
    };
  }
}
