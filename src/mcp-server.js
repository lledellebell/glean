#!/usr/bin/env node

/**
 * Glean MCP Server
 * MCP 프로토콜을 통해 Glean 기능을 다른 클라이언트에서 사용할 수 있게 해요
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import {
  findSimilarPatterns,
  formatSimilarPatterns
} from '../lib/pattern-matcher.js';

import {
  saveDailyLearning,
  getTodayLearnings,
  getRecentLearnings,
  getDailyStats
} from '../lib/daily-learning.js';

import {
  getRelevantLearnings,
  formatContextReview
} from '../lib/context-retriever.js';

import {
  getNextFlashcard,
  getDueFlashcards,
  formatFlashcardDisplay,
  getFlashcardStats
} from '../lib/flashcard-generator.js';

import {
  getGrowthData,
  formatGrowthDisplay,
  getQuickStats
} from '../lib/growth-visualizer.js';

import LearnStore from '../lib/learn-store.js';

const server = new Server(
  {
    name: 'glean',
    version: '0.2.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// 도구 목록 정의
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'glean_find_similar',
        description: 'Find similar error patterns from past sessions and show solutions',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Error message or pattern to search for'
            },
            threshold: {
              type: 'number',
              description: 'Minimum similarity threshold (0-1, default: 0.3)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 5)'
            }
          },
          required: ['pattern']
        }
      },
      {
        name: 'glean_save_learning',
        description: 'Save a daily learning or insight',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The learning content to save'
            },
            project: {
              type: 'string',
              description: 'Project name (optional)'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization (optional)'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'glean_get_today',
        description: 'Get all learnings saved today',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'glean_get_recent',
        description: 'Get recent learnings from the past N days',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to look back (default: 7)'
            }
          }
        }
      },
      {
        name: 'glean_get_context',
        description: 'Get relevant past learnings for the current project and files',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description: 'Project name'
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of file paths being worked on'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 5)'
            }
          },
          required: ['project']
        }
      },
      {
        name: 'glean_flashcard',
        description: 'Get the next flashcard for review',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Filter by topic (optional)'
            },
            showAnswer: {
              type: 'boolean',
              description: 'Whether to show the answer (default: false)'
            }
          }
        }
      },
      {
        name: 'glean_complete_review',
        description: 'Complete a flashcard review with confidence rating',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Learning item ID'
            },
            confidence: {
              type: 'number',
              description: 'Confidence rating (1-5)'
            }
          },
          required: ['id', 'confidence']
        }
      },
      {
        name: 'glean_growth',
        description: 'Get learning growth statistics and visualization',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year'],
              description: 'Time period (default: month)'
            },
            format: {
              type: 'string',
              enum: ['full', 'quick', 'json'],
              description: 'Output format (default: full)'
            }
          }
        }
      },
      {
        name: 'glean_stats',
        description: 'Get overall Glean statistics',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// 도구 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'glean_find_similar': {
        const matches = findSimilarPatterns(args.pattern, {
          threshold: args.threshold || 0.3,
          limit: args.limit || 5
        });

        if (matches.length === 0) {
          return {
            content: [{ type: 'text', text: 'No similar patterns found.' }]
          };
        }

        const formatted = formatSimilarPatterns(matches);
        return {
          content: [{ type: 'text', text: formatted }]
        };
      }

      case 'glean_save_learning': {
        const result = saveDailyLearning(args.content, {
          project: args.project,
          tags: args.tags
        });

        return {
          content: [{
            type: 'text',
            text: `Saved learning: "${args.content.substring(0, 50)}..." (ID: ${result.id})`
          }]
        };
      }

      case 'glean_get_today': {
        const learnings = getTodayLearnings();

        if (learnings.length === 0) {
          return {
            content: [{ type: 'text', text: 'No learnings saved today.' }]
          };
        }

        const text = learnings.map((l, i) => `${i + 1}. ${l.content}`).join('\n');
        return {
          content: [{ type: 'text', text: `Today's learnings (${learnings.length}):\n${text}` }]
        };
      }

      case 'glean_get_recent': {
        const days = args.days || 7;
        const learnings = getRecentLearnings(days);

        if (learnings.length === 0) {
          return {
            content: [{ type: 'text', text: `No learnings in the past ${days} days.` }]
          };
        }

        const text = learnings.slice(0, 10).map((l, i) =>
          `${i + 1}. [${l.date}] ${l.content}`
        ).join('\n');

        return {
          content: [{
            type: 'text',
            text: `Recent learnings (${learnings.length} total, showing 10):\n${text}`
          }]
        };
      }

      case 'glean_get_context': {
        const relevant = getRelevantLearnings(
          args.project,
          args.files || [],
          { limit: args.limit || 5 }
        );

        if (relevant.length === 0) {
          return {
            content: [{ type: 'text', text: 'No relevant learnings found for this context.' }]
          };
        }

        const formatted = formatContextReview(relevant);
        return {
          content: [{ type: 'text', text: formatted }]
        };
      }

      case 'glean_flashcard': {
        const card = getNextFlashcard({ topic: args.topic });

        if (!card) {
          return {
            content: [{ type: 'text', text: 'No flashcards due for review.' }]
          };
        }

        const formatted = formatFlashcardDisplay(card, args.showAnswer || false);
        return {
          content: [{
            type: 'text',
            text: formatted + `\n\nCard ID: ${card.id}`
          }]
        };
      }

      case 'glean_complete_review': {
        const result = LearnStore.completeReview(args.id, args.confidence);

        if (!result) {
          return {
            content: [{ type: 'text', text: `Learning item not found: ${args.id}` }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: `Review completed! Next review: ${result.spaceRep.nextReview}`
          }]
        };
      }

      case 'glean_growth': {
        const period = args.period || 'month';
        const format = args.format || 'full';

        if (format === 'quick') {
          const quick = getQuickStats();
          return {
            content: [{
              type: 'text',
              text: `Growth Summary:\n- Total: ${quick.totalKnowledge}\n- This week: +${quick.weeklyNew}\n- Mastery: ${quick.masteryRate}%\n- Streak: ${quick.streak} days`
            }]
          };
        }

        if (format === 'json') {
          const data = getGrowthData(period);
          return {
            content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
          };
        }

        const data = getGrowthData(period);
        const formatted = formatGrowthDisplay(data);
        return {
          content: [{ type: 'text', text: formatted }]
        };
      }

      case 'glean_stats': {
        const flashcardStats = getFlashcardStats();
        const dailyStats = getDailyStats(30);
        const learnStats = LearnStore.getStats();

        const text = [
          'Glean Statistics',
          '================',
          '',
          'Learning Items:',
          `  Total: ${learnStats.total}`,
          `  Due today: ${learnStats.dueToday}`,
          `  Mastered: ${learnStats.mastered}`,
          `  Current streak: ${learnStats.currentStreak} days`,
          '',
          'Daily Learnings (30 days):',
          `  Total: ${dailyStats.total}`,
          `  Average per day: ${dailyStats.averagePerDay}`,
          '',
          'Flashcards:',
          `  Total: ${flashcardStats.total}`,
          `  Due today: ${flashcardStats.dueToday}`
        ].join('\n');

        return {
          content: [{ type: 'text', text }]
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
