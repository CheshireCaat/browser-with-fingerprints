const path = require('path');
const fs = require('fs/promises');

(async function () {
  for (const arch of ['ia32', 'x64']) {
    try {
      await fs.rename(
        path.resolve(`./prebuilds/win32-${arch}/browser-with-fingerprints.node`),
        path.resolve(`./src/plugin/mutex/win32-${arch}/mutex.node`)
      );
    } catch {
      // prebuild already moved or not found
    }
  }

  await fs.rm(path.resolve('./build'), { recursive: true, force: true });

  await fs.rm(path.resolve('./prebuilds'), { recursive: true, force: true });
})();
