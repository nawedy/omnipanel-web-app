'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownTrayIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Platform {
  name: string;
  icon: React.ComponentType<any>;
  primary: boolean;
  downloads: {
    name: string;
    url: string;
    size: string;
    type: 'installer' | 'portable' | 'package';
  }[];
}

export default function DownloadPage() {
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  useEffect(() => {
    // Detect user platform
    const userAgent = navigator.userAgent.toLowerCase();
    let platform = '';
    
    if (userAgent.includes('mac')) platform = 'mac';
    else if (userAgent.includes('windows')) platform = 'windows'; 
    else if (userAgent.includes('linux')) platform = 'linux';
    else if (userAgent.includes('android')) platform = 'android';
    else if (userAgent.includes('iphone') || userAgent.includes('ipad')) platform = 'ios';
    else platform = 'web';

    setDetectedPlatform(platform);
    setSelectedPlatform(platform);
  }, []);

  const platforms: Record<string, Platform> = {
    windows: {
      name: 'Windows',
      icon: ComputerDesktopIcon,
      primary: true,
      downloads: [
        { name: 'Installer (Recommended)', url: '/downloads/OmniPanel-Setup-1.0.0.exe', size: '120 MB', type: 'installer' },
        { name: 'Portable', url: '/downloads/OmniPanel-1.0.0-win.zip', size: '140 MB', type: 'portable' }
      ]
    },
    mac: {
      name: 'macOS',
      icon: ComputerDesktopIcon,
      primary: true,
      downloads: [
        { name: 'Installer (Recommended)', url: '/downloads/OmniPanel-1.0.0.dmg', size: '130 MB', type: 'installer' },
        { name: 'Portable', url: '/downloads/OmniPanel-1.0.0-mac.zip', size: '150 MB', type: 'portable' }
      ]
    },
    linux: {
      name: 'Linux',
      icon: ComputerDesktopIcon,
      primary: true,
      downloads: [
        { name: 'AppImage (Universal)', url: '/downloads/OmniPanel-1.0.0.AppImage', size: '125 MB', type: 'package' },
        { name: 'Debian Package', url: '/downloads/omnipanel_1.0.0_amd64.deb', size: '110 MB', type: 'package' },
        { name: 'RPM Package', url: '/downloads/omnipanel-1.0.0.x86_64.rpm', size: '110 MB', type: 'package' }
      ]
    },
    android: {
      name: 'Android',
      icon: DevicePhoneMobileIcon,
      primary: true,
      downloads: [
        { name: 'APK (Direct Install)', url: '/downloads/OmniPanel-1.0.0.apk', size: '45 MB', type: 'package' }
      ]
    },
    ios: {
      name: 'iOS',
      icon: DevicePhoneMobileIcon,
      primary: true,
      downloads: [
        { name: 'TestFlight Beta', url: 'https://testflight.apple.com/join/omnipanel', size: '50 MB', type: 'package' }
      ]
    },
    web: {
      name: 'Web App',
      icon: GlobeAltIcon,
      primary: false,
      downloads: [
        { name: 'Launch Web App', url: '/workspace', size: 'Online', type: 'package' },
        { name: 'Install as PWA', url: '/workspace', size: 'Offline Capable', type: 'package' }
      ]
    }
  };

  const installationGuides = {
    windows: [
      'Download the installer or portable version',
      'Run the .exe file (click "More info" > "Run anyway" if Windows warns)',
      'Follow the installation wizard',
      'Launch OmniPanel from the Start menu or desktop shortcut'
    ],
    mac: [
      'Download the .dmg file',
      'Open the downloaded file',
      'Drag OmniPanel to your Applications folder',
      'If blocked, go to System Preferences > Security > "Open Anyway"'
    ],
    linux: [
      'Download your preferred package format',
      'For AppImage: chmod +x OmniPanel.AppImage && ./OmniPanel.AppImage',
      'For DEB: sudo dpkg -i omnipanel.deb',
      'For RPM: sudo rpm -i omnipanel.rpm'
    ],
    android: [
      'Enable "Unknown Sources" in Settings > Security',
      'Download the APK file',
      'Tap the downloaded file to install',
      'Accept security warnings for sideloading'
    ],
    ios: [
      'Join the TestFlight beta program',
      'Install TestFlight from the App Store if needed',
      'Follow the TestFlight invitation link',
      'Install OmniPanel through TestFlight'
    ],
    web: [
      'Open OmniPanel in your browser',
      'For PWA: Click "Add to Home Screen" or install prompt',
      'Works offline once installed',
      'Full feature parity with desktop apps'
    ]
  };

  const primaryPlatform = platforms[selectedPlatform];

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Download OmniPanel
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Get the ultimate AI workspace on all your devices
          </p>
          
          {detectedPlatform && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300">
                Detected: {platforms[detectedPlatform]?.name}
              </span>
            </div>
          )}
        </motion.div>

        {/* Primary Download */}
        {primaryPlatform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <primaryPlatform.icon className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {primaryPlatform.name}
                </h2>
                <p className="text-gray-400">
                  Recommended for your device
                </p>
              </div>
            </div>

            <div className="grid gap-4 mb-6">
              {primaryPlatform.downloads.map((download, index) => (
                <motion.a
                  key={index}
                  href={download.url}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ArrowDownTrayIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="text-white font-medium">
                        {download.name}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({download.size})
                      </span>
                    </div>
                  </div>
                  <div className="text-blue-400 text-sm">
                    Download
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Installation Guide */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                Installation Guide
              </h3>
              <ol className="text-gray-300 text-sm space-y-1">
                {installationGuides[selectedPlatform]?.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-blue-400 font-mono">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}

        {/* All Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            All Platforms
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(platforms).map(([key, platform]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-lg border transition-colors cursor-pointer ${
                  selectedPlatform === key
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedPlatform(key)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <platform.icon className="w-6 h-6 text-gray-300" />
                  <h3 className="text-white font-medium">
                    {platform.name}
                  </h3>
                </div>

                <div className="space-y-2">
                  {platform.downloads.map((download, index) => (
                    <a
                      key={index}
                      href={download.url}
                      className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {download.name} ({download.size})
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            System Requirements
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-white font-medium mb-3">Desktop</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• 4GB RAM minimum, 8GB recommended</li>
                <li>• 500MB available storage</li>
                <li>• Modern CPU (2015 or newer)</li>
                <li>• Internet connection for sync</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-3">Mobile</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Android 7.0+ or iOS 12.0+</li>
                <li>• 2GB RAM minimum</li>
                <li>• 200MB available storage</li>
                <li>• Internet connection for sync</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-3">Web</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Modern browser (Chrome, Firefox, Safari, Edge)</li>
                <li>• JavaScript enabled</li>
                <li>• Internet connection</li>
                <li>• 2GB RAM recommended</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Release Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            What's New in v1.0.0
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">🎉 Initial Release</h3>
              <ul className="text-gray-300 text-sm space-y-1 ml-4">
                <li>• Complete AI workspace with chat, code, notebook, terminal</li>
                <li>• Real-time sync across all devices</li>
                <li>• Support for 12+ AI models (OpenAI, Ollama, local/cloud)</li>
                <li>• Advanced theming system with marketplace</li>
                <li>• Plugin SDK with extensible architecture</li>
                <li>• Cross-platform support (Windows, macOS, Linux, iOS, Android)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 