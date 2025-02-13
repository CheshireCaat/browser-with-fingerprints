/**
 * Describes a time limit that can be used to filter fingerprints.
 *
 * The `*` option means that no time filter will be applied.
 */
export type Time = '*' | '15 days' | '30 days' | '60 days';

/**
 * Describes a tag value that can be used to filter fingerprints.
 *
 * The `*` option means that no tag filter will be applied.
 */
export type Tag =
  | '*'
  | 'Desktop'
  | 'Mobile'
  | 'Microsoft Windows'
  | 'Apple Mac'
  | 'Android'
  | 'Linux'
  | 'iPad'
  | 'iPhone'
  | 'Edge'
  | 'Chrome'
  | 'Safari'
  | 'Firefox'
  | 'YaBrowser'
  | 'Windows 7'
  | 'Windows 8'
  | 'Windows 10';

/**
 * Fetch options related to the browser fingerprint.
 */
export interface FetchOptions {
  /**
   * Select only those fingerprints whose device matches the specified tags list.
   *
   * If this option is not specified, a fingerprint will be obtained for any of the possible tags.
   */
  tags?: Tag[];

  /**
   * Select only those fingerprints whose date of addition matches the specified one.
   *
   * If this option is not specified, a fingerprint without an addition date limit will be selected.
   */
  timeLimit?: Time;

  /**
   * Select only those fingerprints whose minimum browser width matches the specified one.
   *
   * If this option is not specified, a fingerprint without a minimum width limit will be selected.
   */
  minWidth?: number;

  /**
   * Select only those fingerprints whose maximum browser width matches the specified one.
   *
   * If this option is not specified, a fingerprint without a maximum width limit will be selected.
   */
  maxWidth?: number;

  /**
   * Select only those fingerprints whose minimum browser height matches the specified one.
   *
   * If this option is not specified, a fingerprint without a minimum height limit will be selected.
   */
  minHeight?: number;

  /**
   * Select only those fingerprints whose maximum browser height matches the specified one.
   *
   * If this option is not specified, a fingerprint without a maximum height limit will be selected.
   */
  maxHeight?: number;

  /**
   * Select only those fingerprints that have a specific browser version.
   * It is recommended to use this option together with an explicit browser tag.
   *
   * For example, you can choose fingerprints for the **Chrome** browser with a version higher than `131`.
   * You can also select the exact version by setting this option to the same value as for `maxBrowserVersion`.
   *
   * The preferred option is to use the `current` value - this way the filter will use the current browser version installed for the plugin.
   * It can be very convenient, as the minimum versions of the browser and fingerprint will be exactly the same.
   *
   * If this option is not specified, a fingerprint without a minimum version limit will be selected.
   */
  minBrowserVersion?: number | 'current';

  /**
   * Select only those fingerprints that have a specific browser version.
   * It is recommended to use this option together with an explicit browser tag.
   *
   * For example, you can choose fingerprints for the **Chrome** browser with a version lower than `131`.
   * You can also select the exact version by setting this option to the same value as for `minBrowserVersion`.
   *
   * The preferred option is to use the `current` value - this way the filter will use the current browser version installed for the plugin.
   * It can be very convenient, as the maximum versions of the browser and fingerprint will be exactly the same.
   *
   * If this option is not specified, a fingerprint without a maximum version limit will be selected.
   */
  maxBrowserVersion?: number | 'current';

  /**
   * Is it necessary to enable logging when getting fingerprints with the **PerfectCanvas** data.
   *
   * @default false
   */
  perfectCanvasLogs?: boolean;

  /**
   * The **PerfectCanvas** request contains all the data required to render canvas on the remote machine.
   *
   * In order to obtain a request, you should use the **CanvasInspector** application (see the [wiki](https://wiki.bablosoft.com/doku.php?id=perfectcanvas#how_to_obtain_perfectcanvas_request) for more information).
   *
   * It is important to note that the **PerfectCanvas** request data is obtained once for the site, not for each fingerprint request.
   */
  perfectCanvasRequest?: string;

  /**
   * This option is only useful if the custom server feature is enabled on your account, otherwise it will always throw an error.
   *
   * If you have this option enabled, the fingerprint will be received only from the custom server.
   *
   * It is also compatible with the **PerfectCanvas**.
   *
   * @default false
   */
  enableCustomServer?: boolean;

  /**
   * In case the fingerprint with the specified **PerfectCanvas** request is not in the static database, the canvas data will be rendered in real time from the machines that are currently connected.
   *
   * This is the default behavior, but sometimes you can avoid dynamic rendering to save time or for another reason - in order to do this, set this option to `false`.
   *
   * This option has no effect if the **PerfectCanvas** request is not specified.
   *
   * @default true
   */
  dynamicPerfectCanvas?: boolean;

  /**
   * In case the fingerprint with the specified **PerfectCanvas** request is not in the static database, the canvas data will be rendered in real time from the machines that are currently connected.
   *
   * This is the default behavior, but sometimes you can avoid static database queries and use dynamic rendering instantly - in order to do this, set this option to `false`.
   *
   * This option has no effect if the **PerfectCanvas** request is not specified or if the custom servers are used.
   *
   * @default true
   */
  enablePrecomputedFingerprints?: boolean;
}
