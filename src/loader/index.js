const { compare } = require('compare-versions');

module.exports = class Loader {
  constructor(target, version, packages = []) {
    this.packages = packages;
    this.version = version;
    this.target = target;
  }

  static import(packages = []) {
    if (!packages.length) return;

    for (const id of packages) {
      try {
        return [require(id), require(`${id}/package.json`).version];
      } catch {
        continue;
      }
    }

    throw new Error(`None of the following packages could be found - "${packages.join('", "')}".`);
  }

  load(property = 'chromium') {
    const [module, version] = Loader.import([this.target, ...this.packages]);

    if (version && this.version && compare(version, this.version, '<')) {
      throw new Error(
        `Version ${version} of the "${this.target}" package is not supported - use version ${this.version} or higher.`
      );
    }

    return property in module ? module[property] : module;
  }
};
