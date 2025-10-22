/**
 * @ldesign/i18n - Weak Reference Event Emitter
 * Prevents memory leaks from event listeners using WeakRef
 */

/**
 * Event listener wrapper with weak reference support
 */
interface ListenerWrapper<T extends (...args: any[]) => void> {
  ref: WeakRef<T> | T;
  weak: boolean;
  once: boolean;
}

/**
 * Weak Event Emitter
 * Automatically cleans up listeners that have been garbage collected
 */
export class WeakEventEmitter {
  private readonly events = new Map<string, Set<ListenerWrapper<any>>>();
  private readonly maxListeners: number;
  private listenerCount = 0;
  private cleanupTimer?: NodeJS.Timeout;
  private readonly cleanupInterval: number;

  constructor(options: { maxListeners?: number; cleanupInterval?: number } = {}) {
    this.maxListeners = options.maxListeners || 100;
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute

    this.scheduleCleanup();
  }

  /**
   * Add event listener
   */
  on<T extends (...args: any[]) => void>(
    event: string,
    listener: T,
    options: { weak?: boolean } = {}
  ): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const listeners = this.events.get(event)!;

    // Check listener limit
    if (this.listenerCount >= this.maxListeners) {
      console.warn(`[@ldesign/i18n] Max listeners (${this.maxListeners}) exceeded for event "${event}"`);
      return () => { };
    }

    // Create wrapper
    const wrapper: ListenerWrapper<T> = {
      ref: options.weak && typeof WeakRef !== 'undefined' ? new WeakRef(listener) : listener,
      weak: options.weak && typeof WeakRef !== 'undefined',
      once: false
    };

    listeners.add(wrapper);
    this.listenerCount++;

    // Return unsubscribe function
    return () => {
      if (listeners.delete(wrapper)) {
        this.listenerCount--;

        // Clean up event if no listeners
        if (listeners.size === 0) {
          this.events.delete(event);
        }
      }
    };
  }

  /**
   * Add one-time event listener
   */
  once<T extends (...args: any[]) => void>(
    event: string,
    listener: T,
    options: { weak?: boolean } = {}
  ): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const listeners = this.events.get(event)!;

    if (this.listenerCount >= this.maxListeners) {
      console.warn(`[@ldesign/i18n] Max listeners (${this.maxListeners}) exceeded`);
      return () => { };
    }

    const wrapper: ListenerWrapper<T> = {
      ref: options.weak && typeof WeakRef !== 'undefined' ? new WeakRef(listener) : listener,
      weak: options.weak && typeof WeakRef !== 'undefined',
      once: true
    };

    listeners.add(wrapper);
    this.listenerCount++;

    return () => {
      if (listeners.delete(wrapper)) {
        this.listenerCount--;
        if (listeners.size === 0) {
          this.events.delete(event);
        }
      }
    };
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.events.get(event);
    if (!listeners) return;

    for (const wrapper of listeners) {
      const fn = wrapper.weak && typeof wrapper.ref === 'object' && 'deref' in wrapper.ref
        ? wrapper.ref.deref()
        : wrapper.ref;

      if (fn === listener) {
        listeners.delete(wrapper);
        this.listenerCount--;

        if (listeners.size === 0) {
          this.events.delete(event);
        }
        break;
      }
    }
  }

  /**
   * Emit event
   */
  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) return;

    // Convert to array to avoid modification during iteration
    const listenersArray = Array.from(listeners);
    const toRemove: ListenerWrapper<any>[] = [];

    for (const wrapper of listenersArray) {
      // Get actual listener
      const listener = wrapper.weak && typeof wrapper.ref === 'object' && 'deref' in wrapper.ref
        ? wrapper.ref.deref()
        : wrapper.ref;

      // Skip if garbage collected
      if (!listener) {
        toRemove.push(wrapper);
        continue;
      }

      // Call listener
      try {
        listener(...args);
      } catch (error) {
        console.error(`[@ldesign/i18n] Error in event listener for "${event}":`, error);
      }

      // Remove if once
      if (wrapper.once) {
        toRemove.push(wrapper);
      }
    }

    // Clean up removed listeners
    for (const wrapper of toRemove) {
      listeners.delete(wrapper);
      this.listenerCount--;
    }

    // Clean up event if no listeners
    if (listeners.size === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Remove all listeners for an event or all events
   */
  removeAllListeners(event?: string): void {
    if (event) {
      const listeners = this.events.get(event);
      if (listeners) {
        this.listenerCount -= listeners.size;
        this.events.delete(event);
      }
    } else {
      this.listenerCount = 0;
      this.events.clear();
    }
  }

  /**
   * Schedule periodic cleanup of garbage collected listeners
   */
  private scheduleCleanup(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    this.cleanupTimer = setTimeout(() => {
      this.cleanup();
      this.scheduleCleanup();
    }, this.cleanupInterval);

    // Avoid keeping Node.js process alive
    if (typeof (this.cleanupTimer as any)?.unref === 'function') {
      (this.cleanupTimer as any).unref();
    }
  }

  /**
   * Clean up garbage collected listeners
   */
  private cleanup(): void {
    let removed = 0;

    for (const [event, listeners] of this.events) {
      const toRemove: ListenerWrapper<any>[] = [];

      for (const wrapper of listeners) {
        if (wrapper.weak && typeof wrapper.ref === 'object' && 'deref' in wrapper.ref) {
          const listener = wrapper.ref.deref();
          if (!listener) {
            toRemove.push(wrapper);
          }
        }
      }

      for (const wrapper of toRemove) {
        listeners.delete(wrapper);
        removed++;
      }

      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }

    this.listenerCount -= removed;

    if (removed > 0) {
      console.debug(`[@ldesign/i18n] Cleaned up ${removed} garbage collected listeners`);
    }
  }

  /**
   * Get listener count
   */
  listenerCount(event?: string): number {
    if (event) {
      return this.events.get(event)?.size || 0;
    }
    return this.listenerCount;
  }

  /**
   * Get event names
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Destroy emitter and clean up
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.removeAllListeners();
  }
}


