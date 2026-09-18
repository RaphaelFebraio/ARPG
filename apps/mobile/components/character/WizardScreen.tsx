import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '../ui';
import { WizardStepper } from './WizardStepper';

export type WizardScreenProps = {
  step: number;
  totalSteps: number;
  title: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export const WizardScreen = ({
  step,
  totalSteps,
  title,
  children,
  onBack,
  onNext,
  nextLabel = 'Próximo',
  nextDisabled = false,
}: WizardScreenProps) => {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
        <WizardStepper currentStep={step} totalSteps={totalSteps} label={title} />
        {children}
      </ScrollView>

      <View className="flex-row gap-3 border-t border-hairline bg-background px-5 py-4">
        {onBack ? (
          <View className="flex-1">
            <Button label="Voltar" variant="secondary" onPress={onBack} />
          </View>
        ) : null}
        {onNext ? (
          <View className="flex-1">
            <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} />
          </View>
        ) : null}
      </View>
    </View>
  );
};
