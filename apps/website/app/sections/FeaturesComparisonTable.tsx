// FeaturesComparisonTable.tsx
'use client';

import React from 'react';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Check, X } from 'lucide-react';

export type ComparisonFeature = {
  name: string;
  omnipanelai: boolean | string;
  copilot: boolean | string;
  cursor: boolean | string;
  chatgpt: boolean | string;
};

export const comparisonFeatures: ComparisonFeature[] = [
  { name: 'Unlimited AI Usage', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Lifetime Access', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Works with VS Code', omnipanelai: true, copilot: true, cursor: true, chatgpt: true },
  { name: 'No Data Harvesting', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Team Collaboration', omnipanelai: 'Coming Soon', copilot: false, cursor: true, chatgpt: false },
  { name: 'Custom AI Models', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Self-Hosting', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Open Source', omnipanelai: 'Partial', copilot: false, cursor: false, chatgpt: false },
  { name: '24/7 Support', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'AI Security Scanning', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Privacy Protection', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Local AI Execution', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Code Editor Integration', omnipanelai: true, copilot: true, cursor: true, chatgpt: false },
  { name: 'Notebook Support', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Terminal Integration', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Multi-Provider AI', omnipanelai: '9 providers', copilot: 'OpenAI only', cursor: 'Limited', chatgpt: 'OpenAI only' },
  { name: 'Pricing Model', omnipanelai: 'One-time', copilot: 'Subscription', cursor: 'Subscription', chatgpt: 'Subscription' },
  { name: 'Data Harvesting', omnipanelai: false, copilot: true, cursor: true, chatgpt: true },
  { name: 'Air-Gap Deployment', omnipanelai: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Compliance Ready', omnipanelai: true, copilot: 'Limited', cursor: false, chatgpt: false },
  { name: 'Enterprise Team Features', omnipanelai: true, copilot: false, cursor: false, chatgpt: false }
];

function renderCell(value: boolean | string) {
  if (typeof value === 'boolean') {
    return value ? <Check className="text-green-400 w-5 h-5 mx-auto" /> : <X className="text-red-400 w-5 h-5 mx-auto" />;
  }
  return <span className="text-yellow-400 font-semibold mx-auto">{value}</span>;
}

export interface FeaturesComparisonTableProps {
  heading?: string;
  features?: ComparisonFeature[];
}

export default function FeaturesComparisonTable({
  heading = 'Feature Comparison',
  features = comparisonFeatures,
}: FeaturesComparisonTableProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">{heading}</h2>
        <Table className="w-full border border-white/10 rounded-xl overflow-hidden text-sm">
          <TableHeader>
            <TableRow className="bg-gray-900/60">
              <TableCell className="text-left p-6 text-white font-bold">Features</TableCell>
              <TableCell className="text-center p-6">OmniPanelAI</TableCell>
              <TableCell className="text-center p-6">Copilot</TableCell>
              <TableCell className="text-center p-6">Cursor</TableCell>
              <TableCell className="text-center p-6">ChatGPT</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, idx) => (
              <TableRow key={feature.name} className={idx % 2 === 0 ? 'bg-gray-900/40' : ''}>
                <TableCell className="text-left p-6 text-white">{feature.name}</TableCell>
                <TableCell className="text-center p-6">{renderCell(feature.omnipanelai)}</TableCell>
                <TableCell className="text-center p-6">{renderCell(feature.copilot)}</TableCell>
                <TableCell className="text-center p-6">{renderCell(feature.cursor)}</TableCell>
                <TableCell className="text-center p-6">{renderCell(feature.chatgpt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
