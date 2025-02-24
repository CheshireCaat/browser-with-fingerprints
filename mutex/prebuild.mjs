import path from 'path';
import fs from 'fs/promises';
import pkg from '../package.json' with { type: 'json' };

await Promise.all(
  pkg.os.flatMap((platform) =>
    pkg.cpu.map(async (arch) => {
      const target = `${platform}-${arch}`;

      try {
        await fs.rename(
          path.resolve(`./prebuilds/${target}/${pkg.name}.node`),
          path.resolve(`./src/plugin/mutex/${target}/mutex.node`)
        );
      } catch {
        console.log(`Prebuilds for "${target}" target already processed or not found.`);
      }
    })
  )
);

await Promise.all(
  ['./build', './prebuilds'].map((folder) => fs.rm(path.resolve(folder), { recursive: true, force: true }))
);
