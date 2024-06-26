import SequraPCI from '../sequraPCI';
import { existsSync } from 'fs';

describe('SequraPCI', () => {
  let paymentForm: PaymentFormMountResult;
  beforeAll(() => (document.body.innerHTML = "<div id='my-container'></div>"));
  afterEach(() => (document.getElementById('my-container').innerHTML = ''));
  afterEach(() => paymentForm.unbind());
  const basePath = `file:///${__dirname}/iframePages`;
  const emptyUrl = `${basePath}/empty.html`;

  const fileUrlFor = (callbackName: string):string => {
    const filePath = `${__dirname}/iframePages/${callbackName}.html`
    if(existsSync(filePath)) {
      return(`${basePath}/${callbackName}.html`);
    } else {
      return(emptyUrl);
    }
  }

  describe('mounting', () => {
    test('mounts the iframe in the DOM', async () => {
      paymentForm = SequraPCI.paymentForm({ url: emptyUrl }).mount('my-container');
      const mufasaIframe = document.querySelector('iframe');
      expect(mufasaIframe).toHaveAttribute('src', emptyUrl);
    });

    test('mounts the iframe in the DOM, hidden', () => {
      paymentForm = SequraPCI.paymentForm({ url: emptyUrl }).mount('my-container', { hidden: true });
      const mufasaIframe = document.querySelector('iframe');
      expect(mufasaIframe).toHaveStyle({
        position: 'absolute',
        height: '0px',
        left: '-999px',
        overflow: 'hidden',
        opacity: '0',
      });
    });

    test('it uses custom styles', () => {
      const styles = { height: '111px', borderColor: 'blue' };
      paymentForm = SequraPCI.paymentForm({ url: emptyUrl, styles }).mount('my-container');
      const mufasaIframe = document.querySelector('iframe');
      expect(mufasaIframe.style["height"]).toEqual('111px');
      expect(mufasaIframe.style["border-color"]).toEqual('blue');
    });

    test('it uses custom css class', () => {
      paymentForm = SequraPCI.paymentForm({ url: emptyUrl, className: 'my-class' }).mount('my-container');
      const mufasaIframe = document.querySelector('iframe');
      expect(mufasaIframe.className).toEqual('my-class');
    });
  });

  test('Sequra.3ds_authentication post message adds a iframe with the provided url', async () => {
    let numIframesBefore = 0;
    await new Promise((resolve) => {
      const onScaRequired = () => resolve(null);
      paymentForm = SequraPCI.paymentForm({
        url: `${basePath}/onScaRequired.html`,
        onScaRequired,
      }).mount('my-container');
      numIframesBefore = document.querySelectorAll('iframe').length;
      window.postMessage(JSON.stringify({ action: 'Sequra.3ds_authentication', src: 'https://example.com' }), '*')

      setTimeout(resolve, 500); // To not lock the test in case the callback is not called
    });

    expect(document.querySelectorAll('iframe').length).toEqual(numIframesBefore + 1);
    expect(document.getElementById('iframe-3ds-autentication').src).toEqual('https://example.com/');
  });

  describe('callbacks without params', () => {
    const callbackNames = [
      'onFormErrors',
      'onCardDataFulfilled',
      'onPaymentSuccessful',
      'onFormSubmitted',
      'onScaRequired',
      'onScaLoaded',
      'onScaClosed',
      'onLoad',
    ];
    callbackNames.forEach((callbackName) => {
      test(callbackName, async () => {
        const url = fileUrlFor(callbackName);
        const callbackSpy = jest.fn();
        await new Promise((resolve) => {
          const callback = () => {
            callbackSpy();
            resolve(null);
          };

          paymentForm = SequraPCI.paymentForm({
            url,
            [callbackName]: callback,
          }).mount('my-container');

          setTimeout(resolve, 500); // To not lock the test in case the callback is not called
        });
        expect(callbackSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('callback with params', () => {
    test('onPaymentFailed', async () => {
        const callbackSpy = jest.fn();
        await new Promise((resolve) => {
          const callback = ({ error }: { error: string }) => {
            callbackSpy(error);
            resolve(null);
          };

          paymentForm = SequraPCI.paymentForm({
            url: `${basePath}/onPaymentFailed.html`,
            onPaymentFailed: callback,
          }).mount('my-container');

          setTimeout(resolve, 500); // To not lock the test in case the callback is not called
        });
        expect(callbackSpy).toHaveBeenNthCalledWith(1, "authentication");
    });
  });

  describe('post message forwarding', () => {
    const forwardedPostMessages = [
      'Sequra.3ds_authentication_loaded',
      'Sequra.3ds_authentication_closed',
      'Sequra.new_form_fields',
      'Sequra.start_synchronization_polling',
    ];
    forwardedPostMessages.forEach((postMessage) => {
      test(`the host page forwards ${postMessage} post message to mufasa-iframe`, async () => {
        let numEventsFired = 0;
        await new Promise((resolve) => {
          paymentForm = SequraPCI.paymentForm({ url: 'https://example.com' }).mount('my-container');
          const mufasaIframe = document.querySelector('iframe');
          mufasaIframe.contentWindow.addEventListener('message', (event) => {
            const eventData = JSON.parse(event.data);
            if (eventData.action === postMessage) {
              numEventsFired++;
              resolve(null);
            }
          }, false);
          window.postMessage(JSON.stringify({ action: postMessage }), '*')

          setTimeout(resolve, 500); // To not lock the test in case the event is not fired
        });
        expect(numEventsFired).toEqual(1)
      });
    });
  });

  test('bind removes event listeners', async () => {
    const onFormSubmitted = jest.fn();
    let numEventsFired = 0;
    let finish:(_value: unknown) => void;

    await new Promise((resolve) => {
      paymentForm = SequraPCI.paymentForm({ url: emptyUrl, onFormSubmitted }).mount('my-container');
      window.addEventListener('message', () => {
        numEventsFired++;
        if(numEventsFired === 1) {
          paymentForm.unbind();
          resolve(null);
        } else if(finish) {
          finish(null);
        }
      }, false);
      window.postMessage(JSON.stringify({ action: 'Sequra.mufasa_submitted' }), '*');
    })
    await new Promise((resolve) => {
      finish = resolve;
      window.postMessage(JSON.stringify({ action: 'Sequra.mufasa_submitted' }), '*');
    })
    expect(numEventsFired).toEqual(2);
    expect(onFormSubmitted).toHaveBeenCalledTimes(1);
  })
});
