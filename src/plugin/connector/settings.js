const fs = require('fs');
const once = require('once');

exports.reset = once((path) => {
  fs.writeFileSync(`${path}/worker_command_line.txt`, '--mock-connector');
  fs.writeFileSync(`${path}/settings.ini`, 'RunProfileRemoverImmediately=true');
});
