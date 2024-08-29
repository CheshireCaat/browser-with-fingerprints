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

  async #run(spawn, options = {}) {
    const { proxy, fingerprint } = this.setProxyFromArguments(options.args);

    const { id, pid, pwd, path, bounds, ...config } = await setup(proxy, fingerprint, {
      version: this.version,
      profile: this.profile ?? {
        options: {
          loadProxy: true,
          loadFingerprint: true,
        },
        value: getProfilePath(options),
      },
      pid: crypto.randomUUID(),
      key: typeof options.key === 'string' ? options.key : serviceKey,
    });

    await cleaner.run(path).ignore(pid, id);

    mutex.create(`BASProcess${pid}`);

    const browser = await (spawn ? launcher : (options.launcher ?? this.launcher)).launch({
      ...options,
      headless: false,
      userDataDir: null,
      defaultViewport: null,
      executablePath: `${path}/worker.exe`,
      args: [`--parent-process-id=${pid}`, `--unique-process-id=${id}`, ...defaultArgs({ ...options, ...config })],
    });

    await (spawn ? configure : this.configure.bind(this))(
      () => cleaner.include(pid, id),
      browser,
      bounds,
      synchronize.bind(null, id, pwd, bounds)
    );

    return browser;
  }

  async versions(format = 'default') {
    return await versions(format /* value */);
  }

  async fetch(...parameters) {
    const [key, options = {}] = parameters.length === 2 ? parameters : [serviceKey, parameters[0]];
    return await fetch(key, options, { version: this.version });
  }

  async launch(options = {}) {
    return await this.#run(false, options);
  }

  async spawn(options = {}) {
    return await this.#run(true, options);
  }
};

let serviceKey = null;
