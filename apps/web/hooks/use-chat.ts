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
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(newMessage.conversationId) });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData(chatKeys.messages(newMessage.conversationId));

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        type: newMessage.type,
        content: newMessage.content,
        mediaUrl: newMessage.mediaUrl,
        createdAt: new Date().toISOString(),
        isMine: true,
        isPending: true,
        sender: { id: 'me', name: 'Me' },
      };

      // Optimistically add the new message
      queryClient.setQueryData(chatKeys.messages(newMessage.conversationId), (old: any) => {
        // Handle case when there's no existing data (new conversation)
        if (!old?.pages || old.pages.length === 0) {
          return {
            pages: [{ messages: [optimisticMessage], nextCursor: null }],
            pageParams: [undefined],
          };
        }
        // Add to beginning of first page (messages are newest-first from API)
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) =>
            index === 0
              ? { ...page, messages: [optimisticMessage, ...(page.messages || [])] }
              : page
          ),
        };
      });

      // Return context with previous data for rollback
      return { previousData, optimisticId: optimisticMessage.id };
    },
    onSuccess: (response, variables, context) => {
      // Replace the temp message with the real one from server
      queryClient.setQueryData(chatKeys.messages(variables.conversationId), (old: any) => {
        if (!old?.pages || old.pages.length === 0) {
          return {
            pages: [{ messages: [response], nextCursor: null }],
            pageParams: [undefined],
          };
        }

        // Replace temp message with real one, or add if temp was removed by refetch
        let replacedTemp = false;
        const updatedPages = old.pages.map((page: any, index: number) => {
          const updatedMessages = (page.messages || []).map((m: any) => {
            if (m.id === context?.optimisticId || m.id.startsWith('temp-')) {
              replacedTemp = true;
              return response;
            }
            return m;
          });

          // If this is the first page and we didn't replace a temp message,
          // check if the message already exists (from refetch) before adding
          if (index === 0 && !replacedTemp) {
            const alreadyExists = updatedMessages.some((m: any) => m.id === response.id);
            if (!alreadyExists) {
              return { ...page, messages: [response, ...updatedMessages] };
            }
          }

          return { ...page, messages: updatedMessages };
        });

        return { ...old, pages: updatedPages };
      });

      // Update conversations list for last message preview
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onError: (err, variables, context) => {
      // Rollback to the previous state
      if (context?.previousData) {
        queryClient.setQueryData(chatKeys.messages(variables.conversationId), context.previousData);
      } else {
        // Fallback: just remove temp messages
        queryClient.setQueryData(chatKeys.messages(variables.conversationId), (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              messages: (page.messages || []).filter((m: any) => !m.id.startsWith('temp-')),
            })),
          };
        });
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation to ensure consistency
      // Small delay to let the server process the message
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) });
      }, 500);
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
