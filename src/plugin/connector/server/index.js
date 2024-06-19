const net = require('net');
const once = require('once');
const debug = require('debug')('browser-with-fingerprints:connector:server');

exports.listen = once(() => {
  let id = 0;

  return new Promise((resolve) => {
    const server = net.createServer((socket) => {
      socket.on('data', ([byte]) => {
        if (byte === 1) {
          socket.write(
            new Uint8Array([0x01, 0x04, 0x00, 0x00, 0x00, 0x0a, id & 0xff, (id >> 8) & 0xff, (id >> 16) & 0xff])
          );
          id++;
        }

        if (byte === 7) {
          socket.write(new Uint8Array([0x07, 0x00, 0x00, 0x00, 0x00]));
        }
      });

      socket.on('error', (error) => debug(error));
    });

    server.on('error', ({ code }) => {
      if (code === 'EADDRINUSE') {
        setTimeout(() => server.listen(PORT, '127.0.0.1'), 1000).unref();
      }
    });

    server.listen(PORT, '127.0.0.1', () => resolve(server.address())).unref();
  });
});

const PORT = 0;
