export default function logDeprecatedConfig(log, key: string, tip: string) {
  log.warn(`${key} in build.json has been deprecated. ${tip}`);
}
