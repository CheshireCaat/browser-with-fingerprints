const { notify } = require('./utils');
const RemoteEngine = require('./engine');
const pcapServer = require('./pcapServer');
const lock = new (require('async-lock'))();
const { PluginError, MissingKeyError } = require('../errors');
const debug = require('debug')('browser-with-fingerprints:connector');

const engine = new RemoteEngine({
  cwd: process.env.FINGERPRINT_CWD,
  engineTimeout: process.env.FINGERPRINT_TIMEOUT,
  requestTimeout: process.env.FINGERPRINT_TIMEOUT,
});

engine.on('beforeExtract', () => {
  console.log('The browser is installing - this may take some time.');
});

engine.on('beforeDownload', () => {
  console.log('The browser is downloading - this may take some time.');
});

pcapServer.listen().then((port) => {
  debug(`PCAP server listening on ${port}`);
  engine.setArgs([`--mock-pcap-port=${port}`]);
});

exports.api = async (name, params = {}) => {
  let notifyTimer = null;

  return await lock.acquire('client', async () => {
    try {
      if (name === 'fetch') notifyTimer = notify(params.key);
      const { error, ...result } = await engine.runFunction(name, params, {
        requestTimeout: params?.options?.perfectCanvasRequest ? 0 : engine.requestTimeout,
      });

      if (error) {
        throw error.includes('key is missing') ? new MissingKeyError(error) : new PluginError(error);
      }

      return result.response ?? result;
    } finally {
      clearTimeout(notifyTimer);
    }
  });
};

exports.engine = engine;
