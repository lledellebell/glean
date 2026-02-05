/**
 * Plugin Detector 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import pluginDetector, {
  detectAllPlugins
} from '../lib/bridge/plugin-detector.js';

// default export에서 상수 가져오기
const { KNOWN_PLUGINS } = pluginDetector;

describe('KNOWN_PLUGINS', () => {
  it('claude-code 플러그인 정의 존재', () => {
    assert.ok(KNOWN_PLUGINS['claude-code']);
    assert.ok(Array.isArray(KNOWN_PLUGINS['claude-code'].names));
    assert.ok(Array.isArray(KNOWN_PLUGINS['claude-code'].capabilities));
  });

  it('task-master 플러그인 정의 존재', () => {
    assert.ok(KNOWN_PLUGINS['task-master']);
    assert.ok(Array.isArray(KNOWN_PLUGINS['task-master'].names));
  });

  it('obsidian 플러그인 정의 존재', () => {
    assert.ok(KNOWN_PLUGINS.obsidian);
    assert.ok(Array.isArray(KNOWN_PLUGINS.obsidian.capabilities));
  });

  it('각 플러그인의 capabilities에 dataType과 direction 포함', () => {
    for (const [name, config] of Object.entries(KNOWN_PLUGINS)) {
      for (const cap of config.capabilities) {
        assert.ok(cap.name, `${name}의 capability에 name이 없음`);
        assert.ok(cap.dataType, `${name}의 capability에 dataType이 없음`);
        assert.ok(cap.direction, `${name}의 capability에 direction이 없음`);
      }
    }
  });
});

describe('detectAllPlugins', () => {
  it('배열을 반환해야 함', () => {
    const result = detectAllPlugins();
    assert.ok(Array.isArray(result));
  });

  it('모든 알려진 플러그인에 대한 결과 반환', () => {
    const result = detectAllPlugins();
    const knownTypes = Object.keys(KNOWN_PLUGINS);

    assert.strictEqual(result.length, knownTypes.length);

    for (const type of knownTypes) {
      const found = result.find(r => r.type === type);
      assert.ok(found, `${type} 플러그인 감지 결과가 없음`);
    }
  });

  it('각 결과에 필수 필드 포함', () => {
    const result = detectAllPlugins();

    for (const plugin of result) {
      assert.ok('type' in plugin, '결과에 type이 없음');
      assert.ok('detected' in plugin, '결과에 detected가 없음');
      assert.ok('path' in plugin, '결과에 path가 없음');
      assert.ok('capabilities' in plugin, '결과에 capabilities가 없음');
    }
  });

  it('detected는 boolean이어야 함', () => {
    const result = detectAllPlugins();

    for (const plugin of result) {
      assert.strictEqual(typeof plugin.detected, 'boolean');
    }
  });

  it('capabilities는 배열이어야 함', () => {
    const result = detectAllPlugins();

    for (const plugin of result) {
      assert.ok(Array.isArray(plugin.capabilities));
    }
  });
});

describe('Plugin detection result structure', () => {
  it('감지된 플러그인은 path와 version을 가질 수 있음', () => {
    const result = detectAllPlugins();
    const detected = result.find(p => p.detected);

    // 감지된 플러그인이 있다면
    if (detected) {
      assert.ok(detected.path !== null, '감지된 플러그인의 path가 null');
    }
  });

  it('감지되지 않은 플러그인은 path가 null', () => {
    const result = detectAllPlugins();
    const notDetected = result.find(p => !p.detected);

    // 감지되지 않은 플러그인이 있다면
    if (notDetected) {
      assert.strictEqual(notDetected.path, null);
    }
  });
});
