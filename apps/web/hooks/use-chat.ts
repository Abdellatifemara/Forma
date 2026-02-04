'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatApi, uploadApi, type SendMessageData, type MessageType } from '@/lib/api';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
  unreadCount: () => [...chatKeys.all, 'unread-count'] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => chatApi.getConversations(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId || ''),
    queryFn: ({ pageParam }) =>
      chatApi.getMessages(conversationId!, { cursor: pageParam as string | undefined }),
    enabled: !!conversationId,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: string) => chatApi.createConversation(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageData) => chatApi.sendMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatApi.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: () => chatApi.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadApi.uploadImage(file),
  });
}

export function useUploadVoice() {
  return useMutation({
    mutationFn: (blob: Blob) => uploadApi.uploadVoice(blob),
  });
}

// Combined hook for sending message with media
export function useSendMediaMessage() {
  const queryClient = useQueryClient();
  const uploadImage = useUploadImage();
  const uploadVoice = useUploadVoice();
  const sendMessage = useSendMessage();

  const sendImageMessage = async (conversationId: string, file: File) => {
    const uploadResult = await uploadImage.mutateAsync(file);
    return sendMessage.mutateAsync({
      conversationId,
      type: 'IMAGE' as MessageType,
      content: 'Image',
      mediaUrl: uploadResult.url,
    });
  };

  const sendVoiceMessage = async (conversationId: string, blob: Blob) => {
    const uploadResult = await uploadVoice.mutateAsync(blob);
    return sendMessage.mutateAsync({
      conversationId,
      type: 'VOICE' as MessageType,
      content: 'Voice message',
      mediaUrl: uploadResult.url,
    });
  };

  return {
    sendImageMessage,
    sendVoiceMessage,
    isUploadingImage: uploadImage.isPending,
    isUploadingVoice: uploadVoice.isPending,
    isSending: sendMessage.isPending,
    isLoading: uploadImage.isPending || uploadVoice.isPending || sendMessage.isPending,
  };
}
