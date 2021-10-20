
import setStaticConfig from './setStaticConfig';
import getBase from '../base';
import {
  GET_RAX_APP_WEBPACK_CONFIG,
  REACT_TRANSFORM_CONFIG,
} from '../constants';

export default function (api) {
  const { setValue } = api;

  setValue(GET_RAX_APP_WEBPACK_CONFIG, getBase);

  // rax transform options
  setValue(REACT_TRANSFORM_CONFIG, {
    importSource: 'rax',
    pragma: 'createElement',
    pragmaFrag: 'Fragment',
  });

  setStaticConfig(api);
}
