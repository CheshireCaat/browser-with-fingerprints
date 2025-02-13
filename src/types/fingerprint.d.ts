/**
 * Options related to the browser fingerprint configuration.
 */
export interface FingerprintOptions {
  /**
   * Allows you to better emulate devices with higher pixel density.
   *
   * If this option is enabled, emulation will be done in the most natural way.
   * It means that the browser will render the page at a higher resolution, just like on a real device.
   * The trade-off is higher system resource usage because more calculations must be performed to render the bigger picture.
   *
   * The **JavaScript** options related to pixel density, such as `devicePixelRatio`, will be replaced correctly whether this option is enabled or not.
   *
   * @default true
   */
  emulateDeviceScaleFactor?: boolean;

  /**
   * The **Chrome** browser has a **Sensor API** that allows you to read data from devices such as accelerometer, gyroscope and others (data from these devices is only available on mobile platforms).
   *
   * After enabling this option, data for these devices will be generated and replaced automatically.
   *
   * Enable this option to emulate mobile fingerprints more accurately.
   *
   * @default true
   */
  emulateSensorAPI?: boolean;

  /**
   * If this option is set to `true`, the **PerfectCanvas** replacement will be enabled.
   *
   * The fingerprint must contain the **PerfectCanvas** data in order for it to work.
   *
   * @default true
   */
  usePerfectCanvas?: boolean;

  /**
   * By default, the browser only searches for fonts only in the system fonts folder.
   * This can lead to inconsistencies during fingerprint emulation if the target fingerprint has more fonts than the local system.
   * Therefore, it is recommended to download the **FontPack** with the most popular fonts - this setting allows to use the **FontPack** if it is installed.
   *
   * More info about the **FontPack** and download link can be found [here](https://wiki.bablosoft.com/doku.php?id=fontpack).
   *
   * @default true
   */
  useFontPack?: boolean;

  /**
   * If this option is set to `true`, the **API** results that return element coordinates will be updated to protect against the `ClientRects` fingerprinting.
   *
   * @default false
   */
  safeElementSize?: boolean;

  /**
   * If this option is set to `true`, the **Battery API** will show a different value for each thread, which will prevent sites from identifying your real identity.
   *
   * In case the device from which the fingerprint was obtained does not have a **Battery API**, it will always return the `100%` battery level.
   *
   * @default true
   */
  safeBattery?: boolean;

  /**
   * If this option is set to `true`, the canvas will be enabled, and noise will be added to all data returned from canvas.
   *
   * @default true
   */
  safeCanvas?: boolean;

  /**
   * If this option is set to `true`, the **Audio** will be enabled, and noise will be added to the **Audio** device.
   *
   * It means that your hardware properties, such as the audio sample rate and number of channels will be changed.
   *
   * @default true
   */
  safeAudio?: boolean;

  /**
   * If this option is set to `true`, the **WebGL** will be enabled, and noise will be added to the **WebGL** canvas.
   *
   * It means that your hardware properties, such as the video card manufacturer and renderer will be changed.
   *
   * @default true
   */
  safeWebGL?: boolean;
}
