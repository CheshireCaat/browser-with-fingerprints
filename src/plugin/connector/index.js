const { env } = require('process');
const server = require('./server');
const { reset } = require('./settings');
const { notify } = require('./notifier');
const lock = new (require('async-lock'))();
const client = new (require('bas-remote-node'))({ scriptName: 'FingerprintPluginV3', workingDir: env.FINGERPRINT_CWD });

server.listen().then(({ port }) => {
  Object.assign(client.options, {
    args: [`--mock-pcap-port=${port}`],
  });
});

async function call(name, params = {}) {
  let timer = null;
  return await lock.acquire('client', async () => {
    try {
      await client.start();
      reset(client._engine.exeDir, client._engine.zipDir);
      if (name === 'fetch') timer = notify(params.token);
      const { error, ...result } = await Promise.race([
        client.runFunction(`api_${name}`, params),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Timed out while calling the "${name}" method.`)),
            env.FINGERPRINT_TIMEOUT ?? 300000
          ).unref();
        }),
      ]);

      if (error) throw new Error(error);
      return result.response ?? result;
    } finally {
      clearTimeout(timer);
      await client.close();
    }
  });
}

client._engine.on('beforeExtract', () => {
  console.log('The browser is installing - this may take some time.');
});

client._engine.on('beforeDownload', () => {
  console.log('The browser is downloading - this may take some time.');
});

exports.versions = (format = 'default') => call('versions', { format });

exports.fetch = (token, parameters) => call('fetch', { token, parameters });

exports.setup = (proxy, fingerprint, configuration) => call('setup', { proxy, fingerprint, ...configuration });
