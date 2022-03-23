import { createElement, listenPostMessages } from './utils';

const voidFunction = () => {
  // noop
};

const paymentForm = ({
  url,
  onCardDataFulfilled = voidFunction,
  onFormErrors = voidFunction,
  onPaymentFailed = voidFunction,
  onPaymentSuccessful = voidFunction,
  onFormSubmitted = voidFunction,
  onScaRequired = voidFunction,
  onScaLoaded = voidFunction,
  onScaClosed = voidFunction,
}: PaymentFormConfig):PaymentFormResult => {
  const mount = (domId: string, { hidden = false } = {}):PaymentFormMountResult => {
    let scaWrapper: HTMLElement;
    let scaIframe: HTMLIFrameElement;

    const container = document.getElementById(domId);
    const mufasaIframe = createElement('iframe', {
      id: 'mufasa-iframe',
      name: 'mufasa-iframe',
      src: url,
      style: `min-height:340px;border-width:0px;border:none;max-width:360px;width:100%;min-width:200px;${hidden && "display:none;"}`,
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
        case 'Sequra.invalid_form': {
          onFormErrors();
          break;
        }
        case 'Sequra.card_data_fulfilled': {
          onCardDataFulfilled();
          break;
        }
        case 'Sequra.payment_failed': {
          onPaymentFailed();
          break;
        }
        case 'Sequra.payment_successful': {
          onPaymentSuccessful();
          break;
        }
        case 'Sequra.mufasa_submitted': {
          onFormSubmitted();
          break;
        }
        case 'Sequra.mufasa_resized': {
          mufasaIframe.style.height = `${event.data.height}px`;
          break;
        }
        case 'Sequra.3ds_authentication': {
          scaWrapper = createElement('div', {
            id: 'iframe-3ds-autentication-wrapper',
            style: 'display:block;position:fixed;z-index:2147483647;top:0;left:0;right:0;bottom:0;',
          });

          scaIframe = <HTMLIFrameElement>createElement('iframe', {
            id: 'iframe-3ds-autentication',
            src: eventData.src,
            frameborder: '0',
            allowtransparency: 'true',
            scrolling: 'no',
            class: 'hidden',
            style: 'border-width:0px;position:absolute;left:0px;top:0px;height:100%;width:100%;',
          });

          scaWrapper.appendChild(scaIframe);
          document.body.appendChild(scaWrapper);
          onScaRequired();
          break;
        }
        case 'Sequra.3ds_authentication_loaded':
          if (scaIframe) {
            scaIframe.classList.remove('hidden');
          }
          onScaLoaded();
          break;
        case 'Sequra.3ds_authentication_closed':
          onScaClosed();
        case 'Sequra.new_form_fields':
          // falls through
        case 'Sequra.start_synchronization_polling':
          scaWrapper?.remove();
          scaWrapper = null;
          mufasaIframe.contentWindow.postMessage(JSON.stringify(eventData), url);
          break;
      }
    };
    listenPostMessages(eventListener);

    const setPermissionValue = (value: boolean) => {
      mufasaIframe.contentWindow.postMessage(
        JSON.stringify({
          action: 'Sequra.set_permission_value',
          permission_value: value,
        }),
        '*',
      );
    };

    const submitForm = () => {
      mufasaIframe.contentWindow.postMessage(
        JSON.stringify({
          action: 'Sequra.iframe_submit',
        }),
        '*',
      );
    };
    const unbind = () => window.removeEventListener('message', eventListener);

    return {
      unbind,
      setPermissionValue,
      submitForm,
    };
  };

  return {
    mount,
  };
};

export default paymentForm;
