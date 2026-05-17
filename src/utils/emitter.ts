type Listener = (...args: any[]) => void;

class BrowserEventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  on(eventName: string, listener: Listener) {
    const eventListeners = this.listeners.get(eventName) || new Set<Listener>();
    eventListeners.add(listener);
    this.listeners.set(eventName, eventListeners);
    return this;
  }

  once(eventName: string, listener: Listener) {
    const onceListener: Listener = (...args) => {
      this.removeListener(eventName, onceListener);
      listener(...args);
    };
    return this.on(eventName, onceListener);
  }

  emit(eventName: string, ...args: any[]) {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners) return false;

    eventListeners.forEach((listener) => listener(...args));
    return true;
  }

  removeListener(eventName: string, listener: Listener) {
    this.listeners.get(eventName)?.delete(listener);
    return this;
  }

  off(eventName: string, listener: Listener) {
    return this.removeListener(eventName, listener);
  }

  removeAllListeners(eventName?: string) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  setMaxListeners() {
    return this;
  }
}

const _emitter = new BrowserEventEmitter();

export default _emitter;
