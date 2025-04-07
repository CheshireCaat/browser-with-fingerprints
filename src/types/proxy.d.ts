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
   * Set a public **IPv4** address that can be obtained via the **WebRTC**.
   *
   * This option is only used if the {@link changeWebRTC} option is set to `replace`.
   *
   * It is recommended to use the default `auto` value, but you can also specify a specific IP if needed.
   *
   * @default 'auto'
   */
  publicIPv4?: PublicIPReplacement;

  /**
   * Set a public **IPv6** address that can be obtained via the **WebRTC**.
   *
   * This option is only used if the {@link changeWebRTC} option is set to `replace`.
   *
   * It is recommended to use the default `auto` value, but you can also specify a specific IP if needed.
   *
   * @default 'auto'
   */
  publicIPv6?: PublicIPReplacement;

  /**
   * Set a private **IPv4** address that can be obtained via the **WebRTC**.
   *
   * This option is only used if the {@link changeWebRTC} option is set to `replace`.
   *
   * @default 'local'
   */
  privateIPv4?: PrivateIPReplacement | 'private class a' | 'private class b' | 'private class c';

  /**
   * Set a private **IPv6** address that can be obtained via the **WebRTC**.
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
   * By default this parameter affects both **IPv4** and **IPv6** address types, if you need to configure each type separately, use object notation.
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
   * By default this parameter affects both **IPv4** and **IPv6** address types, if you need to configure each type separately, use object notation.
   *
   * @default ''
   */
  ipExtractionParam?: string | { v4: string; v6: string };

  /**
   * This service URL is used to detect the external IP address.
   *
   * The URL will be queried through the currently installed proxy, and the response must contain the external IP address.
   *
   * By default this parameter affects both **IPv4** and **IPv6** address types, if you need to configure each type separately, use object notation.
   *
   * @default ''
   */
  ipExtractionURL?: string | { v4: string; v6: string };

  /**
   * Determine the IP address of the proxy server by requesting an external service.
   *
   * This option can be used if the IP address that you use to connect the proxy server does not match the IP address that is visible to the site (external IP address).
   *
   * By default this parameter affects both **IPv4** and **IPv6** address types, if you need to configure each type separately, use object notation.
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

  /**
   * Unlike **HTTP**, the **QUIC** protocol is built on top of **UDP**.
   *
   * Not all proxies support **UDP**, which means that enabling **QUIC** may cause problems with some proxies.
   *
   * It is recommended to enable this option only if you are sure that your proxy server supports it.
   *
   * @default false
   */
  enableQUIC?: boolean;

  /**
   * By default, the browser uses a custom DNS implementation that supports additional DNS features.
   * If these features are missing, websites can detect it.
   *
   * Rather than relying on the native **OS** DNS functions (such as `getaddrinfo`), the custom DNS sends requests directly via UDP or TCP.
   * The plugin provides the ability to enable this custom DNS feature, allowing you to route DNS traffic through a proxy server or send UDP packets directly.
   *
   * Although it is generally harder for websites to detect a custom DNS, they can still recognize that you are using a DNS server other than your ISP's default DNS server.
   *
   * Possible values:
   * - `custom-proxy` - Use **Chrome's** built-in custom DNS implementation to make DNS queries through a proxy server (the proxy server must support UDP).
   * - `custom-direct` - Use **Chrome's** built-in custom DNS implementation to make DNS queries locally (via UDP or TCP), while routing all other traffic through a proxy server.
   * - `system-proxy` - Use the system DNS implementation - all DNS queries will be handled by the proxy server, which uses its own DNS, with the hostname sent to the proxy as part of the process.
   *
   * The `custom-direct` mode is recommended option if you want to use the custom DNS.
   *
   * @remarks
   * **NOTE**: Enabling custom DNS also requires specifying a DNS server IP.
   *
   * @default 'system-proxy'
   */
  dnsMode?: 'system-proxy' | 'custom-proxy' | 'custom-direct';

  /**
   * Using the custom **Chrome** DNS implementation requires specifying a DNS IP address.
   * Unlike the default method, where the hostname is sent to the proxy server and the proxy server performs a DNS
   * lookup, this approach resolves IP addresses locally, which requires configuring the DNS server IP for the browser.
   *
   * When using the `custom-proxy` or `custom-direct` mode, a valid DNS IP address is required for proper DNS resolution.
   *
   * @remarks
   * **NOTE**: If the `system-proxy` mode is selected, this setting will have no effect.
   *
   * @default '1.1.1.1'
   */
  dnsIP?: string;
}
