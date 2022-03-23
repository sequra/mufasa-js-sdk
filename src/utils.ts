export const createElement = (tagName: string, properties: { [key: string]: string }): HTMLElement => {
  const element = document.createElement(tagName);
  for (const property in properties) {
    element.setAttribute(property, properties[property]);
  }
  return element;
};

export const listenPostMessages = (eventListener: (event: MessageEvent) => void) => {
  if (typeof window.addEventListener != 'undefined') {
    window.addEventListener('message', eventListener, false);
  } else if (typeof window.attachEvent != 'undefined') {
    window.attachEvent('onmessage', eventListener);
  }
};
