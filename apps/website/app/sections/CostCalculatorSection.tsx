// CostCalculatorSection.tsx
'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface CostCalculatorSectionProps {
  defaultTeamSize?: number;
}

export default function CostCalculatorSection({ defaultTeamSize = 10 }: CostCalculatorSectionProps) {
  const [teamSize, setTeamSize] = useState<number>(defaultTeamSize);
  return (
    <section className="py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-12">
            <Calculator className="w-16 h-16 text-neon-blue mx-auto mb-4" />
            <h3 className="text-4xl font-bold text-white mb-4">Calculate Your Savings</h3>
            <p className="text-xl text-gray-300">
              See how much you'll save compared to subscription-based competitors
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Calculator Input */}
            <div>
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Team Size</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-neon-blue w-16">{teamSize}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Team Size:</span>
                  <span className="text-white font-bold">{teamSize} developers</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Time Period:</span>
                  <span className="text-white font-bold">5 years</span>
                </div>
              </div>
            </div>
            {/* Cost Comparison */}
            <div className="space-y-6">
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <h4 className="text-lg font-bold text-red-400 mb-4">Competitor Stack (5 Years)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">GitHub Copilot:</span>
                    <span className="text-white">${(228 * teamSize * 5).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cursor Pro:</span>
                    <span className="text-white">${(240 * teamSize * 5).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Security Tools:</span>
                    <span className="text-white">${(180 * teamSize * 5).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-red-500/20 pt-2 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-red-400">Total Cost:</span>
                      <span className="text-red-400">${(648 * teamSize * 5).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <h4 className="text-lg font-bold text-green-400 mb-4">OmniPanel (5 Years)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">OmniPanel License:</span>
                    <span className="text-white">${(149 * teamSize).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">API Costs (optional):</span>
                    <span className="text-white">${(600 * teamSize).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-green-500/20 pt-2 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-green-400">Total Cost:</span>
                      <span className="text-green-400">${(149 * teamSize + 600 * teamSize).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
