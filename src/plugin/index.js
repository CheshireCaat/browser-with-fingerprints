const mutex = require('./mutex');
const cleaner = require('./cleaner');
const launcher = require('./launcher');
const { configure, synchronize } = require('./config');
const { setup, fetch, versions } = require('./connector');
const { defaultArgs, getProfilePath, validateConfig, validateLauncher } = require('./utils');

module.exports = class FingerprintPlugin {
  useFingerprint(value = '', options = {}) {
    validateConfig('fingerprint', value, options);

    this.fingerprint = { value, options };
    return this;
  }

  useProxy(value = '', options = {}) {
    validateConfig('proxy', value, options);

    this.proxy = { value, options };
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

  async #run(spawn, options = {}) {
    const { proxy, fingerprint } = this.setProxyFromArguments(options.args);

    const { id, pid, pwd, path, bounds, ...config } = await setup(proxy, fingerprint, {
      profile: getProfilePath(options),
      version: this.version,
    });

    await cleaner.run(path).ignore(pid, id);

    mutex.create(`BASProcess${pid}`);

    const browser = await (spawn ? launcher : options.launcher ?? this.launcher).launch({
      ...options,
      headless: false,
      userDataDir: null,
      defaultViewport: null,
      executablePath: `${path}/worker.exe`,
      args: [`--parent-process-id=${pid}`, `--unique-process-id=${id}`, ...defaultArgs({ ...options, ...config })],
    });

    await (spawn ? configure : this.configure.bind(this))(
      (target) => target === browser && cleaner.include(pid, id),
      browser,
      bounds,
      synchronize.bind(null, id, pwd, bounds)
    );

    return browser;
  }

  async versions(format = 'default') {
    return await versions(format /* type */);
  }

  async fetch(key, options = {}) {
    return await fetch(key, { ...options });
  }

  async launch(options = {}) {
    return await this.#run(false, options);
  }

  async spawn(options = {}) {
    return await this.#run(true, options);
  }

  static create(launcher) {
    validateLauncher(launcher);
    return new this(launcher);
  }

  constructor(launcher) {
    this.launcher = launcher;
    this.version = 'default';
  }
};
