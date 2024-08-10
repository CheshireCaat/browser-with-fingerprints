const fs = require('fs/promises');

exports.reset = async (path) => {
  await fs.writeFile(`${path}/worker_command_line.txt`, '--mock-connector');
  await fs.writeFile(`${path}/settings.ini`, 'RunProfileRemoverImmediately=true');
};
