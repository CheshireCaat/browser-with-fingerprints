const path = require('path');
const fs = require('fs/promises');
const { kill } = require('process');
const axios = require('axios').default;
const extract = require('extract-zip');
const EventEmitter = require('events');
const { createHash } = require('crypto');
const { execFile } = require('child_process');
const { pipeline } = require('stream/promises');
const { InvalidEngineError } = require('./errors');
const { createReadStream, createWriteStream } = require('fs');

const CWD = path.join(process.cwd(), 'data');

const ARCH = process.arch.includes('32') ? '32' : '64';

module.exports = class RemoteEngine extends EventEmitter {
  #cwd = null;
  get cwd() {
    return this.#cwd;
  }

  #meta = null;
  get meta() {
    return this.#meta;
  }

  set cwd(cwd = CWD) {
    this.#cwd = path.resolve(cwd);
  }

  constructor(options = {}) {
    super();
    this.cwd = options.cwd;
    this.args = options.args;
    this.timeout = options.timeout;
  }

  async runFunction(name, params = {}) {
    if (!this.#meta) await this.#updateMeta();
    const process = await this.#startProcess();

    const requestDir = path.join(path.dirname(process.spawnfile), 'r');
    await fs.mkdir(requestDir, { recursive: true });

    for (const requestName of await fs.readdir(requestDir)) {
      try {
        kill(requestName.split('_')[0], 0);
      } catch (err) {
        if (err.code === 'ESRCH') {
          await fs.unlink(path.join(requestDir, requestName));
        }
      }
    }

    const requestPath = path.join(requestDir, `${process.pid}_${crypto.randomUUID()}.json`);
    await fs.writeFile(requestPath, JSON.stringify({ name, params }));

    await new Promise((resolve) => process.on('close', resolve));
    const response = await fs.readFile(requestPath, 'utf8');
    await fs.unlink(requestPath);
    return JSON.parse(response);
  }

  async #startProcess() {
    const scriptDir = path.join(this.#cwd, 'script', this.#meta.version);
    const engineDir = path.join(this.#cwd, 'engine', this.#meta.version);
    const zipPath = path.join(engineDir, `FastExecuteScript.x${ARCH}.zip`);

    if (this.#meta && (await exists(zipPath))) {
      if (this.#meta.checksum !== (await checksum(zipPath))) {
        await fs.rm(engineDir, { recursive: true });
      }
    }

    if (!(await exists(engineDir))) {
      this.emit('beforeDownload');
      await fs.mkdir(engineDir, { recursive: true });
      await download(this.#meta.url, zipPath);
    }

    if (!(await exists(scriptDir))) {
      this.emit('beforeExtract');
      await fs.mkdir(scriptDir, { recursive: true });
      await extract(zipPath, { dir: scriptDir });
    }

    await fs.copyFile(path.resolve('./project.xml'), path.join(scriptDir, 'project.xml'));
    await fs.writeFile(path.join(scriptDir, 'worker_command_line.txt'), '--mock-connector');
    await fs.writeFile(path.join(scriptDir, 'settings.ini'), 'RunProfileRemoverImmediately=true');

    return execFile(
      path.join(scriptDir, 'FastExecuteScript.exe'),
      ['--silent', ...this.args],
      { cwd: scriptDir },
      (error) => {
        if (error && error.code && error.code > 1) {
          throw new InvalidEngineError(`Unable to start engine process (code: ${error.code})`);
        }
      }
    );
  }

  async #updateMeta() {
    const project = await fs.readFile(path.resolve('./project.xml'), 'utf8');
    const version = project.match(/<EngineVersion>(\d+.\d+.\d+)<\/EngineVersion>/)[1];
    const url = `http://bablosoft.com/distr/FastExecuteScript${ARCH}/${version}/FastExecuteScript.x${ARCH}.zip.meta.json`;

    const metaPath = path.join(this.#cwd, `${version}_${ARCH}.json`);
    if (await exists(metaPath)) {
      this.#meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    } else {
      this.#meta = await axios.get(url).then(({ data }) => ({
        checksum: data.Checksum,
        url: data.Url,
        version,
      }));

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
