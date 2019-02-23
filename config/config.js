const lodash = require('lodash');
const fs = require('fs');

const config = require('./config.json');

const defaultConfig = config.development;
const environment = process.env.NODE_ENV || "development";
console.log(process.env.NODE_ENV);
const environmentConfig = config[environment];
const finalConfig = lodash.merge(defaultConfig, environmentConfig);		//union of default and env config.
global.gConfig = finalConfig;

console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);