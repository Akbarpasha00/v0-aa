function safeHas(obj, prop) {
  return obj && typeof obj === "object" && obj.hasOwnProperty(prop)
}
