/**
 * Options related to the browser profile configuration.
 */
export interface ProfileOptions {
  /**
   * Always load a proxy from the profile folder.
   *
   * In case the profile folder already exists and contains proxy data, tell the plugin to apply the last proxy used for this profile.
   *
   * @default true
   */
  loadProxy?: boolean;

  /**
   * Always load a fingerprint from the profile folder.
   *
   * In case the profile folder already exists and contains fingerprint data, tell the plugin to apply the last fingerprint used for this profile.
   *
   * @default true
   */
  loadFingerprint?: boolean;
}
