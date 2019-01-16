import { deprecate } from 'util';
import cache from './cache';

export default deprecate((app) => {
  app.loopback.modelBuilder.mixins.define('Cache', cache);
}, 'DEPRECATED: Use mixinSources, see https://github.com/prototype-berlin/loopback-mixin-cache');

module.exports = exports.default;