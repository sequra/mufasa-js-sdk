# Sequra PCI card form integration library

This library allows to integrate a card payment form

## API


### Config initialization

```javascript
  SequraPCI.paymentForm({
    url: "https://sequra-provided-url-to-pci-env",
    styles: { marginBottom: "10px" },
    className: 'my-class',
    onCardDataFulfilled: () => { ... },
    onFormErrors:        () => { ... },
    onFormSubmitted:     () => { ... },
    onScaRequired:       () => { ... },
    onScaLoaded:         () => { ... },
    onScaClosed:         () => { ... },
    onPaymentFailed:     ({ error }) => { ... },
    onPaymentSuccessful: () => { ... },
    onLoad:              () => { ... },
  })
```

Notes:
  1. The `url` param is mandatory and it must be the url provided by the SeQura API.
  2. Any callback function param is optional.

### Callbacks description

| callback            | description                                                                                                                                          |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| onCardDataFulfilled | Called when all the fields in the card form are filled. Useful if the pay button is outside the PCI iframe and want to control the enabled property. |
| onFormErrors        | Called when the form has errors.                                                                                                                     |
| onFormSubmitted     | Called when the form has been submitted.                                                                                                             |
| onScaRequired       | Called when the payment requires a SCA.                                                                                                              |
| onScaLoaded         | Called when the SCA iframe has been loaded.                                                                                                          |
| onScaClosed         | Called when the SCA iframe has been closed.                                                                                                          |
| onPaymentFailed     | Called when a payment has failed. It includes the error type as a parameter.                                                                         |
| onPaymentSuccessful | Called when a payment has succeeded.                                                                                                                 |
| onLoad              | Called when the iframe is first loaded                                                                                                               |

### Mounting

Once the payment form has been initialized, it has to be mounted in the DOM, for example, inside a given `div` container:
```html
<div id="card_form"></div>
```

```javascript
SequraPCI.paymentForm({ ... }).mount("card_form")
```

For payments with a reused card, the card form should not be shown, then the mount should receive a `hidden` param.

```javascript
SequraPCI.paymentForm({ ... }).mount("card_form", { hidden: true })
```

Note: in this case (payments with a token form), the iframe is auto submitted when is loaded.

### Customization

You can pass custom styles that will override base styles defined for the iframe container:

```javascript
SequraPCI.paymentForm({ styles: { width: "300px" }, ...otherProps }).mount("card_form")
```

A specific css class can also be passed to customize the iframe with css rules defined in the host html.

```javascript
SequraPCI.paymentForm({ className: 'payment-form', ...otherProps }).mount("card_form")
```

### Actions

Given a mounted card form iframe:
```javascript
const paymentForm = SequraPCI.paymentForm({ ... }).mount("card_form")
```

You can programmatically submit the form:
```javascript
paymentForm.submitForm()
```

You can programmatically check/uncheck the permissions checkbox: 
```javascript
paymentForm.setPermissionValue(true)  // checked
paymentForm.setPermissionValue(false) // unchecked
```

You can remove event listeners (stop listening for iframe post messages):
```javascript
paymentForm.unbind()
```


## Browser usage

```html
<script
  type="text/javascript"
  src="https://mufasa.sequracdn.com/v1.0.0/sequra-pci.js"
  integrity="sha384-UlIevrkGIbR5eejNmc3+JaWvwnRkxHVtOG/+GJO/Hx8jQ1a5ED2yUZzH6hwMrWui"
  crossorigin="anonymous">
</script>
```
This will expose the `SequraPCI` global var.

## NPM package usage

Create a `.npmrc` file with the following contents:

```bash
@sequra:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then, you can add it to your `package.json`:

```bash
yarn add @sequra/mufasa-js-sdk
```
```javascript
import SequraPCI from "@sequra/mufasa-js-sdk"; // es6 native
const SequraPCI = require("@sequra/mufasa-js-sdk"); // commonjs
```
