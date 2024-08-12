const lock = new (require('async-lock'))();
const { setViewport } = require('./browser');
const { setTimeout } = require('timers/promises');
const { readFile, writeFile } = require('fs/promises');

exports.configure = async (cleanup, browser, bounds = {}, sync = () => {}) => {
  browser.process.once('exit', () => cleanup(browser));

  browser.configure = async () => {
    if (bounds.width && bounds.height) {
      await sync(() => setViewport(browser, bounds));
    }
  };

  await browser.configure();
};

exports.synchronize = async (id, pwd, bounds = {}, action = () => {}) => {
  const configPath = `${pwd}/s/${id}1.ini`;

  await lock.acquire(id, async () => {
    let configContent = await readFile(configPath, 'utf8');

    for (const reset of [true, false]) {
      if (!reset) await Promise.resolve(action());

      for (const key of ['availWidth', 'availHeight']) {
        configContent = configContent.replace(new RegExp(`${key}=(.+)`), () => {
          return `${key}=${reset ? 'BAS_NOT_SET' : bounds[key]}`;
        });
      }

      await writeFile(configPath, configContent);
      await setTimeout(2000);
    }
  });
};
