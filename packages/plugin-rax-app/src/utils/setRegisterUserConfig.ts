export default function (targets: string[], registerUserConfig) {
  let hasWebTask = false;
  targets.forEach((target) => {
    if (target === 'web') {
      hasWebTask = true;
    }
    registerUserConfig({
      name: target,
      validation: 'object',
    });
  });

  // Register document config key with web
  if (hasWebTask) {
    registerUserConfig({
      name: 'document',
      validation: 'object',
    });
  }
}
