import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'How many calories should I eat?',
  'What protein sources are best?',
  'How do I improve my bench press?',
  'Can you suggest a pre-workout meal?',
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "مرحبا! 👋 I'm your AI fitness coach. I can help you with workout advice, nutrition tips, and answer any fitness questions. How can I help you today?",
    timestamp: new Date(),
  },
];

export default function AIChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! Based on your profile and goals, I'd recommend focusing on progressive overload while maintaining proper form. Would you like me to explain more?",
        "For your current fitness level, I suggest starting with compound movements. These exercises work multiple muscle groups and are very effective for building overall strength.",
        "Nutrition is key! For your goal, aim for about 1.6-2.2g of protein per kg of body weight. Egyptian foods like grilled chicken, eggs, and foul are excellent protein sources.",
        "Recovery is just as important as training. Make sure you're getting 7-9 hours of sleep and staying hydrated throughout the day.",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="fitness" size={18} color={Colors.primary} />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser && styles.userMessageText,
          ]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <View style={styles.headerAvatar}>
            <Ionicons name="fitness" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.headerName}>AI Coach</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'Typing...' : 'Online'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.avatarContainer}>
                <Ionicons name="fitness" size={18} color={Colors.primary} />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggested Questions</Text>
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSend(question)}
                >
                  <Text style={styles.suggestionText}>{question}</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.text.tertiary} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI coach..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.background.dark : Colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.dark,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.darkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontFamily: FontFamily.semiBold,
  },
  headerStatus: {
    ...Typography.caption,
    color: Colors.success,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.background.darkSecondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.body,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.background.dark,
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  typingBubble: {
    backgroundColor: Colors.background.darkSecondary,
    padding: Spacing.md,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.tertiary,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  suggestionsContainer: {
    marginTop: Spacing.xl,
  },
  suggestionsTitle: {
    ...Typography.label,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.dark,
  },
  suggestionText: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
    backgroundColor: Colors.background.dark,
  },
  attachButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 22,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.text.primary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.darkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
});
