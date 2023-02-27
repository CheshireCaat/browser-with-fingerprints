/**
 * Creates or opens a named mutex object. Also waits until the mutex
 * object enters a signaling state or the waiting interval expires.
 *
 * @param name - Mutex name as a string.
 */
export declare function create(name: string): void;
