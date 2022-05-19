export const waitFor = async (
  callback: () => unknown,
  _maxTries: number = 20,
  _timeout: number = 100
): Promise<unknown> => {
  // init our variables
  let tries = 0,
    timeout = _timeout;
  // Start our loop
  while (tries < _maxTries) {
    // Try get the output
    const output = callback();
    // Check it is not falsey
    if (!output) {
      // It is so increment variables
      tries += 1;
      timeout += _timeout;
      // And wait for timeout
      await new Promise((resolve) => setTimeout(resolve, timeout));
    } else {
      // Otherwise return the output
      return output;
    }
  }
  return null;
};


export const getElementByXPath = (path: string): HTMLElement => {
      return document.evaluate(
      path,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLElement || undefined; 
};

export const findParentsByClassName = (element: HTMLElement, className: string): HTMLElement | null => {
  if(!!!element.parentElement) return null;
  if(element.parentElement.classList.contains(className)) return element.parentElement;
  return findParentsByClassName(element.parentElement, className);
}

export const findParentsByAttribute = (element: HTMLElement, attribute: string, selector: string): HTMLElement | null => {
  if(!!!element.parentElement) return null;
  if(element.parentElement.hasAttribute(attribute) && element.parentElement.getAttribute(attribute)?.includes( selector)) return element.parentElement;
  return findParentsByAttribute(element.parentElement, attribute, selector);
}