// PricingComparisonSection.tsx
'use client';

import React from 'react';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Check, X } from 'lucide-react';

export type ComparisonFeature = {
  name: string;
  omnipanel: boolean | string;
  copilot: boolean | string;
  cursor: boolean | string;
  chatgpt: boolean | string;
};

export const comparisonFeatures: ComparisonFeature[] = [
  { name: 'Unlimited AI Usage', omnipanel: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Lifetime Access', omnipanel: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Works with VS Code', omnipanel: true, copilot: true, cursor: true, chatgpt: true },
  { name: 'No Data Harvesting', omnipanel: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Team Collaboration', omnipanel: 'Coming Soon', copilot: false, cursor: true, chatgpt: false },
  { name: 'Custom AI Models', omnipanel: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Self-Hosting', omnipanel: true, copilot: false, cursor: false, chatgpt: false },
  { name: 'Open Source', omnipanel: 'Partial', copilot: false, cursor: false, chatgpt: false },
  { name: '24/7 Support', omnipanel: true, copilot: false, cursor: false, chatgpt: false },
];

function renderCell(value: boolean | string) {
  if (typeof value === 'boolean') {
    return value ? <Check className="text-green-400 w-5 h-5 mx-auto" /> : <X className="text-red-400 w-5 h-5 mx-auto" />;
  }
  return <span className="text-yellow-400 font-semibold mx-auto">{value}</span>;
}

export default function PricingComparisonSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Feature Comparison</h2>
        <Table className="w-full border border-white/10 rounded-xl overflow-hidden text-sm">
          <TableHeader>
            <TableRow className="bg-gray-900/60">
              <TableCell className="text-left p-6 text-white font-bold">Features</TableCell>
              <TableCell className="text-center p-6">OmniPanel</TableCell>
              <TableCell className="text-center p-6">Copilot</TableCell>
              <TableCell className="text-center p-6">Cursor</TableCell>
              <TableCell className="text-center p-6">ChatGPT</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonFeatures.map((feature, idx) => (
              <TableRow key={feature.name} className={idx % 2 === 0 ? 'bg-gray-900/40' : ''}>
                <TableCell className="text-left p-6 text-white">{feature.name}</TableCell>
                <TableCell className="text-center p-6">{renderCell(feature.omnipanel)}</TableCell>
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
