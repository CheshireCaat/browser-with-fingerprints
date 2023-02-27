const { env } = require('process');
const { reset } = require('./settings');
const { notify } = require('./notifier');
const lock = new (require('async-lock'))();
const client = new (require('bas-remote-node'))({ scriptName: 'FingerprintPlugin', workingDir: env.FINGERPRINT_CWD });

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
            () => reject(new Error(`Timed out while calling a "${name}" method.`)),
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

exports.fetch = (token, parameters) => call('fetch', { token, parameters });

exports.setup = (proxy, fingerprint) => call('setup', { proxy, fingerprint });
