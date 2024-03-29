import { IPluginAPI } from 'build-scripts';
import address from 'address';
import setStaticConfig from './setStaticConfig';
import getBase from '../base';
import {
  GET_RAX_APP_WEBPACK_CONFIG,
  REACT_TRANSFORM_CONFIG,
  HTTPS_URL_LIST,
} from '../constants';
import setDevUrlPrefix from './setDevUrlPrefix';
import setRegisterMethod from './setRegisterMethod';

export default function (api: IPluginAPI) {
  const { setValue } = api;

  setValue(GET_RAX_APP_WEBPACK_CONFIG, getBase);

  // rax transform options
  setValue(REACT_TRANSFORM_CONFIG, {
    importSource: 'rax',
    pragma: 'createElement',
    pragmaFrag: 'Fragment',
  });

  setStaticConfig(api);

  // Set dev url prefix
  setDevUrlPrefix(api);

  // Set https url list
  setValue(HTTPS_URL_LIST, [address.ip()]);

  // Register global method
  setRegisterMethod(api);
}
