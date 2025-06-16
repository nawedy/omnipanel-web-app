// apps/web/src/components/legal/PrivacyPolicy.tsx
// Comprehensive privacy policy component with GDPR compliance

'use client';

import React, { useState, useEffect } from 'react';
import { 
  PRIVACY_POLICY_DATA, 
  PRIVACY_POLICY_METADATA, 
  getPrivacySectionTitles,
  type PrivacySection 
} from '@/data/privacyPolicy';
import { 
  Shield, 
  Eye, 
  Lock, 
  Download, 
  Calendar, 
  Globe, 
  Mail,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PrivacyPolicyProps {
  showNavigation?: boolean;
  highlightSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export function PrivacyPolicy({ 
  showNavigation = true, 
  highlightSection,
  onSectionChange 
}: PrivacyPolicyProps) {
  const [activeSection, setActiveSection] = useState<string>(highlightSection || 'overview');
  const [acceptedSections, setAcceptedSections] = useState<Set<string>>(new Set());
  const [showComplianceInfo, setShowComplianceInfo] = useState(false);

  // Load accepted sections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('privacy-accepted-sections');
    if (saved) {
      try {
        const sections = JSON.parse(saved);
        setAcceptedSections(new Set(sections));
      } catch (error) {
        console.error('Failed to load accepted sections:', error);
      }
    }
  }, []);

  // Save accepted sections to localStorage
  const saveAcceptedSections = (sections: Set<string>) => {
    localStorage.setItem('privacy-accepted-sections', JSON.stringify([...sections]));
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    onSectionChange?.(sectionId);
    
    // Scroll to section
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAcceptSection = (sectionId: string) => {
    const newAccepted = new Set(acceptedSections);
    newAccepted.add(sectionId);
    setAcceptedSections(newAccepted);
    saveAcceptedSections(newAccepted);
  };

  const handleAcceptAll = () => {
    const allSections = new Set(PRIVACY_POLICY_DATA.map(section => section.id));
    setAcceptedSections(allSections);
    saveAcceptedSections(allSections);
  };

  const exportPrivacyData = () => {
    const exportData = {
      metadata: PRIVACY_POLICY_METADATA,
      acceptedSections: [...acceptedSections],
      exportDate: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnipanel-privacy-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = (content: string[]) => {
    return content.map((paragraph, index) => {
      if (paragraph === '') {
        return <br key={index} />;
      }
      
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h4 key={index} className="font-semibold text-foreground mt-4 mb-2">
            {paragraph.slice(2, -2)}
          </h4>
        );
      }
      
      if (paragraph.startsWith('•')) {
        return (
          <li key={index} className="ml-4 text-muted-foreground">
            {paragraph.slice(2)}
          </li>
        );
      }
      
      return (
        <p key={index} className="text-muted-foreground mb-3 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  const sectionTitles = getPrivacySectionTitles();
  const acceptedCount = acceptedSections.size;
  const totalSections = PRIVACY_POLICY_DATA.length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last updated: {PRIVACY_POLICY_METADATA.lastUpdated}
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Version {PRIVACY_POLICY_METADATA.version}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            GDPR Compliant
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            CCPA Compliant
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="font-medium">Privacy Acknowledgment</span>
            </div>
            <button
              onClick={() => setShowComplianceInfo(!showComplianceInfo)}
              className="text-sm text-primary hover:underline"
            >
              {showComplianceInfo ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Sections reviewed: {acceptedCount} of {totalSections}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportPrivacyData}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Export Data
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>

          {showComplianceInfo && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Your Rights</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Access your personal data</li>
                    <li>• Request data correction</li>
                    <li>• Request data deletion</li>
                    <li>• Data portability</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact</h4>
                  <div className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      privacy@omnipanel.dev
                    </div>
                    <div className="text-xs mt-1">Response within 30 days</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Navigation Sidebar */}
        {showNavigation && (
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-6">
              <h3 className="font-semibold mb-4">Contents</h3>
              <nav className="space-y-1">
                {sectionTitles.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <span>{section.title}</span>
                    <div className="flex items-center gap-1">
                      {acceptedSections.has(section.id) && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-12">
            {PRIVACY_POLICY_DATA.map((section: any) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-3">
                    {section.title}
                    {acceptedSections.has(section.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </h2>
                  
                  {!acceptedSections.has(section.id) && (
                    <button
                      onClick={() => handleAcceptSection(section.id)}
                      className="px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark as Read
                    </button>
                  )}
                </div>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {renderContent(section.content)}
                </div>

                {/* Special sections with additional features */}
                {section.id === 'contact' && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-2">Need Help?</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          For immediate assistance with privacy concerns or data requests, 
                          use our priority contact methods.
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href="mailto:privacy@omnipanel.dev"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Mail className="w-3 h-3" />
                            Email Privacy Team
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === 'ai-privacy' && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-2">AI Privacy Guarantee</h4>
                        <p className="text-sm text-muted-foreground">
                          Your code and conversations are never used to train AI models. 
                          Choose local models for complete privacy or review third-party 
                          provider policies for cloud AI services.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>This policy is effective as of {PRIVACY_POLICY_METADATA.effectiveDate}</p>
                <p>Next review scheduled: {PRIVACY_POLICY_METADATA.nextReview}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={exportPrivacyData}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export My Data
                </button>
                
                {acceptedCount < totalSections && (
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Accept All Sections
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 