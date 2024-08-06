## Mutex

This folder contains source code for the mutex bindings.

## Build

It will take several steps to build the addon:

1. Install the dependencies as indicated [here](https://github.com/nodejs/node-gyp?tab=readme-ov-file#installation).
2. Install the [prebuildify](https://github.com/prebuild/prebuildify/tree/master) package and dev dependencies of the project.
3. Run the build using the **mutex:prebuild-all** script (other options are designed to simplify the overall build).

If the build is successful, the addon files will be updated in the plugin source code.
