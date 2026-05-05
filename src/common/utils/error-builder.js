function buildError({ message, detail }) {
  return {
    message,
    detail,
    timestamp: new Date().toISOString()
  };
}

module.exports = buildError;