import { getPHADevUrls } from './phaDevUrls';

export default function (api) {
  const { registerMethod } = api;
  registerMethod('rax.getPHADevUrls', getPHADevUrls);
}
