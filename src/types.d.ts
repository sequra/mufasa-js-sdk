// Add IE-specific interfaces to Window
declare interface Window {
  attachEvent(event: string, listener: EventListener): boolean;
  detachEvent(event: string, listener: EventListener): void;
}

interface PaymentFormConfig {
  url: string;
  onCardDataFulfilled?: () => void;
  onPaymentFailed?: () => void;
  onPaymentSuccessful?: () => void;
  onFormSubmitted?: () => void;
  onScaRequired?: () => void;
  onScaLoaded?: () => void;
  onScaClosed?: () => void;
}
