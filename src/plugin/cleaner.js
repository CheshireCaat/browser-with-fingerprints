const fg = require('fast-glob');
const path = require('path').posix;
const { rm } = require('fs/promises');
const lock = require('proper-lockfile');
const debug = require('debug')('browser-with-fingerprints:cleaner');

const CLEANUP_INTERVAL = 15000;

class SettingsCleaner {
  #timer = null;

  #folders = [];

  async ignore(folder, pid, id) {
    await this.#toggleLock(true, folder, pid, id);
  }

  async include(folder, pid, id) {
    await this.#toggleLock(false, folder, pid, id);
  }

  async #toggleLock(shouldLock, folder, pid, id) {
    for (const item of [`t/${pid}`, `s/${id}.ini`, `s/${id}1.ini`]) {
      const itemPath = path.join(folder, item);
      try {
        await lock[shouldLock ? 'lock' : 'unlock'](itemPath, {
          onCompromised: () => {
            debug(`The lock file at path ${itemPath} was not updated.`);
          },
        });
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
  }

  async #cleanup() {
    for (const folder of this.#folders) {
      const pattern = path.join(folder, `{${['t', 's']}}`, '*');

      for (const { path: entryPath, stats } of await fg(pattern, { stats: true, onlyFiles: false })) {
        if (Date.now() - stats.mtimeMs > CLEANUP_INTERVAL) {
          const parsedPath = path.parse(entryPath);
          const checkPath =
            // To check the log file lock, use the path to the configuration file:
            parsedPath.ext === '.txt' && path.basename(parsedPath.dir) === 's'
              ? path.format({ ...parsedPath, base: undefined, ext: '.ini' })
              : entryPath;

          if (await lock.check(checkPath).catch(() => false)) continue;
          await rm(entryPath, { recursive: true, force: true });
        }
      }
    }
  }

  watch(folder) {
    if (!this.#folders.includes(folder)) {
      this.#folders.push(folder);
    }

    if (!this.#timer) {
      this.#cleanup();
      this.#timer = setInterval(() => this.#cleanup(), CLEANUP_INTERVAL).unref();
    }

    return this;
  }
}

module.exports = new SettingsCleaner();
