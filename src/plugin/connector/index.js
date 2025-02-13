const dedent = require('dedent');
const server = require('./server');
const { notify } = require('./utils');
const RemoteEngine = require('./engine');
const lock = new (require('async-lock'))();
const debug = require('debug')('browser-with-fingerprints:connector');

const DEFAULT_TIMEOUT = 300_000;
const engine = new RemoteEngine({
  timeout: process.env.FINGERPRINT_TIMEOUT,
  cwd: process.env.FINGERPRINT_CWD,
});

engine.on('beforeExtract', () => {
  console.log('The browser is installing - this may take some time.');
});

engine.on('beforeDownload', () => {
  console.log('The browser is downloading - this may take some time.');
});

server.listen().then(({ port }) => {
  debug(`PCAP server listening on ${port}`);
  engine.args = [`--mock-pcap-port=${port}`];
});

const prepareError = (message) => {
  if (message.includes('key is missing')) {
    return dedent`
      ${message}
      Due to the latest updates, it is necessary to specify the key not only when receiving it, but also when applying it.
      To solve the problem, use the documentation at the link - https://github.com/CheshireCaat/browser-with-fingerprints#common-problems.
    `;
  }
  return message;
};

exports.api = async (name, params = {}) => {
  let timer = null;
  return await lock.acquire('client', async () => {
    try {
      if (name === 'fetch') timer = notify(params.key);
      // prettier-ignore
      const { error, ...result } = await Promise.race([
        engine.runFunction(name, params),
        params?.options?.perfectCanvasRequest ? null : new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Timed out while calling the "${name}" method.`)),
            engine.timeout ?? DEFAULT_TIMEOUT
          ).unref();
        }),
      ].filter(Boolean));

      if (error) {
        throw new Error(prepareError(error));
      }
      return result.response ?? result;
    } finally {
      clearTimeout(timer);
    }
  });
};

exports.setEngineOptions = ({ folder = '', timeout = 0 } = {}) => {
  timeout && (engine.timeout = timeout);
  folder && (engine.cwd = folder);
};
