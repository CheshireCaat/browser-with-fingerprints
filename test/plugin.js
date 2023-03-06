const path = require('path');
const fs = require('fs/promises');
const assert = require('assert').strict;
const { plugin, FingerprintPlugin } = require('..');

describe('plugin', () => {
  const stub = FingerprintPlugin.create({ launch: (options) => options });

  describe('#fetch()', () => {
    [false, true].forEach((premium) => {
      const key = premium ? process.env.FINGERPRINT_KEY : '';

      it(`should obtain a fingerprint ${premium ? 'with' : 'without'} a service key`, async () => {
        if (key == null) assert.fail('The service key is not specified.');

        let result = null;

        await assert.doesNotReject(
          async () => (result = await plugin.fetch(key, { tags: ['Microsoft Windows', 'Chrome'] }))
        );

        assert.notEqual(result, null);
        assert.equal(typeof result, 'string');
        assert.doesNotThrow(() => JSON.parse(result));
      });
    });

    it('should throw an error if an unsupported fingerprint tag is passed', async () => {
      await assert.rejects(() => {
        return plugin.fetch('', { tags: ['Microsoft Windows', 'Chrome', 'Foo'] });
      }, /The "Foo" fingerprint tag is not supported in this plugin./);
    });

    it('should throw an error if getting a fingerprint takes too long', async () => {
      process.env.FINGERPRINT_TIMEOUT = 0;

      await assert.rejects(() => {
        return plugin.fetch('', { tags: ['Microsoft Windows', 'Chrome'] });
      }, /Timed out while calling a "fetch" method./);
    });

    after(() => (process.env.FINGERPRINT_TIMEOUT = 300000));
  });

  describe('#spawn()', () => {
    let browser = null;

    it('should launch a browser process without a connection', async () => {
      await assert.doesNotReject(async () => (browser = await plugin.spawn()));

      assert(browser);
      assert.equal(typeof browser, 'object');

      assert(browser.url);
      assert.equal(typeof browser.url, 'string');

      assert(browser.port);
      assert.equal(typeof browser.port, 'number');

      assert(browser.process);
      assert.equal(typeof browser.process, 'object');

      assert.match(browser.process.constructor.name, /Process/);
    });

    after(() => browser.process.kill());
  });

  describe('#launch()', () => {
    it('should throw an error if the launcher is missing', async () => {
      await assert.rejects(() => plugin.launch());
    });

    it('should override the "headless" and "executablePath" options', async () => {
      const actual = await stub.launch({ headless: true, executablePath: 'worker.exe' });

      assert.notDeepEqual(actual, { headless: true, executablePath: 'worker.exe' });
    });

    it('should always pass the default argument list to the launcher', async () => {
      const actual = await stub.launch();

      assert.notEqual(actual.args, null);
      assert(Array.isArray(actual.args));
      assert.notEqual(actual.args.length, 0);
    });

    it('should launch a browser with configuration files', async () => {
      const { args, executablePath } = await stub.useFingerprint().launch();

      const pid = args.find((arg) => arg.includes('parent')).split('=')[1];
      const id = args.find((arg) => arg.includes('unique')).split('=')[1];

      for (const item of [`t/${pid}`, `${id}.ini`, `${id}1.ini`]) {
        await assert.doesNotReject(
          fs.access(path.join(path.dirname(executablePath), item.includes(id) ? '../../s' : '', item))
        );
      }
    });

    it('should throw an error if an invalid fingerprint is applied', async () => {
      for (const message of ['Key not found', 'Key not valid']) {
        const fingerprint = JSON.stringify({ valid: false, message });

        await assert.rejects(() => stub.useFingerprint(fingerprint).launch(), new RegExp(message));
      }
    });

    it('should throw an error if an invalid proxy is applied', async () => {
      for (const proxy of ['localhost:localhost', '127.0.0.1:127.0.0.1']) {
        await assert.rejects(() => stub.useProxy(proxy).launch(), /Failed to parse proxy/);
      }
    });

    afterEach(() => (delete stub.proxy, delete stub.fingerprint));
  });

  stub.configure = (cleanup) => cleanup();
});