# Sequra PCI card form integration library

This library allows to integrate a card payment form

## API


### Config initialization

```javascript
  SequraPCI.paymentForm({
    url: "https://sequra-provided-url-to-pci-env",
    onCardDataFulfilled: () => { ... },
    onPaymentFailed:     () => { ... },
    onPaymentSuccessful: () => { ... },
    onFormSubmitted:     () => { ... },
    onScaRequired:       () => { ... },
    onScaLoaded:         () => { ... },
    onScaClosed:         () => { ... },
  })
```

Notes:
  1. The `url` param is mandatory and it must be the url provided by the SeQura API.
  2. Any callback function param is optional.

### Callbacks description

| callback            | description                                                                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| onCardDataFulfilled | Called when all the fields in the card form are filled. Useful if the pay button is outside the PCI iframe and want to control the enabled property. |
| onPaymentFailed     | Called when a payment has failed.                                                                                                                    |
| onPaymentSuccessful | Called when a payment has succeeded.                                                                                                                 |
| onFormSubmitted     | Called when the form has been submitted.                                                                                                             |
| onScaRequired       | Called when the payment requires a SCA.                                                                                                              |
| onScaLoaded         | Called when the SCA iframe has been loaded.                                                                                                          |
| onScaClosed         | Called when the SCA iframe has been closed.                                                                                                          |

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
<script src="[PENDING]/mufasa-js-sdk/v1.0.0/sequra-pci.js"
  integrity="sha256-[PENDING]"
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

Where `GITHUB_TOKEN` is an env var with your Github access token.
Then, you can add it to your `package.json`:

```bash
yarn add @sequra/mufasa-js-sdk
```
```javascript
import SequraPCI from "@sequra/mufasa-js-sdk"; // es6 native
const SequraPCI = require("@sequra/mufasa-js-sdk"); // commonjs
```
