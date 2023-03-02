const assert = require('assert').strict;
const { defaultArgs, validateLauncher } = require('../src/plugin/utils');

describe('utils', () => {
  const DEFAULT_ARGS = ['--no-sandbox', '--no-proxy-server', `--disable-features=NetworkServiceInProcess2`];

  describe('#defaultArgs()', () => {
    [false, true].forEach((headless) => {
      it(`should properly handle ${headless ? 'enabled' : 'disabled'} "headless" flag`, () => {
        assert(defaultArgs({ headless }).includes('--bas-force-visible-window') !== headless);
      });
    });

    it('should always remove ignored arguments', () => {
      ['kiosk', 'headless', 'start-maximized', 'start-fullscreen'].forEach((name) => {
        for (const argument of [`--${name}`, `--${name}=value`]) {
          assert(!defaultArgs({ args: [argument] }).includes(argument));
        }
      });
    });

    it('should always return default arguments', () => {
      assert.deepEqual(defaultArgs().slice(0, DEFAULT_ARGS.length), DEFAULT_ARGS);
    });
  });

  describe('#validateLauncher()', () => {
    it('should not throw an error when the valid value is passed', () => {
      assert.doesNotThrow(() => validateLauncher({ launch: () => {} }));
    });

    it('should throw an error when the invalid value is passed', () => {
      for (const launcher of [false, null, {}]) {
        assert.throws(() => validateLauncher(launcher));
      }
    });
  });
});
