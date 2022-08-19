// Add IE-specific interfaces to Window
declare interface Window {
  attachEvent(event: string, listener: EventListener): boolean;
  detachEvent(event: string, listener: EventListener): void;
}

interface PaymentFormConfig {
  url: string;
  onCardDataFulfilled?: () => void;
  onFormErrors?: () => void;
  onPaymentFailed?: (data: { error: string }) => void;
  onPaymentSuccessful?: () => void;
  onFormSubmitted?: () => void;
  onScaRequired?: () => void;
  onScaLoaded?: () => void;
  onScaClosed?: () => void;
}

interface PaymentFormMountResult {
  unbind: () => void;
  setPermissionValue: (value: boolean) => void;
  submitForm: () => void;
}

interface PaymentFormResult {
  mount: (domId: string, { hidden }?: { hidden: boolean }) => PaymentFormMountResult;
}
