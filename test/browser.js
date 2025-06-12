const { plugin } = require('..');
const assert = require('assert').strict;
const { setViewport } = require('../src/plugin/browser');

const viewports = Array.from({ length: 6 }, (_, i) => ({
  width: (i + 5) * 100,
  height: (i + 5) * 100,
}));

describe('browser', () => {
  describe('#setViewport()', () => {
    let browser = null;

    beforeEach(async function () {
      browser = await plugin.spawn({
        headless: this.test.title.includes('headless'),
      });
    });

    afterEach(async () => {
      await browser?.close();
    });

    ['headless', 'headful'].forEach((type) => {
      it(`should change the ${type} browser viewport size`, async () => {
        for (const viewport of viewports) {
          await assert.doesNotReject(
            setViewport(browser, viewport),
            `Setting viewport to ${viewport.width}x${viewport.height} failed.`
          );
        }
      });
    });
  });
});
