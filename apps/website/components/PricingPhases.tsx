'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2 } from 'lucide-react';

export function PricingPhases(): React.JSX.Element {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Limited time Pre-Launch Special Founder Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Secure your lifetime license at the best price. Prices increase with each phase.
            All times are Central Time (US).
          </p>
        </motion.div>

        {/* Individual Pricing Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            <Users className="inline-block mr-3 text-primary" size={32} />
            Individual Pricing
          </h3>
          
          <div className="max-w-6xl mx-auto">
            <ul className="steps steps-horizontal w-full">
              <li className="step step-primary">
                <div className="text-center">
                  <div className="font-bold text-lg">Phase 0: Emergency Funding</div>
                  <div className="text-2xl font-bold text-primary">$99</div>
                  <div className="text-sm text-muted-foreground">Ends 06/28/2025</div>
                  {/* <div className="text-xs text-muted-foreground mt-1">Limited time launch funding</div> */}
                </div>
              </li>
              <li className="step step-primary">
                <div className="text-left lg:text-center">
                  <div className="font-bold text-lg">Phase 1: Early Believer</div>
                  <div className="text-2xl font-bold text-primary">$149</div>
                  <div className="text-sm text-muted-foreground">Ends 07/18/2025</div>
                  {/* <div className="text-xs text-muted-foreground mt-1">First 500 customers, 20 days</div> */}
                </div>
              </li>
              <li className="step">
                <div className="text-left lg:text-center">
                  <div className="font-bold text-lg">Phase 2: Pre-Launch</div>
                  <div className="text-2xl font-bold">$199</div>
                  <div className="text-sm text-muted-foreground">Ends 07/31/2025</div>
                  {/* <div className="text-xs text-muted-foreground mt-1">Next 500 customers, 11 days</div> */}
                </div>
              </li>
              <li className="step">
                <div className="text-left lg:text-center">
                  <div className="font-bold text-lg">Phase 3: Launch Window</div>
                  <div className="text-2xl font-bold">$249</div>
                  <div className="text-sm text-muted-foreground">Ends 08/30/2025</div>
                  {/* <div className="text-xs text-muted-foreground mt-1">Launch month only</div> */}
                </div>
              </li>
              <li className="step">
                <div className="text-left lg:text-center">
                  <div className="font-bold text-lg">Phase 4: Standard</div>
                  <div className="text-2xl font-bold">$499</div>
                  <div className="text-sm text-muted-foreground">08/31/2025+</div>
                  {/* <div className="text-xs text-muted-foreground mt-1">Ongoing post-launch</div> */}
                </div>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Enterprise Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            <Building2 className="inline-block mr-3 text-primary" size={32} />
            Enterprise Pricing Tiers
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="p-8 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-foreground mb-2">Team Security</h4>
                <p className="text-muted-foreground mb-6">5-25 seats</p>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Price</div>
                    <div className="text-3xl font-bold text-primary">$149/seat</div>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div>
                    <div className="text-sm text-muted-foreground">At Launch</div>
                    <div className="text-2xl font-bold text-foreground">$299/seat</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-foreground mb-2">Enterprise Plus</h4>
                <p className="text-muted-foreground mb-6">25+ seats</p>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Price</div>
                    <div className="text-3xl font-bold text-primary">$99/seat</div>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div>
                    <div className="text-sm text-muted-foreground">At Launch</div>
                    <div className="text-2xl font-bold text-foreground">$199/seat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>


      </div>
    </section>
  );
} 