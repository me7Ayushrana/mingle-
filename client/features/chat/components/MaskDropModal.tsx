import React from 'react';
import { StyleSheet, View, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Heading } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

interface MaskDropModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestDrop: () => void;
  hasRequested: boolean;
  isRevealed: boolean;
  partnerIdentity?: { name?: string; contact?: string };
}

export const MaskDropModal = ({
  visible,
  onClose,
  onRequestDrop,
  hasRequested,
  isRevealed,
  partnerIdentity,
}: MaskDropModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Ionicons name="eye-off" size={36} color={colors.primary} style={{ alignSelf: 'center' }} />
          <Heading level={2} style={styles.title}>
            🎭 Mask Drop (Identity Reveal)
          </Heading>

          {isRevealed ? (
            <View style={styles.revealedBox}>
              <Text style={styles.revealedTitle}>Mask Dropped! Mutual Trust Unlocked 🔓</Text>
              <Text style={styles.identityText}>Name: {partnerIdentity?.name || 'Shared Identity'}</Text>
              {partnerIdentity?.contact ? (
                <Text style={styles.identityText}>Contact: {partnerIdentity.contact}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.description}>
              Ready to take off the mask? Mask Drop reveals real contact details only when BOTH
              people tap request.
            </Text>
          )}

          {!isRevealed ? (
            <Pressable
              onPress={onRequestDrop}
              disabled={hasRequested}
              style={[styles.actionBtn, hasRequested && styles.disabledBtn]}
            >
              <Text style={styles.actionBtnText}>
                {hasRequested ? 'Requested! Waiting for Partner...' : 'Request Mask Drop'}
              </Text>
            </Pressable>
          ) : null}

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  title: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 20,
    marginTop: 12,
  },
  description: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 16,
  },
  revealedBox: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderColor: 'rgba(52, 199, 89, 0.4)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  revealedTitle: {
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 8,
  },
  identityText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  closeBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});
