export default function (targets: string[], registerUserConfig) {
  targets.forEach((target) => {
    registerUserConfig({
      name: target,
      validation: 'object',
    });
  });
}
