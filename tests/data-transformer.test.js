/**
 * Data Transformer 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  insightToObsidianNote,
  learnToObsidianNote,
  commitToHarvestChange,
  prToInsight,
  harvestToMarkdown
} from '../lib/bridge/data-transformer.js';

describe('insightToObsidianNote', () => {
  const mockInsight = {
    id: 'ins_123',
    type: 'pattern',
    title: 'React Query staleTime 최적화',
    content: '자주 변경되지 않는 데이터는 staleTime을 길게 설정',
    confidence: 0.9,
    meta: {
      tags: ['react', 'optimization'],
      createdAt: '2024-01-15T10:00:00Z'
    },
    pattern: {
      description: '데이터 특성에 따른 staleTime 조정',
      example: 'staleTime: 1000 * 60 * 5',
      antiPattern: 'staleTime을 0으로 설정하면 매번 refetch'
    }
  };

  it('frontmatter에 필수 필드 포함', () => {
    const result = insightToObsidianNote(mockInsight);

    assert.strictEqual(result.frontmatter.title, mockInsight.title);
    assert.strictEqual(result.frontmatter.type, mockInsight.type);
    assert.strictEqual(result.frontmatter.source, 'glean');
  });

  it('태그가 배열로 포함되어야 함', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(Array.isArray(result.frontmatter.tags));
    assert.deepStrictEqual(result.frontmatter.tags, ['react', 'optimization']);
  });

  it('content에 제목이 포함되어야 함', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(result.content.includes(`# ${mockInsight.title}`));
  });

  it('pattern 유형이면 패턴 설명 포함', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(result.content.includes('## 패턴 설명'));
    assert.ok(result.content.includes(mockInsight.pattern.description));
  });

  it('antiPattern이 있으면 포함', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(result.content.includes('## 피해야 할 방식'));
    assert.ok(result.content.includes(mockInsight.pattern.antiPattern));
  });

  it('filename이 적절한 형식이어야 함', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.match(result.filename, /^glean-pattern-ins_123\.md$/);
  });
});

describe('insightToObsidianNote - mistake type', () => {
  const mockMistake = {
    id: 'ins_456',
    type: 'mistake',
    title: 'null 체크 누락',
    content: '옵셔널 프로퍼티 접근 시 null 체크 누락',
    confidence: 0.85,
    meta: { tags: ['typescript'], createdAt: '2024-01-15' },
    mistake: {
      what: 'user.profile.name에서 profile이 null일 수 있음',
      why: 'TypeScript가 런타임 null을 감지하지 못함',
      how: 'Optional chaining 사용: user.profile?.name',
      prevention: 'strict null checks 활성화'
    }
  };

  it('mistake 유형이면 4가지 섹션 포함', () => {
    const result = insightToObsidianNote(mockMistake);

    assert.ok(result.content.includes('## 무엇이 잘못됐나'));
    assert.ok(result.content.includes('## 왜 잘못됐나'));
    assert.ok(result.content.includes('## 해결 방법'));
    assert.ok(result.content.includes('## 방지책'));
  });
});

describe('learnToObsidianNote', () => {
  const mockLearnItem = {
    id: 'learn_123',
    content: {
      title: 'useCallback 사용법',
      description: '함수 메모이제이션을 위한 훅',
      keyPoints: ['의존성 배열 관리', '참조 동등성 유지'],
      codeExample: 'const memoized = useCallback(() => {}, [dep])',
      resources: ['https://react.dev/reference/react/useCallback']
    },
    classification: {
      topic: 'react-hooks',
      tags: ['react', 'hooks', 'optimization'],
      difficulty: 'intermediate'
    },
    spaceRep: {
      confidence: 4,
      nextReview: '2024-01-22',
      reviewCount: 3
    },
    meta: {
      createdAt: '2024-01-01'
    }
  };

  it('frontmatter에 학습 관련 필드 포함', () => {
    const result = learnToObsidianNote(mockLearnItem);

    assert.strictEqual(result.frontmatter.title, mockLearnItem.content.title);
    assert.strictEqual(result.frontmatter.topic, 'react-hooks');
    assert.strictEqual(result.frontmatter.difficulty, 'intermediate');
    assert.strictEqual(result.frontmatter.source, 'glean-learn');
  });

  it('핵심 포인트가 목록으로 포함', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.ok(result.content.includes('## 핵심 포인트'));
    assert.ok(result.content.includes('- 의존성 배열 관리'));
  });

  it('코드 예시가 코드 블록으로 포함', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.ok(result.content.includes('## 코드 예시'));
    assert.ok(result.content.includes('```'));
    assert.ok(result.content.includes(mockLearnItem.content.codeExample));
  });

  it('복습 정보 섹션 포함', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.ok(result.content.includes('## 복습 정보'));
    assert.ok(result.content.includes('복습 횟수: 3'));
  });

  it('filename이 topic과 id를 포함', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.match(result.filename, /^learn-react-hooks-learn_123\.md$/);
  });
});

describe('commitToHarvestChange', () => {
  it('Git commit 객체를 harvest change로 변환', () => {
    const commit = {
      hash: 'abc123def456',
      message: 'feat: 새 기능 추가',
      date: '2024-01-15T10:00:00Z',
      stats: { total: 5 }
    };

    const result = commitToHarvestChange(commit);

    assert.strictEqual(result.hash, 'abc123def456');
    assert.strictEqual(result.message, 'feat: 새 기능 추가');
    assert.strictEqual(result.timestamp, '2024-01-15T10:00:00Z');
    assert.strictEqual(result.filesChanged, 5);
  });

  it('다른 형식의 commit도 처리', () => {
    const commit = {
      sha: 'xyz789',
      commit: {
        message: 'fix: 버그 수정',
        author: { date: '2024-01-15' }
      },
      files: [{}, {}, {}]
    };

    const result = commitToHarvestChange(commit);

    assert.strictEqual(result.hash, 'xyz789');
    assert.strictEqual(result.message, 'fix: 버그 수정');
    assert.strictEqual(result.filesChanged, 3);
  });
});

describe('prToInsight', () => {
  const mockPR = {
    title: 'feat: 인증 시스템 추가',
    body: '사용자 인증을 위한 JWT 기반 시스템 구현',
    repo: 'lledellebell/glean',
    files: [{ filename: 'lib/auth.js' }, { filename: 'lib/jwt.js' }],
    labels: [{ name: 'feature' }, { name: 'auth' }],
    createdAt: '2024-01-15T10:00:00Z'
  };

  it('PR을 learning 유형 인사이트로 변환', () => {
    const result = prToInsight(mockPR);

    assert.strictEqual(result.type, 'learning');
    assert.ok(result.title.includes('PR Review:'));
    assert.strictEqual(result.content, mockPR.body);
  });

  it('context에 프로젝트와 파일 목록 포함', () => {
    const result = prToInsight(mockPR);

    assert.strictEqual(result.context.project, 'lledellebell/glean');
    assert.deepStrictEqual(result.context.files, ['lib/auth.js', 'lib/jwt.js']);
  });

  it('meta에 PR 관련 태그 포함', () => {
    const result = prToInsight(mockPR);

    assert.ok(result.meta.tags.includes('pr'));
    assert.ok(result.meta.tags.includes('code-review'));
  });

  it('learning 정보에 keyPoints 포함', () => {
    const result = prToInsight(mockPR);

    assert.ok(result.learning.keyPoints.includes(mockPR.title));
    assert.ok(result.learning.keyPoints.some(p => p.includes('Labels:')));
  });
});

describe('harvestToMarkdown', () => {
  const mockHarvest = {
    id: 'harvest_123',
    session: {
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T12:00:00Z',
      project: 'my-project'
    },
    summary: {
      description: '인증 기능 구현',
      mainTasks: ['JWT 토큰 구현', '로그인 API 추가'],
      keywords: ['auth', 'jwt']
    },
    changes: {
      files: [
        { path: 'lib/auth.js', action: 'created' },
        { path: 'lib/jwt.js', action: 'modified' }
      ],
      commits: [
        { hash: 'abc123', message: 'feat: JWT 추가' }
      ]
    },
    insights: [
      { type: 'pattern', content: 'httpOnly 쿠키로 토큰 저장' }
    ]
  };

  it('제목이 harvest ID를 포함', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('# 세션 수확: harvest_123'));
  });

  it('세션 정보 포함', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('프로젝트: my-project'));
  });

  it('요약 섹션 포함', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## 요약'));
    assert.ok(md.includes('인증 기능 구현'));
  });

  it('주요 작업 목록 포함', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## 주요 작업'));
    assert.ok(md.includes('- JWT 토큰 구현'));
  });

  it('변경 파일 목록 포함', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## 변경 파일'));
    assert.ok(md.includes('lib/auth.js (created)'));
  });

  it('커밋 목록 포함', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## 커밋'));
    assert.ok(md.includes('feat: JWT 추가'));
    assert.ok(md.includes('abc123'));
  });

  it('인사이트 목록 포함', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## 인사이트'));
    assert.ok(md.includes('[pattern]'));
    assert.ok(md.includes('httpOnly 쿠키로 토큰 저장'));
  });
});
