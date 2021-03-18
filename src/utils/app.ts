const pkg = require('../../package.json');

export const APP_ID: string = process.env.REACT_APP_ID || pkg.name;
export const APP_TITLE: string = process.env.REACT_APP_TITLE || pkg.description;
export const APP_VERSION: string = process.env.REACT_APP_VERSION || pkg.version;
export const APP_INFO: string = `${APP_TITLE} ${APP_VERSION}`;
