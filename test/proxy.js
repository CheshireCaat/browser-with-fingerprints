const assert = require('assert').strict;
const { plugin } = require('..');

describe('plugin', () => {
  describe('#useProxy', () => {
    const ipExtractionConfigs = [
      {
        ipExtractionURL: 'https://api.ipapi.is/',
        ipExtractionMethod: 'jsonpath',
        ipExtractionParam: '$.ip',
      },
      {
        ipExtractionURL: 'https://api.ipapi.is/',
        ipExtractionMethod: 'regexp',
        ipExtractionParam: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
      },
      {
        ipExtractionURL: 'https://ipwho.is/?output=xml',
        ipExtractionMethod: 'xpath',
        ipExtractionParam: '//query/ip',
      },
      {
        ipExtractionURL: 'https://api.ipify.org/',
        ipExtractionMethod: 'raw',
        ipExtractionParam: '',
      },
    ];

    for (const ipExtractionConfig of ipExtractionConfigs) {
      const method = ipExtractionConfig.ipExtractionMethod;

      it(`should correctly use the "${method}" IP extraction method`, async () => {
        let browser;
        try {
          browser = await plugin.useProxy('', ipExtractionConfig).spawn();
          assert.ok(browser, `The IP must be successfully extracted using the "${method}" method`);
        } catch (error) {
          assert.fail(`Failed to parse IP using the "${method}" method: ${error.message}`);
        } finally {
          if (browser) {
            await browser.close();
          }
        }
      });
    }
  });
});
