const IGNORED_ARGS = ['--kiosk', '--headless', '--start-maximized', '--start-fullscreen'];

exports.defaultArgs = ({ args = [], devtools = false, headless = !devtools } = {}) => {
  const result = ['--no-sandbox', '--no-proxy-server', '--disable-features=NetworkServiceInProcess2'];

  if (headless) {
    result.push('--hide-scrollbars', '--mute-audio');
  } else {
    result.push('--bas-force-visible-window');
  }

  return args.filter((arg) => !IGNORED_ARGS.some((value) => arg.includes(value))).concat(result);
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
