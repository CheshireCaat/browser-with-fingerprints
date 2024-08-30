const dedent = require('dedent');
const { env } = require('process');
const server = require('./server');
const { reset } = require('./settings');
const { notify } = require('./notifier');
const lock = new (require('async-lock'))();
const debug = require('debug')('browser-with-fingerprints:connector');
const config = { timeout: env.FINGERPRINT_TIMEOUT, restart: false, timer: null };
const client = new (require('bas-remote-node'))({
  scriptName: 'FingerprintPluginV10',
  workingDir: env.FINGERPRINT_CWD,
});

server.listen().then(({ port }) => {
  Object.assign(client.options, {
    args: [`--mock-pcap-port=${port}`],
  });
  debug(`PCAP server listening on ${port}`);
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

async function call(name, params = {}) {
  let timer = clearTimeout(config.timer);
  return await lock.acquire('client', async () => {
    try {
      if (config.restart) {
        debug('Restart the client');
        config.restart = false;
        await client.close();
      }
      await client.start();
      await reset(client._engine.exeDir, client._engine.zipDir);
      if (name === 'fetch') timer = notify(params.key);
      // prettier-ignore
      const { error, ...result } = await Promise.race([
        client.runFunction(`api_${name}`, params),
        params?.options?.perfectCanvasRequest ? null : new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Timed out while calling the "${name}" method.`)),
            config.timeout ?? 300_000
          ).unref();
        }),
      ].filter(Boolean));

      if (error) {
        throw new Error(prepareError(error));
      }
      return result.response ?? result;
    } finally {
      config.timer = setTimeout(() => {
        debug('Close the client');
        return client.close();
      }, 300_000).unref();
      clearTimeout(timer);
    }
  });
}

client.on('messageReceived', (evt) => {
  evt.type === 'log' && console.log(evt.data.text.split(' : ')[1]);
});

client._engine.on('beforeExtract', () => {
  console.log('The browser is installing - this may take some time.');
});

client._engine.on('beforeDownload', () => {
  console.log('The browser is downloading - this may take some time.');
});

exports.setEngineOptions = ({ folder = '', timeout = 0 } = {}) => {
  if (folder) {
    const restart = config.folder !== folder;
    Object.assign(config, { restart });
    client.setWorkingFolder(folder);
  }
  folder && (config.folder = folder);
  timeout && (config.timeout = timeout);
};

exports.versions = (format = 'default') => call('versions', { format });

exports.fetch = (key, options, configuration) => call('fetch', { key, options, ...configuration });

exports.setup = (proxy, fingerprint, configuration) => call('setup', { proxy, fingerprint, ...configuration });
