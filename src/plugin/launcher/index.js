const path = require('path');
const { createInterface } = require('readline');
const { spawn, exec } = require('child_process');

module.exports = {
  async launch({ args = [], timeout = 30000, userDataDir = '', debuggingPort = 0, executablePath = '' } = {}) {
    if (userDataDir) args = args.concat(`--user-data-dir=${path.resolve(userDataDir)}`);

    const process = spawn(executablePath, [...args, `--remote-debugging-port=${debuggingPort}`], {
      detached: false,
      shell: false,
    });

    const url = await new Promise((resolve, reject) => {
      const timeoutId = timeout ? setTimeout(onTimeout, timeout) : 0;

      createInterface({ input: process.stderr }).on('line', onLine);

      createInterface({ input: process.stdout }).on('line', onLine);

      function onLine(line) {
        const match = line.match(/DevTools listening on (.*)/);
        if (match) clearTimeout(timeoutId), resolve(match[1]);
      }

      function onTimeout() {
        reject(new Error(`Timed out after ${timeout}ms while trying to launch the browser.`));
      }
    });

    // prettier-ignore
    const port = +new URL(url).port, close = () => {
      if (process.pid && !process.killed) {
        exec(`taskkill /pid ${process.pid} /T /F`, (err) => {
          if (err) process.kill();
          process.killed = true;
        });
      }
    };

    return { url, port, close, process };
  },
};
