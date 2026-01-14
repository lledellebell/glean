/**
 * Plugin Detector Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import pluginDetector, {
  detectAllPlugins
} from '../lib/bridge/plugin-detector.js';

// Get constants from default export
const { KNOWN_PLUGINS } = pluginDetector;

describe('KNOWN_PLUGINS', () => {
  it('claude-code plugin definition exists', () => {
    assert.ok(KNOWN_PLUGINS['claude-code']);
    assert.ok(Array.isArray(KNOWN_PLUGINS['claude-code'].names));
    assert.ok(Array.isArray(KNOWN_PLUGINS['claude-code'].capabilities));
  });

  it('task-master plugin definition exists', () => {
    assert.ok(KNOWN_PLUGINS['task-master']);
    assert.ok(Array.isArray(KNOWN_PLUGINS['task-master'].names));
  });

  it('obsidian plugin definition exists', () => {
    assert.ok(KNOWN_PLUGINS.obsidian);
    assert.ok(Array.isArray(KNOWN_PLUGINS.obsidian.capabilities));
  });

  it('each plugin capability includes dataType and direction', () => {
    for (const [name, config] of Object.entries(KNOWN_PLUGINS)) {
      for (const cap of config.capabilities) {
        assert.ok(cap.name, `${name} capability missing name`);
        assert.ok(cap.dataType, `${name} capability missing dataType`);
        assert.ok(cap.direction, `${name} capability missing direction`);
      }
    }
  });
});

describe('detectAllPlugins', () => {
  it('should return an array', () => {
    const result = detectAllPlugins();
    assert.ok(Array.isArray(result));
  });

  it('returns results for all known plugins', () => {
    const result = detectAllPlugins();
    const knownTypes = Object.keys(KNOWN_PLUGINS);

    assert.strictEqual(result.length, knownTypes.length);

    for (const type of knownTypes) {
      const found = result.find(r => r.type === type);
      assert.ok(found, `${type} plugin detection result missing`);
    }
  });

  it('each result includes required fields', () => {
    const result = detectAllPlugins();

    for (const plugin of result) {
      assert.ok('type' in plugin, 'result missing type');
      assert.ok('detected' in plugin, 'result missing detected');
      assert.ok('path' in plugin, 'result missing path');
      assert.ok('capabilities' in plugin, 'result missing capabilities');
    }
  });

  it('detected should be boolean', () => {
    const result = detectAllPlugins();

    for (const plugin of result) {
      assert.strictEqual(typeof plugin.detected, 'boolean');
    }
  });

  it('capabilities should be array', () => {
    const result = detectAllPlugins();

    for (const plugin of result) {
      assert.ok(Array.isArray(plugin.capabilities));
    }
  });
});

describe('Plugin detection result structure', () => {
  it('detected plugin can have path and version', () => {
    const result = detectAllPlugins();
    const detected = result.find(p => p.detected);

    // If there's a detected plugin
    if (detected) {
      assert.ok(detected.path !== null, 'detected plugin path is null');
    }
  });

  it('undetected plugin has null path', () => {
    const result = detectAllPlugins();
    const notDetected = result.find(p => !p.detected);

    // If there's an undetected plugin
    if (notDetected) {
      assert.strictEqual(notDetected.path, null);
    }
  });
});
