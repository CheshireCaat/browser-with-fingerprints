const fg = require('fast-glob');
const path = require('path').posix;
const { rm } = require('fs/promises');
const lock = require('proper-lockfile');

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
        await lock[shouldLock ? 'lock' : 'unlock'](itemPath);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
  }

  async #cleanup() {
    for (const folder of this.#folders) {
      const pattern = path.join(folder, `{${['t', 's']}}`, '*');

      for (const { stats, path } of await fg(pattern, { stats: true, onlyFiles: false, onlyDirectories: false })) {
        if (Date.now() - stats.mtime > CLEANUP_INTERVAL && !(await lock.check(path))) {
          await rm(path, { recursive: true });
        }
      }
    }
  }

  watch(folder) {
    if (!this.#folders.includes(folder)) {
      this.#folders.push(folder);
    }

    if (!this.#timer) {
      this.#timer = (this.#cleanup(), setInterval(() => this.#cleanup(), CLEANUP_INTERVAL).unref());
    }

    return this;
  }
}

module.exports = new SettingsCleaner();
