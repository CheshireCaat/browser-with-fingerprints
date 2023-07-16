const fg = require('fast-glob');
const { rm } = require('fs/promises');
const { join } = require('path').posix;
const lock = require('proper-lockfile');

class SettingsCleaner {
  #path = null;

  async ignore(pid, id) {
    await this.#set('lock', pid, id);
  }

  async include(pid, id) {
    await this.#set('unlock', pid, id);
  }

  async #set(op, pid, id) {
    for (const item of [`t/${pid}`, `s/${id}.ini`, `s/${id}1.ini`]) {
      try {
        await lock[op](join(this.#path, '../../', item));
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
  }

  run(path, delay = 15000) {
    if (!this.#path) {
      const pattern = `${join(path, '../../')}{${['t/*', 's/*']}}`;

      const callback = async () => {
        for (const { stats, path } of await fg(pattern, { stats: true, onlyFiles: false, onlyDirectories: false })) {
          if (Date.now() - stats.mtime > delay && !(await lock.check(path))) {
            await rm(path, { recursive: true });
          }
        }
      };

      this.#path = (callback(), setInterval(callback, delay).unref(), path);
    }

    return this;
  }
}

module.exports = new SettingsCleaner();
