import { Text, View } from 'react-native';

export type WizardStepperProps = {
  currentStep: number;
  totalSteps: number;
  label: string;
};

export const WizardStepper = ({ currentStep, totalSteps, label }: WizardStepperProps) => {
  return (
    <View className="mb-4 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans text-xs text-muted">
          Passo {currentStep} de {totalSteps}
        </Text>
        <Text className="font-serif text-lg text-gold">{label}</Text>
      </View>
      <View className="h-1.5 flex-row gap-1">
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            className={`h-full flex-1 rounded-full ${index < currentStep ? 'bg-gold' : 'bg-hairline'}`}
          />
        ))}
      </View>
    </View>
  );
};
