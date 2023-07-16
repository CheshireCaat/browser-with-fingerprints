const path = require('path');

exports.defaultArgs = ({ args = [], profile = '', devtools = false, headless = !devtools, extensions = [] } = {}) => {
  const result = ['--no-proxy-server', '--disable-features=NetworkServiceInProcess2', `--user-data-dir=${profile}`];

  const processed = args.reduce(
    (args, arg) => {
      const [key, value] = arg.split('=');
      if (!IGNORED_ARGS.some((value) => arg.includes(value))) {
        if (key.includes('disable-extensions-except') || key.includes('load-extension')) {
          args.push(`${key}=${extensions.concat(value)}`);
        } else {
          args.push(arg);
        }
      }
      return args;
    },
    extensions.length ? [`--load-extension=${extensions}`] : []
  );

  if (headless) {
    result.push('--hide-scrollbars', '--mute-audio');
  } else {
    result.push('--bas-force-visible-window');
  }

  return processed.concat(result);
};

exports.getProfilePath = ({ args = [], userDataDir = '' } = {}) => {
  if (userDataDir) return path.resolve(userDataDir);

  const profilePathArg = args.find((arg) => {
    return arg.startsWith('--user-data-dir');
  });

  return profilePathArg ? profilePathArg.split('=')[1] : '';
};

exports.validateConfig = (type, value, options) => {
  if (typeof value !== 'string' || typeof options !== 'object') {
    throw new Error(`Invalid arguments for ${type} configuration.`);
  }
};

exports.validateLauncher = (launcher) => {
  if (launcher == null || typeof launcher !== 'object' || typeof launcher.launch !== 'function') {
    throw new Error('Unsupported browser launcher - an object with a "launch" method is expected.');
  }
};

const IGNORED_ARGS = ['--kiosk', '--headless', '--user-data-dir', '--start-maximized', '--start-fullscreen'];
