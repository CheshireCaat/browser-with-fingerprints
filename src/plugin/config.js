const lock = new (require('async-lock'))();
const { setViewport } = require('./browser');
const { readFile, writeFile } = require('fs').promises;

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
  await lock.acquire(id, async () => {
    const file = `${pwd}/browser/s/${id}1.ini`;
    let config = await readFile(file, 'utf8');

    for (const reset of [true, false]) {
      if (!reset) await Promise.resolve(action());

      for (const key of ['availWidth', 'availHeight']) {
        config = config.replace(new RegExp(`${key}=(.+)`), () => {
          return `${key}=${reset ? 'BAS_NOT_SET' : bounds[key]}`;
        });
      }

      await writeFile(file, config).then(() => sleep(2000));
    }
  });
};

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
