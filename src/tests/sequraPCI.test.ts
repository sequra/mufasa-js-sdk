import SequraPCI from '../sequraPCI'

describe("SequraPCI", () => {
  beforeAll(() => document.body.innerHTML = "<div id='my-container'></div>")
  afterEach(() => document.getElementById("my-container").innerHTML = '')
  const url = "http://test.com"

  test("mounts the iframe in the DOM", async () => {
    SequraPCI.paymentForm({ url }).mount("my-container")
    // const mufasaIframe = <HTMLIFrameElement>document.getElementById("mufasa-iframe")
  })

  test("onPaymentSuccessful", async () => {
    const callbackSpy = jest.fn()
    await new Promise((resolve) => {
      const onPaymentSuccessful = () => {
        callbackSpy()
        resolve(null)
      }

      SequraPCI.paymentForm({
        url,
        onPaymentSuccessful
      }).mount("my-container")

      window.postMessage(JSON.stringify({ action: 'Sequra.payment_successful' }), '*');
      setTimeout(resolve, 100)
    })
    expect(callbackSpy).toHaveBeenCalledTimes(1)
  })
})
