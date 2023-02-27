try {
  module.exports = require(`./${process.platform}-${process.arch}/mutex`);
} catch {
  if (process.platform === 'win32') {
    throw new Error('Unsupported OS architecture for named mutex.');
  } else {
    throw new Error('Unsupported OS platform for named mutex.');
  }
}
