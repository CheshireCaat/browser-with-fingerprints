const assert = require('assert').strict;
const Loader = require('../src/loader');

describe('loader', () => {
  let loader = null;

  describe('#load()', () => {
    describe('if the minimum version is specified', () => {
      it('should throw an error if the version does not match the required one', () => {
        assert.throws(() => load('mocha', '99.0.0'));
      });
    });

    it('should return the original package and its version', () => {
      assert.equal(load('mocha'), require('mocha'));
    });
  });

  it('should correctly create an instance', () => {
    loader = new Loader('foo', null, ['foo', 'bar']);
  });

  it('should have static class members', () => {
    assert.equal(typeof Loader.import, 'function');
  });

  it('should have public class members', () => {
    assert.equal(typeof loader.load, 'function');
  });

  const load = (...args) => new Loader(...args).load();
});
