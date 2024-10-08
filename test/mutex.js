const assert = require('assert').strict;
const stub = require('./helpers/stub');

describe('mutex', () => {
  const id = require.resolve('../src/plugin/mutex');

  it('should not throw an error if the runtime is fully supported', () => {
    assert.doesNotThrow(() => require(id));
  });

  ['platform', 'arch'].forEach((prop) => {
    it(`should throw an error if the OS ${prop} is not supported`, () => {
      const restore = stub(process, prop, 'dummy');

      assert.throws(() => require(id));
      restore();
    });
  });

  describe('#create', () => {
    const { create } = require(id);

    it('should be a function', () => {
      assert.equal(typeof create, 'function');
    });

    it('should properly create a named mutex', () => {
      assert.doesNotThrow(() => create('test'));
    });

    it('should throw an error when creating an unnamed mutex', () => {
      assert.throws(() => create());
    });
  });

  afterEach(() => delete require.cache[id]);
});
