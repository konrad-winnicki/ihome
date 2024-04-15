export function getNodeEnvType(): string {
  const env = process.env.NODE_ENV;
  if (env) {
    return env;
  }
  throw new Error("Environment variable NODE_ENV must be specified.");
}
