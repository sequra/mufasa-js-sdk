import SequraPCI from '../sequraPCI';

describe('SequraPCI', () => {
  let paymentForm: PaymentFormMountResult;
  beforeAll(() => (document.body.innerHTML = "<div id='my-container'></div>"));
  afterEach(() => (document.getElementById('my-container').innerHTML = ''));
  afterEach(() => paymentForm.unbind());
  const basePath = `file:///${__dirname}/iframePages`;
  let url = `${basePath}/empty.html`;

  describe('mounting', () => {
    test('mounts the iframe in the DOM', async () => {
      paymentForm = SequraPCI.paymentForm({ url }).mount('my-container');
      const mufasaIframe = document.querySelector('iframe');
      expect(mufasaIframe).toHaveAttribute('src', url);
    });

    test('mounts the iframe in the DOM, hidden', () => {
      paymentForm = SequraPCI.paymentForm({ url }).mount('my-container', { hidden: true });
      const mufasaIframe = document.querySelector('iframe');
      expect(mufasaIframe.style["display"]).toEqual("none")
    });
  });

  describe('callbacks', () => {
    const callbackNames = [
      'onFormErrors',
      'onCardDataFulfilled',
      'onPaymentSuccessful',
      'onPaymentFailed',
      'onFormSubmitted',
      'onScaLoaded',
      'onScaClosed',
    ];
    callbackNames.forEach((callbackName) => {
      test(callbackName, async () => {
        url = `${basePath}/${callbackName}.html`;
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
  })

  test('#unbind removes event listeners', async () => {
    const onFormSubmitted = jest.fn();
    let numEventsFired = 0;
    let finish:(_value: unknown) => void;

    await new Promise((resolve) => {
      paymentForm = SequraPCI.paymentForm({ url, onFormSubmitted }).mount('my-container');
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
