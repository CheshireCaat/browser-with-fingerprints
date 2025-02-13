import type { Browser, LaunchOptions as SpawnOptions } from './plugin/launcher';
import type { FingerprintOptions } from './types/fingerprint';
import type { ProfileOptions } from './types/profile';
import type { ProxyOptions } from './types/proxy';
import type { FetchOptions } from './types/fetch';

export type * from './types/fingerprint';
export type * from './types/profile';
export type * from './types/proxy';
export type * from './types/fetch';
export type { Browser, SpawnOptions };

/**
 * Describes an object that provides complete information about the available browser version.
 */
export interface Version {
  /**
   * Browser architecture. Possible values - `x64` or `x86`.
   */
  architecture: 'x64' | 'x86';

  /**
   * Full browser version, for example - `115.0.5790.99`.
   */
  browser_version: string;

  /**
   * Full engine version, for example - `25.9.1`.
   */
  bas_version: string;

  /**
   * Internal identifier of the browser build.
   */
  id: number;
}

/**
 * Describes a plugin that is capable of fetching a fingerprint and launching a browser instance using it.
 */
export declare class FingerprintPlugin {
  /**
   * Get a list of all available browser versions.
   *
   * One possible use case would be to get a list of all versions using this method, and then launch a specific browser using an identifier
   * or a version string. In addition, it can be used when obtaining a fingerprint to filter by the minimum and maximum version.
   *
   * If the `format` parameter is set to `extended`, a list of objects will be returned, each containing detailed information about the
   * corresponding version - architecture, identifier, and so on. Otherwise, a simple list of browser versions will be returned.
   * The results are always sorted by version in descending order, i.e. the latest version will be listed first.
   *
   * @example
   * ```js
   * // Get a list of versions in extended format.
   * const versions = await plugin.versions('extended');
   *
   * // Force the plugin to use the latest version.
   * plugin.useBrowserVersion(versions[0]['browser_version']);
   * ```
   *
   * @param format - The output format of the returned result.
   * @returns The list of objects with detailed version information, or a list of strings.
   */
  versions<T extends string = 'default'>(format?: T): Promise<T extends 'extended' ? Version[] : string[]>;

  /**
   * Set the fingerprint settings using the specified fingerprint as a string and additional options when specified.
   * They will be used when launching the browser using the `spawn` or `launch` methods.
   *
   * You can chain method calls to set up a proxy, profile and fingerprint.
   * As a result, they return the current instance of the plugin, so you can call them in any order, and launch the browser immediately after application.
   *
   * See the [documentation](https://github.com/CheshireCaat/browser-with-fingerprints#fingerprint-usage) for more details.
   *
   * @remarks
   * **NOTE**: This method performs the fingerprint setup once. After launching the browser, the data cannot be changed.
   * In order to change fingerprint again, you'll need to restart the browser with different settings or launch a separate browser instance.
   *
   * You must specify the service key to apply the fingerprint when launching the browser (if the fingerprint was obtained using a paid key).
   *
   * @example
   * ```js
   * // Just for an example, you need to use the real value:
   * const fingerprint = '...';
   *
   * // The browser will be launched with the specified fingerprint:
   * const browser = await plugin.useFingerprint(fingerprint).launch();
   * ```
   *
   * @param value - Fingerprint value as a string.
   * @param options - Set of configurable options for applying a fingerprint.
   * @returns The same plugin instance with an updated settings (for optional chaining).
   */
  useFingerprint(value?: string, options?: FingerprintOptions): this;

  /**
   * Set the profile settings using the specified profile as a string and additional options when specified.
   * They will be used when launching the browser using the `spawn` or `launch` methods.
   *
   * You can chain method calls to set up a proxy, profile and fingerprint.
   * As a result, they return the current instance of the plugin, so you can call them in any order, and launch the browser immediately after application.
   *
   * See the [documentation](https://github.com/CheshireCaat/browser-with-fingerprints#profile-usage) for more details.
   *
   * @remarks
   * **NOTE**: This method performs the profile setup once. After launching the browser, the data cannot be changed.
   * In order to change profile again, you'll need to restart the browser with different settings or launch a separate browser instance.
   *
   * You must specify the service key to apply the fingerprint when launching the browser (if the fingerprint was obtained using a paid key).
   *
   * @example
   * ```js
   * // Just for an example, you need to use the real value:
   * const profile = '...';
   *
   * // The browser will be launched with the specified profile:
   * const browser = await plugin.useProfile(profile).launch();
   * ```
   *
   * @param value - Profile value as a string.
   * @param options - Set of configurable options for applying a profile.
   * @returns The same plugin instance with an updated settings (for optional chaining).
   */
  useProfile(value?: string, options?: ProfileOptions): this;

  /**
   * Set the proxy settings using the specified proxy as a string and additional options when specified.
   * They will be used when launching the browser using the `spawn` or `launch` methods.
   *
   * You can chain method calls to set up a proxy, profile and fingerprint.
   * As a result, they return the current instance of the plugin, so you can call them in any order, and launch the browser immediately after application.
   *
   * See the [documentation](https://github.com/CheshireCaat/browser-with-fingerprints#proxy-usage) for more details.
   *
   * @remarks
   * **NOTE**: This method performs the proxy setup once. After launching the browser, the data cannot be changed.
   * In order to change proxy again, you'll need to restart the browser with different settings or launch a separate browser instance.
   *
   * @example
   * ```js
   * // Just for an example, you need to use the real value:
   * const proxy = '...';
   *
   * // The browser will be launched with the specified proxy:
   * const browser = await plugin.useProxy(proxy).launch();
   * ```
   *
   * @param value - Proxy value as a string.
   * @param options - Set of configurable options for applying a proxy.
   * @returns The same plugin instance with an updated settings (for optional chaining).
   */
  useProxy(value?: string, options?: ProxyOptions): this;

  /**
   * Set the current browser version used by the plugin instance.
   *
   * Initially, the `default` value is used, which means that the latest available version will be used.
   * The same behavior can be achieved by passing an empty string or a zero identifier as a parameter to this method.
   * Also you can use the `random` value to select a random version, or use the version identifier instead of the version string.
   *
   * In order to get a list of available versions, use the `versions` method - the return values (version numbers and identifiers) can be used for this method.
   *
   * @example
   * ```js
   * // Use a specific version:
   * plugin.useBrowserVersion('115.0.5790.99');
   *
   * // Use the latest available version:
   * plugin.useBrowserVersion('default');
   * ```
   *
   * @param version - Version value as a string.
   * @returns The same plugin instance with an updated settings (for optional chaining).
   */
  useBrowserVersion(version: string): this;

  /**
   * Obtain a fingerprint using the specified service key and additional options.
   *
   * You can use various options to get a fingerprint according to certain criteria, depending on your needs.
   * The main parameter that filters fingerprints is tags. With them, you can choose options for specific operating systems, browsers and devices.
   * It's very handy because you can combine several tags together and thus get fingerprints for any situation.
   *
   * Other options are also useful. For example, you can get fingerprints in which the screen sizes will be limited to the values that you specify using the `minWidth` and `minHeight` options.
   * Or, if you want to use specific browser versions, you can use the `minBrowserVersion` and `maxBrowserVersion` options, which will filter out fingerprints that don't match the specified criteria.
   *
   * A fingerprint is an object with many properties that will be used for emulation. By default it's stored as a `JSON` string. It's strongly not recommended to change its parameters
   * manually if you aren't sure about what you are doing, otherwise correct operation of the fingerprint and anonymity of the browser is not guaranteed.
   *
   * You don't have to use this method all the time. After receiving the fingerprint, you can safely save it to a file or database, and request it from there during the next launches.
   *
   * For more information about fingerprints, please visit [this](https://fp.bablosoft.com) website.
   *
   * @remarks
   * **NOTE**: Please keep in mind that resizing the browser when using fingerprints can negatively affect anonymity.
   *
   * You must specify the service key to apply the fingerprint when launching the browser (if the fingerprint was obtained using a paid key).
   *
   * @example
   * An example of obtaining a fingerprint:
   *
   * ```js
   * const result = await plugin.fetch({
   *   tags: ['Desktop', 'Chrome'],
   *   minBrowserVersion: 115,
   *   timeLimit: '15 days',
   * });
   * ```
   *
   * @param key - Service key for obtaining a fingerprint.
   * @param options - Set of configurable options for getting a browser fingerprint.
   * @returns Promise which resolves to a fingerprint string.
   */
  fetch(options?: FetchOptions): Promise<string>;

  /**
   * Launches a browser instance with given arguments and options when specified.
   *
   * Note that this method only starts the browser process, but does not connect to it.
   * You will need to do it yourself using any framework that is convenient for you.
   *
   * When working with the plugin, it will be much more convenient to use the alternative `launch` method, which is defined
   * only in derived plugins (not implemented in **browser-with-fingerprints** package), which immediately launches the
   * browser, connects to it and does not require additional actions. Otherwise, you will need to connect to
   * the browser manually, as well as configuring the viewport size when opening a new window
   * (using the {@link Browser.configure} method) if a fingerprint is set.
   *
   * @remarks
   * **NOTE**: This plugin only works with the `chromium` browser, which comes bundled with the plugin.
   * You will not be able to use other engines or change the path to the browser executable.
   * If you need to use the default browsers without fingerprint spoofing, there is no point in using this method.
   *
   * You must specify the service key to apply the fingerprint when launching the browser (if the fingerprint was obtained using a paid key).
   *
   * @example
   * An example of launching the browser in visible mode:
   *
   * ```js
   * const browser = await plugin.spawn({
   *   headless: false,
   *   debuggingPort: 0,
   * });
   *
   * await browser.close();
   * ```
   *
   * @param options - Set of configurable options to set on the browser.
   * @returns Promise which resolves to a browser instance.
   */
  spawn(options?: SpawnOptions): Promise<Browser>;

  /**
   * Set the request timeout that the plugin uses to work with the engine.
   *
   * You can read a bit more about these settings [here](https://github.com/CheshireCaat/browser-with-fingerprints#configuring-plugin).
   *
   * @remarks
   * **NOTE**: This action changes the configuration for all instances of the plugin, that is, it works globally.
   *
   * @example
   * ```js
   * plugin.setRequestTimeout(300000);
   * ```
   *
   * @param timeout - The request timeout that the plugin engine will use.
   */
  setRequestTimeout(timeout: number): void;

  /**
   * Set the working folder that the plugin uses to work with the engine.
   *
   * You can read a bit more about these settings [here](https://github.com/CheshireCaat/browser-with-fingerprints#configuring-plugin).
   *
   * @remarks
   * **NOTE**: This action changes the configuration for all instances of the plugin, that is, it works globally.
   *
   * @example
   * ```js
   * plugin.setWorkingFolder('data');
   * ```
   *
   * @param folder - The working folder that the plugin engine will use.
   */
  setWorkingFolder(folder: string): void;

  /**
   * Set the fingerprint service key for all plugin methods that require it.
   *
   * An empty value can be used here, in which case the free version of fingerprint service will be used for the plugin.
   *
   * @remarks
   * **NOTE**: This action changes the configuration for all instances of the plugin, that is, it works globally.
   *
   *  @example
   * ```js
   * plugin.setServiceKey('key');
   * ```
   *
   * @param key - The service key for obtaining and applying a fingerprint.
   */
  setServiceKey(key: string): void;
}

/**
 * A default instance of the fingerprint plugin.
 */
export declare const plugin: FingerprintPlugin;
