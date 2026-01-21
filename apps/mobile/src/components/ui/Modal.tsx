import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ModalSize = 'small' | 'medium' | 'large' | 'full';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  style?: ViewStyle;
  footer?: React.ReactNode;
}

const getModalHeight = (size: ModalSize): ViewStyle => {
  switch (size) {
    case 'small':
      return { maxHeight: SCREEN_HEIGHT * 0.35 };
    case 'medium':
      return { maxHeight: SCREEN_HEIGHT * 0.5 };
    case 'large':
      return { maxHeight: SCREEN_HEIGHT * 0.75 };
    case 'full':
      return { height: SCREEN_HEIGHT * 0.9 };
    default:
      return { maxHeight: SCREEN_HEIGHT * 0.5 };
  }
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropPress = true,
  style,
  footer,
}: ModalProps) {
  const heightStyle = getModalHeight(size);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback
        onPress={closeOnBackdropPress ? onClose : undefined}
      >
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback>
              <View style={[styles.container, heightStyle, style]}>
                {/* Handle */}
                <View style={styles.handle} />

                {/* Header */}
                {(title || showCloseButton) && (
                  <View style={styles.header}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {showCloseButton && (
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                      >
                        <Ionicons
                          name="close"
                          size={24}
                          color={Colors.text.secondary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                <View style={styles.content}>{children}</View>

                {/* Footer */}
                {footer && <View style={styles.footer}>{footer}</View>}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background.darkSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border.dark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.dark,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.darkTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.lg,
  },
  footer: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
  },
});
