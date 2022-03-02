import { createElement, listenPostMessages } from './utils';

const voidFunction = () => {};

const paymentForm = ({
  url,
  onCardDataFulfilled = voidFunction,
  onPaymentFailed = voidFunction,
  onPaymentSuccessful = voidFunction,
  onFormSubmitted = voidFunction,
  onScaRequired = voidFunction,
  onScaLoaded = voidFunction,
  onScaClosed = voidFunction
}: PaymentFormConfig) => {
  let mufasaIframe: HTMLIFrameElement;
  let scaWrapper: HTMLElement;
  let scaIframe: HTMLIFrameElement;

  const setPermissionValue = (value: boolean) => {
    mufasaIframe.contentWindow.postMessage({
      action: 'Sequra.set_permission_value',
      permission_value: value
    }, "*");
  };
  const submitForm = () => {
    mufasaIframe.contentWindow.postMessage({
      action: 'Sequra.iframe_submit'
    }, "*"); // TODO: review origin
  };

  const instanceObject = {
    mount: <any>null,
    onCardDataFulfilled,
    onPaymentFailed,
    onPaymentSuccessful,
    onFormSubmitted,
    onScaRequired,
    onScaLoaded,
    onScaClosed,
    setPermissionValue,
    submitForm
  };

  const mount = (domId: string) => {
    var container = document.getElementById(domId);
    mufasaIframe = <HTMLIFrameElement>createElement('iframe', {
      id: 'mufasa-iframe',
      name: 'mufasa-iframe',
      src: url,
      style: 'border-width: 0px'
    });
    container.appendChild(mufasaIframe);

    const eventListener = (event: MessageEvent) => {
      let eventData;
      try {
        eventData = JSON.parse(event.data);
      } catch(e) {
        return
      }

      switch (eventData.action) {
        case 'Sequra.card_data_fulfilled': {
          instanceObject.onCardDataFulfilled();
          break;
        }
        case 'Sequra.payment_failed': {
          instanceObject.onPaymentFailed();
        }
        case 'Sequra.payment_successful': {
          instanceObject.onPaymentSuccessful();
          break;
        }
        case 'Sequra.mufasa_submitted': {
          instanceObject.onFormSubmitted();
          break;
        }
        case 'Sequra.mufasa_resized': {
          mufasaIframe.style.height = `${event.data.height}px`;
          break;
        }
        case 'Sequra.3ds_authentication': {
          scaWrapper = createElement('div', {
            id: 'iframe-3ds-autentication-wrapper',
            class: 'iframe-3ds-wrapper' // pending to move to styles
          });

          scaIframe = <HTMLIFrameElement>createElement('iframe', {
            id: 'iframe-3ds-autentication',
            src: eventData.src,
            frameborder: '0',
            style: 'border-width: 0px',
            allowtransparency: 'true',
            scrolling: 'no',
            class: 'iframe-3ds hidden'
          });

          scaWrapper.appendChild(scaIframe);
          document.body.appendChild(scaWrapper);
          instanceObject.onScaRequired();
          break;
        }
        case 'Sequra.3ds_authentication_loaded':
          scaIframe.classList.remove('hidden');
          instanceObject.onScaLoaded();
          break;
        case 'Sequra.3ds_authentication_closed':
          instanceObject.onScaClosed();
        case 'Sequra.new_form_fields':
        case 'Sequra.start_synchronization_polling': {
          scaWrapper?.remove();
          scaWrapper = null;
          event.source.postMessage(event.data, event.origin);
        }
      }
    };

    listenPostMessages(eventListener);
  };

  instanceObject.mount = mount;
  return instanceObject;
};

export default paymentForm;
