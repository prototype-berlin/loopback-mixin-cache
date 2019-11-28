const debug = require('debug')('loopback:mixins:cache');
const redis = require('redis');
const redisDeletePattern = require('redis-delete-pattern');

const DEFAULT_TTL = 120;
const DEFAULT_NO_CACHE_FLAG = 'noCache';
const DEFAULT_NO_CACHE_FLAG_DISABLED = false;
const METHODS_TO_CACHE = ['find', 'findById'];

let client;

module.exports = function (Model, options = {}) {
  debug('Redis cache mixin for model %s', Model.modelName);

  Model.getApp((error, app) => {
    if (error) {
      debug(`Error getting app: ${error}`);
    }

    let globalOptions = app.get('cache') || {};
    options.ttl = options.ttl || globalOptions.ttl || DEFAULT_TTL;
    options.noCacheFlag = options.noCacheFlag || globalOptions.noCacheFlag || DEFAULT_NO_CACHE_FLAG;
    options.noCacheFlagDisabled = options.noCacheFlagDisabled || globalOptions.noCacheFlagDisabled || DEFAULT_NO_CACHE_FLAG_DISABLED;

    client = redis.createClient();
  });

  Model.beforeRemote('**', (context, res, next) => {
    if (!client.connected) { return; }

    if (!options.noCacheFlagDisabled && context.req.query[options.noCacheFlag] === 'true') { return next(); }

    if (METHODS_TO_CACHE.includes(context.method.name) || context.method.name.indexOf('__get') !== -1) {
      const cacheKey = getCacheKey(context);

      context.needsCaching = true;
      context.cacheKey = cacheKey;

      client.get(cacheKey, (error, value) => {
        if (error) {
          console.error(error);
        }

        if (value) {
          debug(`Cache hit for key ${cacheKey}`);

          context.result = JSON.parse(value);
          context.done((error) => {
            if (error) {
              return next(error);
            }
          });
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });

  Model.afterRemote('**', async (context) => {
    if (!client.connected) { return; }

    if (!context.result) { return; }

    if (context.needsCaching) {
      client.set(context.cacheKey, JSON.stringify(context.result));
      client.expire(context.cacheKey, options.ttl);
    }
  });

  Model.afterRemote('**', async (context) => {
    if (!client.connected) { return; }

    if (!METHODS_TO_CACHE.includes(context.method.name) && context.method.name.indexOf('__get') === -1) {
      deleteCachedItems(context);
    }
  });

  function getCacheKey(context) {
    return `${getCacheKeyPrefix(context)}${new Buffer(JSON.stringify(context.req.query)).toString('base64')}`;
  }

  function getCacheKeyPrefix(context) {
    const id = getInstanceId(context) ? `_${getInstanceId(context)}` : '';

    return `${context.method.sharedClass.name}_${context.method.name}${id}_`;
  }

  function getInstanceId(context) {
    return context.instance ? context.instance.id : context.args.id;
  }

  function deleteCachedItems(context) {
    // TODO: find bestter solution for finding and deleting cached items
    // see https://github.com/galanonym/redis-delete-wildcard/issues/1

    redisDeletePattern({
      redis: client,
      pattern: `${context.method.sharedClass.name}_*${getInstanceId(context)}*`,
    }, function handleError(err) {
      if (err) {
        console.log(err);
      }
    });

    redisDeletePattern({
      redis: client,
      pattern: `${context.method.sharedClass.name}_find_*`,
    }, function handleError(err) {
      if (err) {
        console.log(err);
      }
    });
  }
}