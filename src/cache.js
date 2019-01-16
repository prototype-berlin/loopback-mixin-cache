import _debug from './debug';

const debug = _debug();
const warn = _debug(); // create a namespaced warning
warn.log = console.warn.bind(console); // eslint-disable-line no-console

const DEFAULT_TTL = 60;

export default async (Model, options = {}) => {
  debug('Redis cache mixin for model %s', Model.modelName);

  Model.getApp((error, app) => {
    if (error) {
      debug(`Error getting app: ${error}`);
    }
    
    let globalOptions = app.get('cache') || {};
    options.ttl = options.ttl || globalOptions.ttl || DEFAULT_TTL;
  });

};

module.exports = exports.default;
