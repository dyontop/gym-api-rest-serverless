module.exports = {
  dynamo: {
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: process.env.DYNAMO_ENDPOINT,
    isOffline: String(process.env.IS_OFFLINE) === "true",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }
};