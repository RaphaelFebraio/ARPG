import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const Modal = ({ visible, onClose, children }: ModalProps) => {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/70 px-6" onPress={onClose}>
        {/* Swallow taps inside the card so they don't bubble to the backdrop's onClose. */}
        <Pressable onPress={(event) => event.stopPropagation()} className="w-full">
          <View className="rounded-2xl border border-gold/30 bg-background-elevated p-6">{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};
