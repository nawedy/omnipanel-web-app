import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mockData } from '../fixtures/mock-data';

// API endpoint handlers
export const handlers = [
  // Authentication endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: mockData.user,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  rest.post('/api/auth/refresh', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token'
      })
    );
  }),

  // User endpoints
  rest.get('/api/user/profile', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.user));
  }),

  rest.put('/api/user/profile', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.user));
  }),

  // Workspace endpoints
  rest.get('/api/workspaces', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockData.workspace]));
  }),

  rest.post('/api/workspaces', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockData.workspace));
  }),

  rest.get('/api/workspaces/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.status(200), ctx.json(mockData.workspace));
  }),

  rest.put('/api/workspaces/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.workspace));
  }),

  rest.delete('/api/workspaces/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Project endpoints
  rest.get('/api/workspaces/:workspaceId/projects', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockData.project]));
  }),

  rest.post('/api/workspaces/:workspaceId/projects', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockData.project));
  }),

  rest.get('/api/projects/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.project));
  }),

  rest.put('/api/projects/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.project));
  }),

  rest.delete('/api/projects/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Chat endpoints
  rest.get('/api/projects/:projectId/chats', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockData.chatSession]));
  }),

  rest.post('/api/projects/:projectId/chats', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockData.chatSession));
  }),

  rest.get('/api/chats/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.chatSession));
  }),

  rest.delete('/api/chats/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Message endpoints
  rest.get('/api/chats/:chatId/messages', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.messages));
  }),

  rest.post('/api/chats/:chatId/messages', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockData.messages[0]));
  }),

  // AI Chat completion endpoints
  rest.post('/api/chat/completions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'chatcmpl-test',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a mock AI response for testing.'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25
        }
      })
    );
  }),

  rest.post('/api/chat/completions/stream', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'text/event-stream'),
      ctx.body('data: {"choices":[{"delta":{"content":"Mock"}}]}\n\ndata: {"choices":[{"delta":{"content":" streaming"}}]}\n\ndata: {"choices":[{"delta":{"content":" response"}}]}\n\ndata: [DONE]\n\n')
    );
  }),

  // File endpoints
  rest.get('/api/projects/:projectId/files', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockData.file]));
  }),

  rest.post('/api/projects/:projectId/files', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockData.file));
  }),

  rest.get('/api/files/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.file));
  }),

  rest.put('/api/files/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.file));
  }),

  rest.delete('/api/files/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // LLM Provider endpoints
  rest.get('/api/llm/providers', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.providers));
  }),

  rest.get('/api/llm/models', (req, res, ctx) => {
    const provider = req.url.searchParams.get('provider');
    return res(ctx.status(200), ctx.json(mockData.models));
  }),

  rest.post('/api/llm/validate', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ valid: true }));
  }),

  // Theme endpoints
  rest.get('/api/themes', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockData.theme]));
  }),

  rest.post('/api/themes', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockData.theme));
  }),

  rest.get('/api/themes/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.theme));
  }),

  // Plugin endpoints
  rest.get('/api/plugins', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockData.plugin]));
  }),

  rest.post('/api/plugins', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockData.plugin));
  }),

  rest.get('/api/plugins/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.plugin));
  }),

  // Analytics endpoints
  rest.post('/api/analytics/events', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  rest.get('/api/analytics/stats', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData.analytics));
  }),

  // External API mocks
  rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'chatcmpl-openai-test',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Mock OpenAI response for testing.'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 12,
          completion_tokens: 8,
          total_tokens: 20
        }
      })
    );
  }),

  rest.post('https://api.anthropic.com/v1/messages', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'msg_anthropic_test',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Mock Anthropic response for testing.'
          }
        ],
        model: 'claude-3-sonnet-20240229',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 10,
          output_tokens: 8
        }
      })
    );
  }),

  // Fallback handler for unmatched requests
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({ error: 'Not found' })
    );
  })
];

// Create MSW server
export const server = setupServer(...handlers); 