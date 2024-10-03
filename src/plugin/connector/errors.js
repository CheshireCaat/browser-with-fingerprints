const dedent = require('dedent');

class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
}

class InvalidEngineError extends CustomError {
  constructor(message) {
    super(dedent`
      ${message}
      This could be due to the fact that the engine was not downloaded or unpacked correctly.
      Try completely deleting the engine folder and restarting the code until it completes.
      If this does not help, open an issue with a detailed description of the problem.
    `);
  }
}

module.exports = { CustomError, InvalidEngineError };
