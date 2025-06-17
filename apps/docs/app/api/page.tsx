// apps/docs/app/api/page.tsx
// API Reference page with proper React context and server-side rendering

'use client';

import React from 'react';

export default function APIPage(): React.JSX.Element {
  return (
    <div className="prose prose-lg max-w-4xl mx-auto py-8 px-6">
      <h1>API Reference</h1>

      <p>
        The OmniPanel API provides programmatic access to all core features including chat, code execution, file management, and more. Build powerful integrations and automate your AI workflows.
      </p>

      <h2>Authentication</h2>

      <p>
        All API requests require authentication using an API key. You can generate API keys from your OmniPanel dashboard.
      </p>

      <h3>API Key Authentication</h3>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`const omnipanel = new OmniPanelClient({
  apiKey: 'op_live_...',
  baseUrl: 'https://api.omnipanel.cipher-intelligence.com'
});`}</code>
      </pre>

      <h3>HTTP Headers</h3>

      <p>Include your API key in the <code>Authorization</code> header:</p>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`curl -H "Authorization: Bearer op_live_..." \\
     -H "Content-Type: application/json" \\
     https://api.omnipanel.cipher-intelligence.com/v1/chat/completions`}</code>
      </pre>

      <h2>Base URL</h2>

      <p>All API requests should be made to:</p>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>https://api.omnipanel.cipher-intelligence.com/v1</code>
      </pre>

      <p>For self-hosted instances, replace with your instance URL.</p>

      <h2>Chat API</h2>

      <h3>Create Chat Completion</h3>

      <p>Send messages to AI models and receive responses.</p>

      <p><strong>POST</strong> <code>/chat/completions</code></p>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`const response = await omnipanel.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Hello, how can you help me?' }
  ],
  max_tokens: 1000,
  temperature: 0.7
});`}</code>
      </pre>

      <h4>Request Body</h4>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold">Parameter</th>
              <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold">Type</th>
              <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold">Required</th>
              <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"><code>model</code></td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">string</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">The AI model to use (e.g., &apos;gpt-4&apos;, &apos;claude-3&apos;, &apos;llama2&apos;)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"><code>messages</code></td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">array</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Yes</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Array of message objects</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"><code>max_tokens</code></td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">number</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Maximum tokens in response (default: 1000)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"><code>temperature</code></td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">number</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Sampling temperature 0-1 (default: 0.7)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"><code>stream</code></td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">boolean</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">No</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Enable streaming responses (default: false)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Response</h4>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`{
  "id": "chat-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm here to help you with coding, analysis, and creative tasks."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}`}</code>
      </pre>

      <h2>Code API</h2>

      <h3>Execute Code</h3>

      <p>Run code in a secure sandbox environment.</p>

      <p><strong>POST</strong> <code>/code/execute</code></p>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`const result = await omnipanel.code.execute({
  language: 'python',
  code: \`
print("Hello, World!")
import pandas as pd
df = pd.DataFrame({'x': [1, 2, 3], 'y': [4, 5, 6]})
print(df.head())
  \`,
  timeout: 30
});`}</code>
      </pre>

      <p>
        This comprehensive API reference provides everything you need to integrate OmniPanel into your applications. 
        For more detailed examples and interactive documentation, visit our{' '}
        <a href="/api/playground" className="text-blue-600 hover:text-blue-700 underline">
          API Playground
        </a>.
      </p>
    </div>
  );
} 