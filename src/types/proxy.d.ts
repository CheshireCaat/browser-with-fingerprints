/**
 * Describes a method that can be used to extract an external IP address.
 */
export type IPExtractionMethod = 'raw' | 'xpath' | 'regexp' | 'jsonpath';

/**
 * Describes a basic replacement values for the private IP address.
 */
export type PrivateIPReplacement = IPString | 'disable' | 'local';

/**
 * Describes a basic replacement values for the public IP address.
 */
export type PublicIPReplacement = IPString | 'disable' | 'auto';

/**
 * Describes any string that can be resolved as the IP address.
 */
export type IPString = string & {};

/**
 * Options related to the browser proxy configuration.
 */
export interface ProxyOptions {
  /**
   * Change the browser language according to the country of the proxy server.
   *
   * This setting will change the `Accept-Language` header as well as the `navigator.language` and `navigator.languages` properties.
   *
   * @default true
   */
  changeBrowserLanguage?: boolean;

  /**
   * Change the browser geolocation to match the IP address of the proxy server - the
   * location will be set at a point close to the longitude and latitude of the server.
   *
   * If this option is disabled, the browser's request to access your geolocation will be rejected.
   *
   * @default false
   */
  changeGeolocation?: boolean;

  /**
   * Change the browser timezone to match the IP address of the proxy server.
   *
   * For example, if the proxy server is located in the **United Kingdom**, then the browser's timezone offset will be `UTC+00:00`.
   *
   * @default true
   */
  changeTimezone?: boolean;

  /**
   * Replace the IP address provided by **WebRTC** with the IP address of the proxy server.
   *
   * @default 'replace'
   */
  changeWebRTC?: 'enable' | 'disable' | 'replace';

  /**
   * Set a public IPv4 address that can be obtained via the **WebRTC**.
   *
   * This option is only used if the {@link changeWebRTC} option is set to `replace`.
   *
   * It is recommended to use the default `auto` value, but you can also specify a specific IP if needed.
   *
   * @default 'auto'
   */
  publicIPv4?: PublicIPReplacement;

  /**
   * Set a public IPv6 address that can be obtained via the **WebRTC**.
   *
   * This option is only used if the {@link changeWebRTC} option is set to `replace`.
   *
   * It is recommended to use the default `auto` value, but you can also specify a specific IP if needed.
   *
   * @default 'auto'
   */
  publicIPv6?: PublicIPReplacement;

  /**
   * Set a private IPv4 address that can be obtained via the **WebRTC**.
   *
   * This option is only used if the {@link changeWebRTC} option is set to `replace`.
   *
   * @default 'local'
   */
  privateIPv4?: PrivateIPReplacement | 'private class a' | 'private class b' | 'private class c';

  /**
   * Set a private IPv6 address that can be obtained via the **WebRTC**.
   *
   * This option is only used if the {@link changeWebRTC} option is set to `replace`.
   *
   * @default 'local'
   */
  privateIPv6?: PrivateIPReplacement | 'unique local address';

  /**
   * After receiving a response from the service URL, the IP address will be extracted from the response.
   *
   * This parameter specifies the method for extracting the IP address.
   * The {@link ipExtractionParam} must also be specified in combination with this parameter.
   *
   * Depending on the method used, the param will be treated differently.
   * For example, if the `regexp` method is used, the param must contain a regular expression, and so on.
   *
   * By default this parameter affects both IPv4** and IPv6 address types, if you need to configure each type separately, use object notation.
   *
   * @default 'raw'
   */
  ipExtractionMethod?: IPExtractionMethod | { v4: IPExtractionMethod; v6: IPExtractionMethod };

  /**
   * After receiving a response from the service URL, the IP address will be extracted from the response.
   *
   * This parameter specifies the param for extracting the IP address.
   * The {@link ipExtractionMethod} must also be specified in combination with this parameter.
   *
   * Depending on the method used, the param will be treated differently.
   * For example, if the `regexp` method is used, this param must contain a regular expression, and so on.
   *
   * By default this parameter affects both IPv4** and IPv6 address types, if you need to configure each type separately, use object notation.
   *
   * @default ''
   */
  ipExtractionParam?: string | { v4: string; v6: string };

  /**
   * This service URL is used to detect the external IP address.
   *
   * The URL will be queried through the currently installed proxy, and the response must contain the external IP address.
   *
   * By default this parameter affects both IPv4** and IPv6 address types, if you need to configure each type separately, use object notation.
   *
   * @default ''
   */
  ipExtractionURL?: string | { v4: string; v6: string };

  /**
   * Determine the IP address of the proxy server by requesting an external service.
   *
   * This option can be used if the IP address that you use to connect the proxy server does not match the IP address that is visible to the site (external IP address).
   *
   * By default this parameter affects both IPv4** and IPv6 address types, if you need to configure each type separately, use object notation.
   *
   * @default true
   */
  detectExternalIP?: boolean | { v4: boolean; v6: boolean };

  /**
   * The method that will be used to get information about the IP.
   *
   * By default, the internal `database` method is used - it is fast and always available.
   *
   * Even though the database is constantly updated, this method may not be the most accurate compared to others.
   * So you can also use `ip-api.com` service - the free version has a limit of 45 requests per IP (unlike the full version).
   *
   * @default 'database'
   */
  ipInfoMethod?: 'database' | 'ip-api.com';

  /**
   * The **API** key from the [ip-api.com](https://ip-api.com/) service (available after purchase).
   *
   * This parameter is used only if the method is set to `ip-api.com` value.
   *
   * @default '''
   */
  ipInfoKey?: string;
}
