import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import { isWebpack4 } from '@builder/compat-webpack4';

export default function formatMessage(json) {
  if (isWebpack4) return formatWebpackMessages(json);
  return formatWebpackMessages({
    ...json,
    warnings: json.warnings.map(({ message }) => message),
    errors: json.errors.map(({ message }) => message),
  });
}
