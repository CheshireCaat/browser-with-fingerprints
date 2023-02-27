const once = require('once');
const print = once(console.log);
const dedent = require('dedent');

const notify = once(() => {
  console.log(dedent`
    Try the full version of the fingerprint service which has advantages over the free one:

    - Emulate fingerprints for other platforms and browsers.
    - Increased limits when receiving a fingerprints from the service.
    - Filters by tags, versions, screen resolution and many other parameters.
    - Popular perfect canvas queries are already included in the received fingerprints.

    If you want to buy the full version, please visit this website - https://bablosoft.com/directbuy/FingerprintSwitcher/2.
  `);
});

exports.notify = (premium) => {
  if (!premium && process.env.NODE_ENV !== 'test') {
    return notify(), setTimeout(print, 20000, 'Fetching a fingerprint can take a long time in the free version.');
  }
};
