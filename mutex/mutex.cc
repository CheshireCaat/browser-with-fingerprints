#include <assert.h>
#include <windows.h>
#include <node_api.h>

static napi_value Create(napi_env env, napi_callback_info info)
{
  size_t argc = 1;
  napi_value args[1];

  if (napi_get_cb_info(env, info, &argc, args, NULL, NULL) == napi_ok && argc > 0)
  {
    size_t len;

    if (napi_get_value_string_utf8(env, args[0], NULL, 0, &len) == napi_ok)
    {
      const char *name = (const char *)malloc(len + 1);

      if (napi_get_value_string_utf8(env, args[0], (char *)name, len + 1, NULL) == napi_ok)
      {
        HANDLE mutex = CreateMutex(NULL, false, name);
        if (mutex) WaitForSingleObject(mutex, INFINITE);
      }
    }
  }

  return NULL;
}

#define DECLARE_NAPI_METHOD(name, func)     \
  {                                         \
    name, 0, func, 0, 0, 0, napi_default, 0 \
  }

napi_value Init(napi_env env, napi_value exports)
{
  napi_property_descriptor desc = DECLARE_NAPI_METHOD("create", Create);
  assert(napi_define_properties(env, exports, 1, &desc) == napi_ok);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)