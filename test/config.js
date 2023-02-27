const fs = require('fs').promises;
const assert = require('assert').strict;
const { synchronize } = require('../src/plugin/config');

describe('config', () => {
  const file = `${__dirname}/browser/s/1.ini`;

  describe('#synchronize()', () => {
    before(() => fs.mkdir(`${__dirname}/browser/s`, { recursive: true }).then(() => fs.writeFile(file, '')));

    it('should perform an action between configuration changes', async () => {
      let config = null;

      await sync(async () => (config = await fs.readFile(file)));

      assert(config && config !== (await fs.readFile(file)));
    });

    it('should prevent concurrent access to the action code', async () => {
      const results = [];

      await Promise.all(
        [...Array(5)].map(async (_, index) => {
          await sync(() => results.push(index));
        })
      );

      assert.deepEqual(results, [0, 1, 2, 3, 4]);
    });

    after(() => fs.rm(`${__dirname}/browser`, { recursive: true }));
  });
});

const sync = synchronize.bind(null, '', __dirname, { width: 100, height: 100 });
