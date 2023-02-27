import type { ChildProcess } from 'child_process';

/**
 * Describes a browser instance that was launched using the `spawn` method.
 */
export interface Browser {
  /**
   * Configures the browser, including changing the viewport size if the screen
   * resolution is specified in the fingerprint. Called automatically after
   * the browser starts.
   *
   * You must call this method each time you open pages in a new window.
   */
  configure(): Promise<void>;

  /**
   * Closes browser and all of its pages (if any were opened). The browser
   * object itself is considered to be disposed and can no longer be
   * used, as well as the underlying process.
   */
  close(): Promise<void>;

  /**
   * The underlying browser process which can be used for lifecycle
   * management.
   *
   * The best way to close the browser properly is to use the
   * {@link Browser.close} method.
   */
  process: ChildProcess;

  /**
   * The browser debugging port for further connection in any
   * convenient way.
   *
   * You can use it to create a `CDP` connection via your
   * preferred automation library.
   */
  port: number;

  /**
   * The browser websocket url for further connection in any
   * convenient way.
   *
   * You can use it to create a `CDP` connection via your
   * preferred automation library.
   */
  url: string;
}

/**
 * Launcher options that only apply to the browser when using the `spawn` method.
 */
export interface Options {
  /**
   * Specify custom debugging port. Pass `0` to discover a random port. Defaults to `0`.
   */
  debuggingPort?: number;

  /**
   * Path to a user data directory, which stores browser session data like cookies and local storage.
   */
  userDataDir?: string;

  /**
   * Whether to run browser in headless mode.
   * @default true
   */
  headless?: boolean;

  /**
   * Maximum time in milliseconds to wait for the browser instance to start. Defaults to `30000` (30 seconds). Pass `0` to disable timeout.
   */
  timeout?: number;

  /**
   * Additional arguments to pass to the browser instance. The list of Chromium flags can be found
   * [here](http://peter.sh/experiments/chromium-command-line-switches/).
   */
  args?: string[];
}

/**
 * Launches a browser instance with given arguments and options when specified.
 *
 * @param options - Set of configurable options to set on the browser.
 * @returns Promise which resolves to a browser instance.
 *
 * @internal
 */
export declare function launch(options?: Options): Promise<Browser>;
