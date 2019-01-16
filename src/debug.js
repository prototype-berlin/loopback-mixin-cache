import debug from 'debug';

export default (name = 'cache') => debug(`loopback:mixins:${name}`);