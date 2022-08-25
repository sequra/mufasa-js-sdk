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
      expect(mufasaIframe.style["display"]).toEqual("none")
    });
  });

  describe('callbacks without params', () => {
    const callbackNames = [
      'onFormErrors',
      'onCardDataFulfilled',
      'onPaymentSuccessful',
      'onFormSubmitted',
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

  test('#unbind removes event listeners', async () => {
    const onFormSubmitted = jest.fn();
    let numEventsFired = 0;
    let finish:(_value: unknown) => void;

    await new Promise((resolve) => {
      paymentForm = SequraPCI.paymentForm({ url: emptyUrl, onFormSubmitted }).mount('my-container');
      window.addEventListener('message', () => {
        numEventsFired++;
        if(numEventsFired === 1) {
          paymentForm.unbind()
          resolve(null)
        } else if(finish) {
          finish(null)
        }
      }, false)
      window.postMessage(JSON.stringify({ action: 'Sequra.mufasa_submitted' }), '*')
    })
    await new Promise((resolve) => {
      finish = resolve
      window.postMessage(JSON.stringify({ action: 'Sequra.mufasa_submitted' }), '*')
    })
    expect(numEventsFired).toEqual(2)
    expect(onFormSubmitted).toHaveBeenCalledTimes(1)
  })
});
