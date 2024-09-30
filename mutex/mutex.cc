#include <napi-macros.h>
#include <node_api.h>
#include <windows.h>

NAPI_METHOD(create) {
  NAPI_ARGV(1);
  NAPI_ARGV_UTF8_MALLOC(name, 0);

  HANDLE mutex = CreateMutexA(NULL, false, name);
  if (mutex) {
    WaitForSingleObject(mutex, INFINITE);
  }

  return NULL;
}

NAPI_INIT() {
  NAPI_EXPORT_FUNCTION(create);
}