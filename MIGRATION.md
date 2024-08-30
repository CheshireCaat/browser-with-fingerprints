# Migration guide

This document contains instructions for migrating and updating to the latest versions of the engine and describes solutions to the most common problems.

## Changes in fingerprint handling

With the recent updates to the engine and plugin (**1.6.2** and later for the plugin, **127.0.6533.73** and later for the engine), you now need to specify the service key not only for retrieving fingerprints but also for applying them.

### Key requirements

- When applying a fingerprint, the key must match the one used to obtain it.
- The key can be omitted only if the free version was used (provide an empty string for the key).

### Steps to resolve issues

To adapt to these changes, follow these steps:

1. **Set the service key globally**:

   - Use the `setServiceKey` method to set the service key for the entire plugin.
   - Pass your service key as a parameter, or an empty string if using the free version.

2. **Modify method calls**:

   - Optionally, you can remove the key from the `fetch` method by passing options as the first parameter.
   - Similarly, you can omit the service `key` option from the `launch` and `spawn` plugin methods.

### Code example

An example of updating the code based on recommendations:

#### Before update

```js
const { plugin } = require('browser-with-fingerprints');

async function main() {
  const key = 'SERVICE_KEY';

  const fingerprint = await plugin.fetch(key, {
    tags: ['Microsoft Windows', 'Chrome'],
  });

  plugin.useFingerprint(fingerprint);

  await plugin.launch({ key, headless: false });
}

main();
```

#### After update

```js
const { plugin } = require('browser-with-fingerprints');

async function main() {
  // Set the service key for the plugin (you can buy it here https://bablosoft.com/directbuy/FingerprintSwitcher/2).
  // Leave an empty string to use the free version.
  plugin.setServiceKey('');

  // Optionally omit key parameter if you do not need an override:
  const fingerprint = await plugin.fetch({
    tags: ['Microsoft Windows', 'Chrome'],
  });

  plugin.useFingerprint(fingerprint);

  // Omit the key option if you do not need an override:
  await plugin.launch({ headless: false });
}

main();
```

### Additional notes

You can still pass the key directly to the `fetch`, `spawn`, and `launch` methods. If you do, the provided key will be used for that specific call, overriding the key set by the `setServiceKey` method.
