## Mutex

This folder contains source code for the mutex bindings.

## Build

First, create a **binding.gyp** file in the root directory of the project:

```json
{
  "targets": [
    {
      "target_name": "mutex",
      "conditions": [
        [
          "OS == 'win'",
          {
            "sources": ["mutex/mutex.cc"],
            "include_dirs": ["<!(node -e \"require('napi-macros')\")"],
            "libraries": ["-lversion.lib"],
            "msvs_settings": {
              "VCCLCompilerTool": {
                "RuntimeTypeInfo": "false",
                "ExceptionHandling": 1,
                "DisableSpecificWarnings": ["4355", "4530", "4267", "4244", "4506"]
              }
            },
            "configurations": {
              "Release": {
                "msvs_settings": {
                  "VCCLCompilerTool": {
                    "ExceptionHandling": 1
                  }
                }
              }
            }
          }
        ]
      ]
    }
  ],
  "variables": {
    "openssl_fips": ""
  }
}
```

After that, it will take several steps to build the addon:

1. Install the dependencies as indicated [here](https://github.com/nodejs/node-gyp?tab=readme-ov-file#installation).
2. Install the [prebuildify](https://github.com/prebuild/prebuildify/tree/master) package and dev dependencies of the project.
3. Run the build using the **mutex:prebuild-all** script (other options are designed to simplify the overall build).

If the build is successful, the addon files will be updated in the plugin source code.
