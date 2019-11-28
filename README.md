# Redis cache mixin for LoopBack

loopback-mixin-cache adds easy to use redis caching to any of your models.

## Installation

```
$ npm i loopback-mixin-cache --save
```

## Config

### Server Config

With [loopback-boot@v2.8.0](https://github.com/strongloop/loopback-boot/) [mixinSources](https://github.com/strongloop/loopback-boot/pull/131) have been implemented in a way which allows for loading this mixin without changes to the server.js file previously required. Just add `"../node_modules/loopback-mixin-cache"` to the `mixins` property of your `server/model-config.json`.

```javascript
{
  "_meta": {
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-mixin-cache",
      "../common/mixins"
    ]
  }
}
```
### Model Config

To use with your models just add `Cache: true` to `mixins` in your model config and the default options will be used:

```javascript
{
  "name": "Model",
  "properties": {
    "name": {
      "type": "string",
    }
  },
  "mixins": {
    "Cache": true
  }

  ...

  // you can also overide the default values:
  "mixins": {
    "Cache": {
      "ttl": 30    // time to live (how long an item is being cached), default: 120
    }
  }
}
```

### Global Config

It is also possible to configure the mixin globally in your `config.json`. Just add `cache` and use the same options as with the model above:

```javascript
{
  "cache": {
    "ttl": 30    // time to live (how long an item is being cached), default: 120
  }
}
```

## ToDo and ideas

- [ ] optimize cache keys
- [x] add override parameter (e.g. ?noCache=true)
- [ ] add better usage documentation to this readme (e.g. noCaheFlag)
- [ ] find better solution for searching and deleting cached items
- [ ] add response headers with information about the cache (environment agnostic)

## License

[MIT](LICENSE)

## Changelog

### v0.3.0
- Remove babel
- min. node version is now 8.x.x

### v0.2.0
- Update dev dependencies

### v0.1.0
- Initial stable version
