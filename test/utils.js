const path = require('path');
const assert = require('assert').strict;
const { defaultArgs, getProfilePath, validateConfig, validateLauncher } = require('../src/plugin/utils');

describe('utils', () => {
  const DEFAULT_ARGS = ['--no-proxy-server', `--disable-features=NetworkServiceInProcess2`];

  describe('#defaultArgs()', () => {
    it('should add extra arguments if extensions or profile are passed', () => {
      const args = defaultArgs({
        args: ['--load-extension=test', '--disable-extensions-except=test'],
        extensions: ['path'],
        profile: 'test',
      });

      assert(args.includes('--user-data-dir=test'));
      assert(args.includes(`--load-extension=path`));
      assert(args.includes(`--load-extension=path,test`));
      assert(args.includes(`--disable-extensions-except=path,test`));
    });

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

  describe('#validateConfig()', () => {
    it('should do nothing when valid arguments are passed', () => {
      assert.doesNotThrow(() => validateConfig('test', '', {}));
    });

    it('should throw an error otherwise', () => {
      assert.throws(() => validateConfig('test', {}, ''), {
        message: 'Invalid arguments for test configuration.',
      });
    });
  });

  describe('#getProfilePath()', () => {
    const expected = path.resolve('./test');

    it('should extract the profile path from the "args" option', () => {
      assert.equal(getProfilePath({ args: [`--user-data-dir=${expected}`] }), expected);
    });

    it('should extract the profile path from the "userDataDir" option', () => {
      assert.equal(getProfilePath({ userDataDir: './test' }), expected);
    });

    it('should return an empty string if options are not specified or missing', () => {
      assert.equal(getProfilePath({ args: [], userDataDir: '' }), '');
      assert.equal(getProfilePath({ userDataDir: '' }), '');
      assert.equal(getProfilePath({ args: [] }), '');
    });
  });
});
