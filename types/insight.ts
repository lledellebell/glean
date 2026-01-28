/**
 * Glean Insight 데이터 스키마
 * 세션에서 추출한 인사이트를 저장하는 형식
 */

// 인사이트 유형
export type InsightType = 'pattern' | 'mistake' | 'optimization' | 'learning';

// 인사이트 상태
export type InsightStatus = 'new' | 'reviewed' | 'applied' | 'dismissed';

// 단일 인사이트
export interface Insight {
  id: string;
  version: '1.0';

  // 기본 정보
  type: InsightType;
  title: string;
  content: string;
  confidence: number; // 0-1

  // 컨텍스트
  context: {
    project: string;
    sessionId?: string;
    harvestId?: string;
    files?: string[];
    codeSnippet?: string;
  };

  // 메타데이터
  meta: {
    createdAt: string;
    updatedAt: string;
    status: InsightStatus;
    tags: string[];
    relatedInsights?: string[]; // 관련 인사이트 ID
  };

  // 활용 정보
  usage: {
    viewCount: number;
    appliedCount: number; // 실제 적용된 횟수
    convertedToLearn: boolean; // /learn으로 변환됨
    learnItemId?: string;
  };
}

// 인사이트 유형별 특화 데이터
export interface PatternInsight extends Insight {
  type: 'pattern';
  pattern: {
    description: string;
    example: string;
    antiPattern?: string; // 피해야 할 방식
    applicability: string[]; // 적용 가능한 상황
  };
}

export interface MistakeInsight extends Insight {
  type: 'mistake';
  mistake: {
    what: string; // 무엇을 잘못했는지
    why: string; // 왜 잘못됐는지
    how: string; // 어떻게 해결했는지
    prevention: string; // 어떻게 방지하는지
  };
}

export interface OptimizationInsight extends Insight {
  type: 'optimization';
  optimization: {
    before: string;
    after: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  };
}

export interface LearningInsight extends Insight {
  type: 'learning';
  learning: {
    topic: string;
    keyPoints: string[];
    resources?: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

// 인사이트 저장소 인덱스
export interface InsightIndex {
  totalInsights: number;
  lastUpdated: string;

  // 유형별 카운트
  byType: {
    pattern: number;
    mistake: number;
    optimization: number;
    learning: number;
  };

  // 프로젝트별 카운트
  byProject: {
    [project: string]: number;
  };

  // 태그별 카운트
  byTag: {
    [tag: string]: number;
  };
}

// 인사이트 검색 필터
export interface InsightFilter {
  type?: InsightType | InsightType[];
  status?: InsightStatus | InsightStatus[];
  project?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  minConfidence?: number;
}

// 인사이트 요약 (목록 표시용)
export interface InsightSummary {
  id: string;
  type: InsightType;
  title: string;
  confidence: number;
  project: string;
  createdAt: string;
  status: InsightStatus;
  tags: string[];
}
