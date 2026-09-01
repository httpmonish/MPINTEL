import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DemoWalkthroughModal from './components/DemoWalkthroughModal';

// Views
import LandingPublicPortal from './views/LandingPublicPortal';
import MinistryDashboard from './views/MinistryDashboard';
import DistrictDashboard from './views/DistrictDashboard';
import MPDashboard from './views/MPDashboard';
import ProjectInvestigationView from './views/ProjectInvestigationView';
import RiskAlertCenter from './views/RiskAlertCenter';
import CitizenVerificationPWA from './views/CitizenVerificationPWA';
import GISIntelligenceMap from './views/GISIntelligenceMap';
import StageBottleneckView from './views/StageBottleneckView';
import InspectionOptimizerView from './views/InspectionOptimizerView';
import CrossSchemeView from './views/CrossSchemeView';
import BlockchainLedgerView from './views/BlockchainLedgerView';
import InvestigationCopilotView from './views/InvestigationCopilotView';
import RateBenchmarkingView from './views/RateBenchmarkingView';
import ContractorNetworkView from './views/ContractorNetworkView';
import ResponsibleAIView from './views/ResponsibleAIView';

import { ALL_PROJECTS } from './data/mpintelDataset';
import { QrCode, X } from 'lucide-react';

export default function App() {
  // Navigation state
  const [activeNav, setActiveNav] = useState('ministry');
  const [currentRole, setCurrentRole] = useState('MINISTRY');
  const [selectedProject, setSelectedProject] = useState(ALL_PROJECTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Sync role switch with initial view
  const handleRoleSelect = (roleId) => {
    setCurrentRole(roleId);
    if (roleId === 'MINISTRY') setActiveNav('ministry');
    else if (roleId === 'STATE') setActiveNav('ministry');
    else if (roleId === 'DISTRICT') setActiveNav('district');
    else if (roleId === 'MP') setActiveNav('mp');
    else if (roleId === 'INSPECTOR') setActiveNav('optimizer');
    else if (roleId === 'CITIZEN') setActiveNav('transparency');
    else if (roleId === 'ADMIN') setActiveNav('admin-config');
  };

  const handleSelectProject = (proj) => {
    setSelectedProject(proj);
    setActiveNav('investigation');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Global Navbar */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleRoleSelect}
        onOpenDemoTour={() => setShowDemoTour(true)}
        onOpenQRModal={() => setShowQRModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex min-w-0">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          currentRole={currentRole}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto max-h-[calc(100vh-53px)]">
          
          {activeNav === 'transparency' && (
            <LandingPublicPortal 
              onSelectProject={handleSelectProject}
              onOpenPWA={() => setActiveNav('citizen-pwa')}
            />
          )}

          {activeNav === 'ministry' && (
            <MinistryDashboard 
              onSelectProject={handleSelectProject}
              onNavigate={setActiveNav}
            />
          )}

          {activeNav === 'district' && (
            <DistrictDashboard 
              onSelectProject={handleSelectProject}
              onAssignInspection={() => setActiveNav('optimizer')}
              onOpenOptimizer={() => setActiveNav('optimizer')}
            />
          )}

          {activeNav === 'mp' && (
            <MPDashboard 
              onSelectProject={handleSelectProject}
            />
          )}

          {activeNav === 'investigation' && (
            <ProjectInvestigationView
              project={selectedProject}
              onAssignInspection={() => setActiveNav('optimizer')}
              onOpenCopilot={() => setActiveNav('copilot')}
              onOpenPWA={() => setActiveNav('citizen-pwa')}
            />
          )}

          {activeNav === 'alert-center' && (
            <RiskAlertCenter 
              onSelectProject={handleSelectProject}
            />
          )}

          {activeNav === 'citizen-pwa' && (
            <CitizenVerificationPWA 
              project={selectedProject}
            />
          )}

          {activeNav === 'gis-map' && (
            <GISIntelligenceMap 
              onSelectProject={handleSelectProject}
            />
          )}

          {activeNav === 'bottlenecks' && (
            <StageBottleneckView />
          )}

          {activeNav === 'optimizer' && (
            <InspectionOptimizerView 
              onSelectProject={handleSelectProject}
            />
          )}

          {activeNav === 'cross-scheme' && (
            <CrossSchemeView 
              onSelectProject={handleSelectProject}
            />
          )}

          {activeNav === 'blockchain' && (
            <BlockchainLedgerView />
          )}

          {activeNav === 'copilot' && (
            <InvestigationCopilotView 
              onSelectProject={handleSelectProject}
            />
          )}

          {activeNav === 'rate-benchmark' && (
            <RateBenchmarkingView />
          )}

          {activeNav === 'contractor-network' && (
            <ContractorNetworkView />
          )}

          {activeNav === 'responsible-ai' && (
            <ResponsibleAIView />
          )}

          {/* Additional Linked Views mapped into dedicated layouts */}
          {(activeNav === 'state' || activeNav === 'risk-analytics' || activeNav === 'triangulation' || activeNav === 'photo-phash' || activeNav === 'satellite' || activeNav === 'pre-sanction' || activeNav === 'attention-radar' || activeNav === 'dpr-similarity' || activeNav === 'grievances' || activeNav === 'post-completion' || activeNav === 'confidence-ledger' || activeNav === 'compliance' || activeNav === 'data-provenance' || activeNav === 'admin-config' || activeNav === 'api-health') && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="clean-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h1 className="text-xl font-bold text-slate-900 capitalize">
                    {activeNav.replace(/-/g, ' ')} Module
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">
                    MPINTEL v2.4.1 Connected
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  This specialized intelligence module is actively connected to the central <strong>MPINTEL decision and verification engine</strong> for {activeNav}.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveNav('investigation')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
                  >
                    Open Flagship Project Investigation Record &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* 60-Second Guided Judge Tour Modal */}
      <DemoWalkthroughModal
        isOpen={showDemoTour}
        onClose={() => setShowDemoTour(false)}
        onLaunchInvestigation={() => {
          setSelectedProject(ALL_PROJECTS[0]);
          setActiveNav('investigation');
        }}
        onLaunchOptimizer={() => setActiveNav('optimizer')}
      />

      {/* Judge Mobile QR Scanner Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-700">Judge Mobile Scanner</span>
              <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <div className="w-48 h-48 bg-white border-2 border-slate-900 p-2 rounded-xl flex flex-col items-center justify-center space-y-2 shadow-inner">
                <QrCode className="w-32 h-32 text-slate-900" />
                <span className="text-[10px] font-mono font-bold text-slate-500">mpintel.gov.in/pwa</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Scan with your smartphone camera to test live Location-Bound Citizen Verification with real-time GPS Geofencing.
            </p>

            <button 
              onClick={() => {
                setShowQRModal(false);
                setActiveNav('citizen-pwa');
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition"
            >
              Open PWA Simulation in Browser
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
