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
    mufasaIframe.contentWindow.postMessage(
      {
        action: 'Sequra.set_permission_value',
        permission_value: value
      },
      '*'
    );
  };
  const submitForm = () => {
    mufasaIframe.contentWindow.postMessage(
      {
        action: 'Sequra.iframe_submit'
      },
      '*'
    ); // TODO: review origin
  };

  const instanceObject = {
    mount: <any>null,
    unbind: <any>voidFunction,
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
      style: 'min-height: 340px; border-width: 0px; border: none; max-width:360px; width: 100%; min-width: 200px;'
    });
    container.appendChild(mufasaIframe);

    const eventListener = (event: MessageEvent) => {
      let eventData;
      try {
        eventData = JSON.parse(event.data);
      } catch (e) {
        return;
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
            // class: 'iframe-3ds-wrapper' // pending to move to styles
            style:
              'display: block !important; position: fixed !important; z-index: 2147483647 !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;'
          });

          scaIframe = <HTMLIFrameElement>createElement('iframe', {
            id: 'iframe-3ds-autentication',
            src: eventData.src,
            frameborder: '0',
            allowtransparency: 'true',
            scrolling: 'no',
            class: 'hidden', // ADD iframe-3ds
            style:
              'border-width: 0px; position: absolute !important; left: 0px !important; top: 0px !important; height: 100% !important; width: 100% !important;'
          });

          scaWrapper.appendChild(scaIframe);
          document.body.appendChild(scaWrapper);
          instanceObject.onScaRequired();
          break;
        }
        case 'Sequra.3ds_authentication_loaded':
          if (scaIframe) {
            scaIframe.classList.remove('hidden');
          }
          instanceObject.onScaLoaded();
          break;
        case 'Sequra.3ds_authentication_closed':
          instanceObject.onScaClosed();
        case 'Sequra.new_form_fields':
        case 'Sequra.start_synchronization_polling': {
          scaWrapper?.remove();
          scaWrapper = null;
          mufasaIframe.contentWindow.postMessage(JSON.stringify(eventData), url);
        }
      }
    };

    listenPostMessages(eventListener);
    instanceObject.unbind = () => window.removeEventListener('message', eventListener);

    return instanceObject;
  };

  instanceObject.mount = mount;
  return instanceObject;
};

export default paymentForm;
