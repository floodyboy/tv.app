import startCase from 'lodash/startCase';
import UAParser from 'ua-parser-js';

import { APP_INFO, APP_TITLE } from 'utils/app';

export function getDeviceInfo() {
  const uaParser = new UAParser();
  const uaOS = uaParser.getOS();
  const uaDevice = uaParser.getDevice();
  const uaBrowser = uaParser.getBrowser();
  const uaEngine = uaParser.getEngine();

  const browser =
    uaBrowser.name && uaBrowser.version
      ? `${startCase(uaBrowser.name)} ${uaBrowser.version}`
      : `${startCase(uaEngine.name)} ${uaEngine.version}`;

  const software = `${startCase(uaOS.name)} ${uaOS.version} (${APP_INFO})`;

  const hardware = uaDevice.vendor ? `${startCase(uaDevice.vendor)}${uaDevice.model ? ` ${uaDevice.model}` : ''} (${browser})` : browser;

  return { browser, software, hardware, title: APP_TITLE } as const;
}
