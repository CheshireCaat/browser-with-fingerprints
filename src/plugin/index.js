const crypto = require('crypto');
const mutex = require('./mutex');
const cleaner = require('./cleaner');
const launcher = require('./launcher');
const { configure, synchronize } = require('./config');
const { setup, fetch, versions, setEngineOptions } = require('./connector');
const { defaultArgs, getProfilePath, validateConfig, validateLauncher } = require('./utils');

module.exports = class FingerprintPlugin {
  static create(launcher) {
    validateLauncher(launcher);
    return new this(launcher);
  }

  constructor(launcher) {
    this.launcher = launcher;
    this.version = 'default';
  }

  useFingerprint(value = '', options = {}) {
    validateConfig('fingerprint', value, options);

    this.fingerprint = { value, options };
    return this;
  }

  useProfile(value = '', options = {}) {
    validateConfig('profile', value, options);

    this.profile = { value, options };
    return this;
  }

  useProxy(value = '', options = {}) {
    validateConfig('proxy', value, options);

    this.proxy = { value, options };
    return this;
  }

  useBrowserVersion(version = null) {
    this.version = version;
    return this;
  }

  setProxyFromArguments(args = []) {
    if (this.proxy == null) {
      for (const arg of args) {
        if (arg.includes('--proxy-server')) {
          return this.useProxy(arg.slice(15));
        }
      }
    }

    return this;
  }

  setRequestTimeout(timeout = 0) {
    setEngineOptions({ timeout });
  }

  setWorkingFolder(folder = '') {
    setEngineOptions({ folder });
  }

  setServiceKey(key = '') {
    serviceKey = key;
  }

  async #launch(useDefaultLauncher, options = {}) {
    const { proxy, fingerprint } = this.setProxyFromArguments(options.args);

    const { id, pid, pwd, path, bounds, ...config } = await setup(proxy, fingerprint, {
      version: this.version,
      profile: this.profile ?? {
        value: getProfilePath(options),
        options: { loadProxy: true, loadFingerprint: true },
      },
      pid: crypto.randomUUID(),
      key: typeof options.key === 'string' ? options.key : serviceKey,
    });

    await cleaner.watch(pwd).ignore(pwd, pid, id);

    mutex.create(`BASProcess${pid}`);

    const browser = await (useDefaultLauncher ? launcher : (options.launcher ?? this.launcher)).launch({
      ...options,
      headless: false,
      userDataDir: null,
      defaultViewport: null,
      executablePath: `${path}/worker.exe`,
      args: [`--parent-process-id=${pid}`, `--unique-process-id=${id}`, ...defaultArgs({ ...options, ...config })],
    });

    await (useDefaultLauncher ? configure : this.configure.bind(this))(
      () => cleaner.include(pwd, pid, id),
      browser,
      bounds,
      synchronize.bind(null, id, pwd, bounds)
    );

    return browser;
  }

  async versions(format = 'default') {
    return await versions(format);
  }

  async fetch(...parameters) {
    const [key, options = {}] = parameters.length === 2 ? parameters : [serviceKey, parameters[0]];
    if (parameters.length === 2) {
      console.warn(
        'Warning: the "fetch" method signature with two parameters is deprecated. Please use the new syntax for options together with the "setServiceKey" method usage instead.'
      );
    }
    return await fetch(key, options, { version: this.version });
  }

  async launch(options = {}) {
    return await this.#launch(false, options);
  }

  async spawn(options = {}) {
    return await this.#launch(true, options);
  }
};

let serviceKey = null;
