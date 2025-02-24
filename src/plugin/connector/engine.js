const path = require('path');
const fs = require('fs/promises');
const { kill } = require('process');
const chokidar = require('chokidar');
const axios = require('axios').default;
const extract = require('extract-zip');
const EventEmitter = require('events');
const { pipeline } = require('stream/promises');
const { createHash, randomUUID } = require('crypto');
const { execFile, ChildProcess } = require('child_process');
const { createReadStream, createWriteStream } = require('fs');
const debug = require('debug')('browser-with-fingerprints:connector:engine');
const { InvalidEngineError, EngineTimeoutError, RequestTimeoutError } = require('../errors');

const CLOSE_TIMEOUT = 60_000;

const DEFAULT_TIMEOUT = 300_000;

const CWD = path.join(process.cwd(), 'data');

const ARCH = process.arch.includes('32') ? '32' : '64';

const PROJECT_PATH = path.resolve(__dirname, '../../../project.xml');

module.exports = class RemoteEngine extends EventEmitter {
  #meta = null;

  #cwd = null;
  setCwd(value) {
    this.#cwd = path.resolve(value || CWD);
  }

  #args = null;
  setArgs(value) {
    this.#args = Array.isArray(value) ? value : [];
  }

  #engineTimeout = 0;
  setEngineTimeout(value) {
    const timeout = +value || 0;
    this.#engineTimeout = timeout >= 0 ? timeout : DEFAULT_TIMEOUT;
  }

  #requestTimeout = 0;
  setRequestTimeout(value) {
    const timeout = +value || 0;
    this.#requestTimeout = timeout >= 0 ? timeout : DEFAULT_TIMEOUT;
  }

  constructor(options = {}) {
    super();
    this.setCwd(options.cwd);
    this.setArgs(options.args);
    this.setEngineTimeout(options.engineTimeout);
    this.setRequestTimeout(options.requestTimeout);
  }

  async runFunction(name, params, { engineTimeout = this.#engineTimeout, requestTimeout = this.#requestTimeout } = {}) {
    if (!this.#meta) await this.#updateMeta();
    const process = await this.#startProcess(engineTimeout);
    debug(`Calling the "${name}" method (timeout set to ${requestTimeout}ms)`);

    const requestDir = path.join(path.dirname(process.spawnfile), 'r');
    await fs.mkdir(requestDir, { recursive: true });

    for (const requestName of await fs.readdir(requestDir)) {
      try {
        const pid = +requestName.split('_')[0];
        if (pid === process.pid) continue;
        kill(pid, 0);
      } catch (err) {
        if (err.code === 'ESRCH') {
          debug(`Delete unused request file - ${requestName}`);
          await fs.unlink(path.join(requestDir, requestName));
        }
      }
    }

    const requestPath = path.join(requestDir, `${process.pid}_${randomUUID()}.json`);
    debug(`Create new request file for the "${name}" function  - ${requestPath}`);
    await fs.writeFile(requestPath, JSON.stringify({ name, params }));

    const requestWatcher = chokidar.watch(requestPath, {
      awaitWriteFinish: true,
    });
    const response = await new Promise((resolve, reject) => {
      let closeTimer = null;
      let requestTimer = null;

      if (requestTimeout) {
        requestTimer = setTimeout(
          () => reject(new RequestTimeoutError(`Timed out while calling the "${name}" method.`)),
          requestTimeout
        ).unref();
      }

      const closeHandler = () => {
        closeTimer = setTimeout(() => {
          debug('Engine process was closed during request');
          resolve();
        }, CLOSE_TIMEOUT);
      };

      requestWatcher.on('change', async () => {
        const response = await fs.readFile(requestPath, 'utf8');
        debug('Function result was successfully obtained');

        if (requestTimer) clearTimeout(requestTimer);
        if (closeTimer) clearTimeout(closeTimer);
        process.off('close', closeHandler);

        await fs.unlink(requestPath);
        resolve(response);
      });

      process.once('close', closeHandler);
    });

    await requestWatcher.close();
    return JSON.parse(response);
  }

  async #startProcessInternal() {
    const scriptDir = path.join(this.#cwd, 'script', this.#meta.version);
    const engineDir = path.join(this.#cwd, 'engine', this.#meta.version);
    const zipPath = path.join(engineDir, `FastExecuteScript.x${ARCH}.zip`);

    if (this.#meta && (await exists(zipPath))) {
      if (this.#meta.checksum !== (await checksum(zipPath))) {
        await fs.rm(engineDir, { recursive: true });
        debug('Broken engine was removed (invalid checksum)');
      }
    }

    if (!(await exists(engineDir))) {
      this.emit('beforeDownload');
      await fs.mkdir(engineDir, { recursive: true });
      await download(this.#meta.url, zipPath);
      debug('Engine was successfully downloaded');
    }

    if (!(await exists(scriptDir))) {
      this.emit('beforeExtract');
      await fs.mkdir(scriptDir, { recursive: true });
      await extract(zipPath, { dir: scriptDir });
      debug('Engine was successfully extracted');
    }

    await fs.copyFile(PROJECT_PATH, path.join(scriptDir, 'project.xml'));
    await fs.writeFile(path.join(scriptDir, 'worker_command_line.txt'), '--mock-connector');
    await fs.writeFile(path.join(scriptDir, 'settings.ini'), 'RunProfileRemoverImmediately=true');

    debug(`Launching engine process (cwd - ${scriptDir})`);
    return execFile(
      path.join(scriptDir, 'FastExecuteScript.exe'),
      ['--silent', ...this.#args],
      { cwd: scriptDir },
      (error) => {
        if (error) {
          throw new InvalidEngineError(`Unable to start engine process (code: ${error.code})`);
        }
      }
    );
  }

  async #startProcess(timeout) {
    if (!timeout) return await this.#startProcessInternal();

    let timer = null;
    /** @type {ChildProcess} */
    const process = await Promise.race([
      this.#startProcessInternal(),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new EngineTimeoutError('Timed out while initializing the plugin engine.')),
          timeout
        ).unref();
      }),
    ]);

    clearTimeout(timer);
    return process;
  }

  async #updateMeta() {
    const project = await fs.readFile(PROJECT_PATH, 'utf8');
    const version = project.match(/<EngineVersion>(\d+.\d+.\d+)<\/EngineVersion>/)[1];
    debug(`Update metadata for the engine project (arch - ${ARCH}, version - ${version})`);
    const url = `http://bablosoft.com/distr/FastExecuteScript${ARCH}/${version}/FastExecuteScript.x${ARCH}.zip.meta.json`;

    const metaPath = path.join(this.#cwd, `${version}_${ARCH}.json`);
    if (await exists(metaPath)) {
      debug(`Use cached metadata from ${metaPath}`);
      this.#meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    } else {
      debug(`Request actual metadata from ${url}`);
      this.#meta = await axios.get(url).then(({ data }) => ({
        checksum: data.Checksum,
        url: data.Url,
        version,
      }));

      await fs.mkdir(path.dirname(metaPath), { recursive: true });
      await fs.writeFile(metaPath, JSON.stringify(this.#meta));
    }
  }
};

async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function checksum(path) {
  const reader = createReadStream(path);
  const hash = createHash('sha1');
  await pipeline(reader, hash);
  return hash.digest('hex');
}

async function download(url, path) {
  return axios.get(url, { responseType: 'stream' }).then((response) => {
    const writer = createWriteStream(path);
    return pipeline(response.data, writer);
  });
}
