export interface OnboardingStepMeta {
  readonly id: string;
  readonly label: string;
  readonly optional?: boolean;
}

export interface StepNavigationProps {
  readonly onBack?: (() => void) | undefined;
  readonly onNext?: (() => void) | undefined;
  readonly onSkip?: (() => void) | undefined;
  readonly nextLabel?: string | undefined;
  readonly backLabel?: string | undefined;
  readonly skipLabel?: string | undefined;
  readonly nextDisabled?: boolean | undefined;
  readonly showSkip?: boolean | undefined;
  readonly isLoading?: boolean | undefined;
}
