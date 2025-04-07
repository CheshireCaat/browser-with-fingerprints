const fs = require('fs/promises');
const assert = require('assert').strict;
const { synchronize } = require('../src/plugin/config');

const TEST_FOLDER = `${__dirname}/browser`;
const TEST_FILE = `${TEST_FOLDER}/s/1.ini`;

const sync = synchronize.bind(null, '', TEST_FOLDER, { width: 100, height: 100 });

describe('config', () => {
  describe('#synchronize()', () => {
    before(() => fs.mkdir(`${__dirname}/browser/s`, { recursive: true }).then(() => fs.writeFile(TEST_FILE, '')));

    it('should perform an action between configuration changes', async () => {
      let config = null;

      await sync(async () => (config = await fs.readFile(TEST_FILE)));

      assert(config && config !== (await fs.readFile(TEST_FILE)));
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

    after(() => fs.rm(TEST_FOLDER, { recursive: true }));
  });
});
