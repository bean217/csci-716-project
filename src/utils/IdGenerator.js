/**
 * file: src/utils/IdGenerator.js
 * desc: Utility for generating a simple, unique ID for geometric objects.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

/**
 * Simple unique ID generator for geometric objects
 */
class IdGenerator {
    constructor() {
        this.counter = 0;
    }

    // Generate a unique ID
    generate(prefix = 'obj') {
        return `${prefix}${++this.counter}_${Date.now()}`;
    }

    // Reset counter
    reset() {
        this.counter = 0;
    }
}

// Export a singleton instance for use across the application
export default new IdGenerator();