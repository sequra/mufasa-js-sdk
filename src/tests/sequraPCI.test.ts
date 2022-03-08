import SequraPCI from '../sequraPCI';

describe('SequraPCI', () => {
  let paymentForm;
  beforeAll(() => (document.body.innerHTML = "<div id='my-container'></div>"));
  afterEach(() => (document.getElementById('my-container').innerHTML = ''));
  afterEach(() => paymentForm.unbind());
  const basePath = `file:///${__dirname}/iframePages`;
  let url = `${basePath}/empty.html`;

  test('mounts the iframe in the DOM', async () => {
    paymentForm = SequraPCI.paymentForm({ url }).mount('my-container');
    const mufasaIframe = document.querySelector('iframe');
    expect(mufasaIframe).toHaveAttribute('src', url);
  });

  const callbackNames = [
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
});
