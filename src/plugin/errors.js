const dedent = require('dedent');

class PluginError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
}

class MissingKeyError extends PluginError {
  constructor(message) {
    super(dedent`
      ${message}
      Due to the latest updates, it is necessary to specify the key not only when receiving it, but also when applying it.
      To solve the problem, use the documentation at the link - https://github.com/CheshireCaat/browser-with-fingerprints#common-problems.
    `);
  }
}

class InvalidEngineError extends PluginError {
  constructor(message) {
    super(dedent`
      ${message}
      This could be due to the fact that the engine was not downloaded or unpacked correctly.
      Try completely deleting the engine folder and restarting the code until it completes.
      If this does not help, open an issue with a detailed description of the problem.
    `);
  }
}

class EngineTimeoutError extends PluginError {
  constructor(message) {
    super(dedent`
      ${message}
      You can change the timeout using the "setEngineTimeout" method - it sets a time limit for fetching engine files.
      For more info you can use the documentation at the link - https://github.com/CheshireCaat/browser-with-fingerprints#common-problems.
    `);
  }
}

class RequestTimeoutError extends PluginError {
  constructor(message) {
    super(dedent`
      ${message}
      You can change the timeout using the "setRequestTimeout" method - it sets a time limit for executing engine requests.
      For more info you can use the documentation at the link - https://github.com/CheshireCaat/browser-with-fingerprints#common-problems.
    `);
  }
}

module.exports = { PluginError, MissingKeyError, InvalidEngineError, EngineTimeoutError, RequestTimeoutError };
