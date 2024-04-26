# browser-with-fingerprints

This is the repo for `browser-with-fingerprints`, a plugin for automation frameworks that allows you to change a browser fingerprint, generate a virtual identity and improve your browser's stealth.

In order to achieve this, the [FingerprintSwitcher](https://fp.bablosoft.com) service is used, which allows you to replace a list of important browser properties, and thus you will act like a completely new user.

This package is the basis for other plugins and doesn't allow you to automate browser actions directly. It's needed primarily for the implementation of other plugins for various frameworks.

**Warning:** plugin is still in beta stage, it means that bugs may happen, including critical.

Current supported engine version - **124.0.6367.61**.

## About

This library allows you to change browser fingerprint and use any automation framework with enhanced anonymity.
In order to migrate and use it, a minimum of modifications and code changes is required.

**Browser fingerprinting** - is a technique that allows to identify the user by a combination of browser properties, such as - fonts, resolution, list of plugins, navigator properties, etc.
By adding new factors and using browser **API** in a special way, a site can determine exactly which user is visiting it, even if the user is using a proxy.
When using this package and replacing fingerprints, websites will not be able to identify you from other users, as all these properties and results of **API** calls will be replaced with values from real devices.

Let's look at a small example of **WebGL** property substitution.
In the screenshot below, the left column shows the values from the regular browser, and the right column shows the values substituted using ready-made fingerprints.
This result cannot be achieved using only the replacement of various browser properties via **JavaScript**, that's what this plugin and service is for:

![WebGL](https://github.com/CheshireCaat/browser-with-fingerprints/raw/master/assets/webgl.jpg)

You can learn more by following this [link](https://fp.bablosoft.com/#capabilities).

## Installation

To use this plugin in your project, install it with your favorite package manager:

```bash
npm i browser-with-fingerprints
# or
pnpm i browser-with-fingerprints
# or
yarn add browser-with-fingerprints
```

Please note that according to the [architecture](#architecture) section, this plugin can only be installed and used on **Windows** operating system.

## Other plugins

You can use this package directly to launch browsers and write your own plugins. But it's much better to use ready-made plugins for popular automation frameworks:

- Plugin for **selenium** - [selenium-with-fingerprints](https://github.com/CheshireCaat/selenium-with-fingerprints)
- Plugin for **puppeteer** - [puppeteer-with-fingerprints](https://github.com/CheshireCaat/puppeteer-with-fingerprints)
- Plugin for **playwright** - [playwright-with-fingerprints](https://github.com/CheshireCaat/playwright-with-fingerprints)

These plugins are already configured to integrate with each specific library, and have a convenient **API** to work with. They aren't a complete replacement for automation frameworks, but only extend their functionality.

To launch the browser, the most compatible **API** is used, copying the options of the original libraries so that it's easy to add new code to your project. You can find detailed information in the corresponding repositories.

When using plugins, don't forget about dependencies. Libraries do not install dependencies directly, they are listed as optional to make things easier for you. Also be aware of the possible need for additional packages or programs - for example, the **chromedriver** executable for the **selenium-webdriver** package, and so on.

## Launching the browser

You can launch the browser in two different ways. There are two methods for this - **launch** and **spawn**.

The first one uses the native launcher of the library, the integration with which is implemented in a specific plugin.
This does not apply to the base library and this method cannot be used with it.

The **launch** method uses the framework's built-in methods to launch the browser under the hood and, accordingly, accepts the same options.
The only difference is the presence of additional code inside the plugin that applies the fingerprint and proxy. The sample code may look something like this:

```js
const browser = await plugin.launch({
  args: ['--mute-audio'],
  headless: true,
});
```

The **spawn** method works in a similar way, but uses a separate mechanism to launch the browser.
The main difference is that this method just starts the process, but doesn't connect to it for automation - you can do it yourself later.

This method returns a running browser instance that can be used to connect via **CDP** or via the desired automation framework:

```js
const { plugin } = require('browser-with-fingerprints');

const chrome = await plugin.spawn({ headless: true });

// Pseudocode for setting up a
// connection using the debugging port.
await framework.connect({ debuggingPort: chrome.port });

// Pseudocode for setting up a
// connection using the websocket url.
await framework.connect({ websocketUrl: chrome.url });

// The best way to close the browser
// is to use the framework methods.
await chrome.close();
```

At [this](src/plugin/launcher/index.d.ts#L54) link you can find a detailed description of all the options allowed for **spawn** method.
The same goes for the return type declaration, details of which can be found [here](src/plugin/launcher/index.d.ts#L6).

If possible, use it only in extreme cases. It is much more convenient to use the **launch** method to launch the browser, which minimizes the number of steps for proper initialization and configuration.

Annotations are described for all plugins methods directly in the library code via the **TypeScript** declarations, so when using it you will be able to see hints for all options and types.
You can also find out about it directly [here](src/index.d.ts).

## Configuring plugin

At the moment, it is possible to change the working folder and timeout for requests to the engine, which is used when fetching, applying fingerprints, and so on:

```js
// Set the folder where the plugin engine will be installed:
plugin.setWorkingFolder('./engine');

// Set the timeout used when fetching fingerprints and so on:
plugin.setRequestTimeout(5 * 60000);
```

The methods from the example above change the settings globally, that is, for all instances of the plugin.

The default values are the `./data` directory for the working folder and `300000` milliseconds for the request timeout.

The same result can be achieved using environment variables, however it is strongly recommended to use the described methods.

## Configuring browser

In order to change the fingerprint and proxy for your browser, you should use special separate methods:

- **useProxy** - to change the proxy configuration.
- **useProfile** - to change the profile configuration.
- **useFingerprint** - to change the fingerprint configuration.

These methods directly affect only the next launch of the browser. So you should always use them before using the `spawn` plugin method.

You cannot change the settings once the browser is launched - more specifically, an already launched instance will not be affected by the new configuration.
But you can safely change the options for the next run, or for a separate browser instance with a different unique configuration.

You can also **chain** calls, since all these methods return the current plugin instance. It does not matter in which order the settings will be applied. It might look like this:

```js
const { plugin } = require('browser-with-fingerprints');

const fingerprint = await plugin.fetch('', {
  tags: ['Microsoft Windows', 'Chrome'],
});

plugin.useProxy('127.0.0.1:8080').useFingerprint(fingerprint);
```

Use these links to see a detailed description of the methods:

- [This](src/index.d.ts#L362) one for the **useFingerprint** method (also see additional options [here](src/index.d.ts#L38)).
- [This](src/index.d.ts#L390) one for the **useProfile** method (also see additional options [here](src/index.d.ts#L110)).
- [This](src/index.d.ts#L418) one for the **useProxy** method (also see additional options [here](src/index.d.ts#L131)).

The usage of these methods is very similar - each takes two parameters, the first of which is the configuration data itself, and the second is additional options.
The fingerprint and proxy will not be changed unless the appropriate method is used. In this case, all settings related to browser fingerprinting will remain at their original values.

Fingerprint and proxy aren't applied instantly when calling methods. Instead, the configuration is saved and used directly when the browser is launched using the **launch** or **spawn** methods.
Thus, you can pre-configure the plugin in a certain way, or change something immediately before launching the browser.

### Configuring browser version

You can change the browser version right while using the plugin - the engine may come with several different builds of the browser.

In order to do this, use the **useBrowserVersion** method or the **version** property (deprecated).
The last one defaults to `default`, which means that the latest available version will be used:

```js
const { plugin } = require('browser-with-fingerprints');

// Use a specific version:
plugin.useBrowserVersion('115.0.5790.99');

// Use the latest available version:
plugin.useBrowserVersion('default');
```

If you specify an unavailable or invalid version, an appropriate error will be thrown when the browser starts.
Also keep in mind that this property only affects a specific instance of the plugin, not the entire library.

In order to get a list of available versions shipped with the engine, use the **versions** method.
It returns a list of browser versions as strings or objects with additional information, depending on the format passed:

```js
const { plugin } = require('browser-with-fingerprints');

// The list of versions is always sorted in descending order:
await plugin.versions('extended').then((versions) => {
  // The latest available browser version will be used:
  plugin.useBrowserVersion(versions[0]['browser_version']);
});
```

Thanks to this, you can, for example, use the version that corresponds to a certain fingerprint, and vice versa.

### Fingerprint usage

In order to change the fingerprint, you need to run the `useFingerprint` method before starting the browser, i.e. before using the plugin's `launch` method.

The `useFingerprint` method takes two parameters.
The first is a string with fingerprint data that you can request from the service.
The second is additional options for applying a fingerprint, most of which are applied automatically - for example, the safe replacement of the **BatteryAPI** and **AudioAPI** properties:

```js
const { plugin } = require('browser-with-fingerprints');

const fingerprint = await plugin.fetch('', {
  tags: ['Microsoft Windows', 'Chrome'],
});

plugin.useFingerprint(fingerprint, {
  // It's disabled by default.
  safeElementSize: true,
  // It's enabled by default.
  safeBattery: false,
});
```

In order to obtain fingerprints you should use the **fetch** plugin method.
Pass the service key as the first argument and additional parameters as the second, if necessary:

```js
const { plugin } = require('browser-with-fingerprints');

const fingerprint = await plugin.fetch('SERVICE_KEY', {
  tags: ['Microsoft Windows', 'Chrome'],
  // Fetch fingerprints only with a browser version higher than 115:
  minBrowserVersion: 115,
  // Fetch fingerprints only with a browser version lower than 119:
  maxBrowserVersion: 119,
  // Fetch fingerprints only collected in the last 15 days:
  timeLimit: '15 days',
});
```

All possible settings for **fetch** method, as well as their descriptions, you can find [here](src/index.d.ts#L186).

The special `current` value can be used to filter fingerprints by browser version - in this case, the version installed for the plugin will be used.
It can be very convenient as the browser and fingerprint versions will be exactly the same and you don't have to enter the exact values in multiple places.

You can **reuse** fingerprints instead of requesting new ones each time.
To do this, you can save them to a file or to a database - use any option convenient for you.
In this way, you can speed up the process of launching the browser with the parameters you need, organize your storage, filter and sort fingerprints locally, and much more:

```js
const { readFile, writeFile } = require('fs/promises');
const { plugin } = require('browser-with-fingerprints');

// Save the fingerprint to a file:
const fingerprint = await plugin.fetch('', {
  tags: ['Microsoft Windows', 'Chrome'],
});
await writeFile('fingerprint.json', fingerprint);

// Load fingerprint from file at next run:
plugin.useFingerprint(await readFile('fingerprint.json', 'utf8'));
```

You can learn more about the options directly when adding these methods - just use the built-in [annotations](src/index.d.ts#L478).

You can use any [tags](src/index.d.ts#L15), filters (e.g. [time](src/index.d.ts#L8) limit) and settings if you have a service key.

If you specify an empty string as the first argument, the free version will be used.
For a free version you won't be able to use other tags than the default ones, as well as some other filters:

```js
const fingerprint = await plugin.fetch('', {
  // You can only use these tags with the free version:
  tags: ['Microsoft Windows', 'Chrome'],
  // You also cannot use such filters in the free version:
  // minBrowserVersion: 115,
});
```

In the free version, the [PerfectCanvas](https://wiki.bablosoft.com/doku.php?id=perfectcanvas) technology is also not available.
There are other limitations when using the free version - for example, limiting the number of requests in a certain period of time.
To see the differences and limits of different versions, visit [this](https://fp.bablosoft.com/#pricing) website.

You can buy a key [here](https://bablosoft.com/directbuy/FingerprintSwitcher/2) to avoid limitations.

### Profile usage

In order to use a specific browser profile, you can, among other options, use the `useProfile` method.
As the first parameter, it takes the path to the profile folder - the same value that you specify, for example, for the `user-data-dir` argument.
The second parameter is additional options that are primarily responsible for loading fingerprint and proxy data from the profile folder:

```js
const path = require('path');
const { plugin } = require('browser-with-fingerprints');

plugin.useProfile(path.resolve('./profile'), {
  // Don't load fingerprint from profile folder:
  loadFingerprint: false,
  // Don't load proxy from profile folder:
  loadProxy: false,
});
```

By default, the plugin will load proxy and fingerprint data from the profile folder, if they are written there.
You can change this behavior by setting the options to `false` - for example, if you are not sure that the stored proxy is working.
Please note that if you add your fingerprint or proxy through the appropriate methods, then the data you specified will be used regardless of the options.

You can also use other options to set the path to the profile folder, such as the `userDataDir` option, if you don't need additional settings:

```js
const path = require('path');
const { plugin } = require('browser-with-fingerprints');

const browser = await plugin.spawn({
  userDataDir: './profile',
  // Browser arguments can be used as well:
  args: [`--user-data-dir=${path.resolve('./profile')}`],
});
```

After launching a browser with your profile, the fingerprint and proxy data you specified will always be stored in the profile folder.
This setting itself is saved between browser launches, that is, it behaves in the same way as other similar methods.
To run different profiles, you need to call this method again with different values for the profile directory.

You can learn more about the parameters and additional options for this method [here](src/index.d.ts#L390) and [here](src/index.d.ts#L110).

### Proxy usage

In order to set up a proxy, you should use the `useProxy` method.
The first parameter of this method is a string with information about the proxy.
The second parameter is additional options that will be applied to the browser, for example, automatic change of language and time zone:

```js
const { plugin } = require('browser-with-fingerprints');

plugin.useProxy('127.0.0.1:8080', {
  // Change browser timezone according to proxy:
  changeTimezone: true,
  // Replace browser geolocation according to proxy:
  changeGeolocation: true,
});
```

You can learn more about the parameters and additional options for this method [here](src/index.d.ts#L418) and [here](src/index.d.ts#L131).

The browser supports two types of proxies - **https** and **socks5**.
It is better to always specify the proxy type in the address line - otherwise, **https** will be used by default.

You can use aliases - **http** instead of **https** and **socks** instead of **socks5**.
Proxies with authorization (with login and password) are also supported.

In general, when specifying addresses, you can use many different formats, for example:

- `127.0.0.1:8080`
- `https://127.0.0.1:8080`
- `socks5://127.0.0.1:8181`
- `username:password@127.0.0.1:8080`
- `socks:127.0.0.1:8080:username:password`
- `https://username:password:127.0.0.1:8080`

In order to preserve compatibility with the original library syntax, the proxy can be obtained from the arguments you specified.
The `proxy-server` option will be used as the value, and all other options will be set to their default values.
But this will be done only if you didn't call the appropriate method for the proxy configuration:

```js
const { plugin } = require('browser-with-fingerprints');

const browser = await plugin.spawn({
  // The syntax for specifying an argument value
  // is exactly the same as for using a separate method.
  args: ['--proxy-server=https://127.0.0.1:8080'],
});
```

It's better to replace such code with the `useProxy` method. This is much more convenient because you can immediately set the additional options you need.

### More info

If you want to learn more about fingerprint substitution technology, explore the list of replaceable properties and various options, such as tags, get or configure your service key, use [this](https://fp.bablosoft.com) link.
There you can also get a test fingerprint and see ready-made values that can be applied to your browser.

## Architecture

This plugin uses the [FingerprintSwitcher](https://fp.bablosoft.com) service to get fingerprints.
The resulting fingerprints are used later directly when working with the browser and are applied in a special way using a custom configuration files.

Also keep in mind that this package only work on the **Windows** operating system.
This is a forced measure due to the presence of some critical **Windows-only** dependencies without which this implementation will not work.
If you install or run it on other platforms, you will get the corresponding errors.

There are some **limitations** in using the package, which may be critical or non-critical depending on your task.
For example, for the correct operation of the fingerprint substitution technology, a custom browser with various patches is required.
It will be used automatically when working with this package.

The plugin architecture can be summarized as the following diagram:

![Architecture](https://github.com/CheshireCaat/browser-with-fingerprints/raw/master/assets/plugin.jpg)

All packages can only work with the **Chrome** browser, which comes bundled with the libraries and loads automatically.
The path to the executable file is defined on the plugin side and cannot be changed.
It means that you will not be able to use not only other versions of **Chrome** or **Chromium**, but also other browser engines.
The same goes for some framework-specific launch options.

### Limitations

Please **note** that there are some restrictions at the moment:

- Only **Windows** operating system is supported.
- Parallel launch of browsers is synchronized between calls.
- Working with **workers** is possible only when specifying a separate working folder for each of them.

Also, there is no guarantee that each of these items will be changed in the future.

## Alternatives

Also check out [BAS](https://bablosoft.com/shop/BrowserAutomationStudio) - a great alternative to automate the **Chrome** browser without programming skills.
It also supports fingerprint substitution, has simple and powerful multithreading and other advantages.

## Troubleshooting

If you encounter any issue or bug, please use the [issues](https://github.com/CheshireCaat/browser-with-fingerprints/issues) section of the repository.

Please describe the problem in as much detail as possible when creating tickets - indicate the sequence of actions (steps) to repeat the problem, error output, and so on.

If the code is large, attach it as files or use sandboxes. At the same time, it's better to remove from it areas that do not relate to the problem - it will be much easier to figure it out.
Format your code and wrap it in special **markdown** tags if you're adding it to an issue report, for example:

```js
// your code
```

Please be careful not to attach various **secrets** in your code or screenshots - for example, fingerprint service keys, account passwords, and so on.
In the case of service keys, this can lead to their blocking without a refund.

If the recommendations are not followed, your ticket may be ignored.

## Testing

The excellent [mocha](https://github.com/mochajs/mocha) framework is used for tests in this library.
Use the command line or ready-made scripts if you want to run them yourself.

In order to test getting fingerprints from the service (as well as premium functionality), set the **FINGERPRINT_KEY** environment variable:

```properties
FINGERPRINT_KEY="VALUE"
```

This variable will be used when calling the **fetch** method.
You can also use the **FINGERPRINT_CWD** environment variable to specify the directory where the engine will be stored, for example:

```properties
FINGERPRINT_CWD="../plugin-engine"
```

The **FINGERPRINT_TIMEOUT** variable can be set if it's necessary to change the default timeout for executing engine methods, such as applying or fetching a fingerprint:

```properties
FINGERPRINT_TIMEOUT=300000
```

You can define it in any way convenient for you, but by default variables are read from the **env** files using the [dotenv](https://github.com/motdotla/dotenv) library.

## License

Copyright © 2024, [CheshireCaat](https://github.com/CheshireCaat). Released under the [MIT](LICENSE.md) license.
