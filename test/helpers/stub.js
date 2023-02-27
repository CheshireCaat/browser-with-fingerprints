module.exports = function stub(obj, prop, value) {
  const property = Object.getOwnPropertyDescriptor(obj, prop);
  Object.defineProperty(obj, prop, { value });
  return () => (property ? Object.defineProperty(obj, prop, property) : obj);
};
