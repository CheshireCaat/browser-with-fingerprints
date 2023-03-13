/**
 * Common scripts used for browser configuration.
 */
exports.scripts = {
  /**
   * Wait for the browser to resize.
   *
   * In some cases, when the browser is in visible mode, resizing can take some time.
   * In order not to use hardcoded values, we need to wait for the page to resize.
   * The `ResizeObserver` in conjunction with `requestAnimationFrame` is convenient in that we don't need to use the `setTimeout` method.
   *
   * @internal
   */
  waitForResize: () => {
    return new Promise((done) => {
      new ResizeObserver((_, observer) => {
        requestAnimationFrame(() => requestAnimationFrame(() => done(observer.disconnect())));
      }).observe(document.body);
    });
  },

  /**
   * Get the browser viewport size.
   *
   * @internal
   */
  getViewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
};
