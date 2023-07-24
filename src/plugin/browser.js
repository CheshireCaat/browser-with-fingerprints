const connect = require('chrome-remote-interface');
const { MAX_RESIZE_RETRIES } = require('../common');

/**
 * Set the browser viewport size.
 *
 * @param {import('./launcher').Browser} browser - The target browser to set the viewport.
 * @param {{width: number, height: number}} bounds - New viewport size.
 *
 * @internal
 */
exports.setViewport = async (browser, { diff, width, height }) => {
  const cdp = await connect(browser);
  const { windowId } = await cdp.Browser.getWindowForTarget();
  const delta = diff ? { ...diff } : { width: 16, height: 88 };

  for (let i = 0; i < MAX_RESIZE_RETRIES; ++i) {
    const bounds = { width: width + delta.width, height: height + delta.height };
    await Promise.all([cdp.Browser.setWindowBounds({ bounds, windowId }), waitForResize(cdp)]);

    const viewport = await this.getViewport(cdp);

    if (width === viewport.width && height === viewport.height) {
      break;
    } else if (i === MAX_RESIZE_RETRIES - 1) {
      // TODO: improve handling of incorrect viewport size.
      console.warn('Unable to set correct viewport size.');
    }

    delta.height += height - viewport.height;
    delta.width += width - viewport.width;
  }

  await cdp.close();
};

/**
 * Get the browser viewport size.
 *
 * @param {import('chrome-remote-interface').Client} cdp - The target client to get the viewport.
 * @returns {Promise<{width: number, height: number}>} - Promise which resolves to a browser viewport size.
 *
 * @internal
 */
exports.getViewport = async (cdp) => {
  return await cdp.Runtime.evaluate({
    expression: `({ height: window.innerHeight, width: window.innerWidth })`,
    returnByValue: true,
  }).then(({ result }) => result.value);
};

/**
 * Wait for the browser to resize.
 *
 * In some cases, when the browser is in visible mode, resizing can take some time.
 * In order not to use hardcoded values, we need to wait for the page to resize.
 * The `ResizeObserver` in conjunction with `requestAnimationFrame` is convenient in that we don't need to use the `setTimeout` method.
 *
 * @param {import('chrome-remote-interface').Client} cdp - The target client to wait for the browser to resize.
 */
const waitForResize = async (cdp) => {
  await cdp.Runtime.evaluate({
    expression: `new Promise((done) => {
      new ResizeObserver((_, observer) => {
        requestAnimationFrame(() => requestAnimationFrame(() => done(observer.disconnect())));
      }).observe(document.body);
    })`,
    returnByValue: true,
    awaitPromise: true,
  });
};
