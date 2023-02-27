const { plugin } = require('..');
const assert = require('assert').strict;
const { setViewport } = require('../src/plugin/browser');

describe('browser', () => {
  describe('#setViewport()', () => {
    let browser = null;

    ['headless', 'headful'].forEach((type) => {
      it(`should change the ${type} browser viewport size`, async () => {
        for (let step = 5; step <= 10; ++step) {
          const viewport = { width: step * 100, height: step * 100 };

          await assert.doesNotReject(setViewport(browser, viewport));
        }
      });
    });

    beforeEach(async function () {
      browser = await plugin.spawn({
        headless: !this.test.title.includes('headful'),
      });
    });

    afterEach(() => browser.close());
  });
});
