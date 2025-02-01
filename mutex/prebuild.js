const path = require('path');
const fs = require('fs/promises');
const package = require('../package.json');

(async function () {
  for (const platform of package.os) {
    for (const arch of package.cpu) {
      const target = `${platform}-${arch}`;
      try {
        await fs.rename(
          path.resolve(`./prebuilds/${target}/${package.name}.node`),
          path.resolve(`./src/plugin/mutex/${target}/mutex.node`)
        );
      } catch {
        console.log(`Prebuilds for "${target}" target already processed or not found.`);
      }
    }
  }

  await fs.rm(path.resolve('./prebuilds'), { recursive: true, force: true });
  await fs.rm(path.resolve('./build'), { recursive: true, force: true });
})();
