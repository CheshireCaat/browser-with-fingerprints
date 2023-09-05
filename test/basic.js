const assert = require('assert').strict;
const { plugin, FingerprintPlugin } = require('..');

describe('plugin', () => {
  it('should be an object', () => {
    assert.notEqual(plugin, null);
    assert.equal(typeof plugin, 'object');
  });

  it('should be an instance of "FingerprintPlugin"', () => {
    assert.equal(plugin.constructor, FingerprintPlugin);
  });

  it('should have static class members', () => {
    assert.equal(typeof FingerprintPlugin.create, 'function');
  });

  it('should have internal class members', () => {
    assert.equal(typeof plugin.setProxyFromArguments, 'function');
  });

  it('should have public class members', () => {
    for (const method of [
      'fetch',
      'spawn',
      'launch',
      'useProxy',
      'useProfile',
      'useFingerprint',
      'useBrowserVersion',
    ]) {
      assert.equal(typeof plugin[method], 'function');
    }
    assert.equal(typeof plugin.versions, 'function');
    assert.equal(typeof plugin.version, 'string');
  });

  for (const method of ['useProxy', 'useProfile', 'useFingerprint']) {
    const property = method.slice(3).toLowerCase();

    describe(`#${method}()`, () => {
      it('should allow empty values to be passed', () => {
        assert.doesNotThrow(() => plugin[method]());
      });

      it('should throw an error if an invalid options are passed', () => {
        assert.throws(() => plugin[method]({}, {}));
        assert.throws(() => plugin[method]('', ''));
      });

      it('should return the current plugin instance as a result', () => {
        assert.equal(plugin, plugin[method]());
      });

      it('should change the corresponding configuration', () => {
        assert.deepEqual(plugin[method]()[property], { value: '', options: {} });
      });

      afterEach(() => delete plugin[property]);
    });
  }

  describe('#setProxyFromArguments()', () => {
    const proxy = 'https://127.0.0.1:8080';

    it('should change the proxy configuration if the required argument is specified', () => {
      plugin.setProxyFromArguments([`--proxy-server=${proxy}`]);

      assert.equal(plugin.proxy?.value, proxy);
    });

    it('should keep the proxy configuration if the required argument is omitted', () => {
      plugin.setProxyFromArguments([`--proxy-value=${proxy}`]);

      assert.equal(plugin.proxy?.value, undefined);
    });

    it('should return the current plugin instance as a result', () => {
      assert.equal(plugin, plugin.setProxyFromArguments());
    });

    afterEach(() => delete plugin.proxy);
  });
});
