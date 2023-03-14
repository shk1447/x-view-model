export class EventHandler<K> {
  private handlers: any;
  constructor() {
    this.handlers = {};
  }

  on = (event: K, func: (...args: any) => void) => {
    this.handlers[event] = this.handlers[event] || [];

    this.handlers[event].push(func);

    return this;
  };

  off = (event: K, func: (...args: any) => void) => {
    const _handlers = this.handlers[event];

    if (_handlers) {
      for (let i = 0; i < _handlers.length; i++) {
        if (_handlers[i] === func) {
          _handlers.splice(i, 1);
        }
      }
    }

    return this;
  };

  emit = (event: K, args?: any) => {
    if (this.handlers[event]) {
      for (let i = 0; i < this.handlers[event].length; i++) {
        try {
          this.handlers[event][i].apply(null, args ? args : []);
        } catch (err) {
          console.log(err);
        }
      }
    }

    return this;
  };

  clear = () => {
    this.handlers = {};
  };
}
