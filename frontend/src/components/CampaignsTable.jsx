import React from 'react';
import { ArrowUpRight, ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function CampaignsTable({ 
  onSelectCampaign, 
  projects = [] 
}) {
  // Preset demo campaigns matching Screenshot 1 & 3
  const demoCampaigns = [
    {
      id: 'stir',
      initial: 'S',
      title: 'Stir in strength (Infrastructure Sector 4)',
      work_id: 'HERO-MPLADS-2024-001',
      status: 'Active',
      days: 41,
      waitingCount: '22 creators',
      waitingDetail: '4 waiting over 5 days',
      liveCount: '49',
      liveDetail: '12 this week',
      avatarBg: 'bg-emerald-600 text-white',
      badgeColor: 'text-emerald-600',
      badgeDot: 'bg-emerald-500',
      riskScore: 88.5
    },
    {
      id: 'healthier',
      initial: 'H',
      title: 'Healthier every day (Primary Health Center Upgrade)',
      work_id: 'MPLADS-2024-KL-004',
      status: 'Active',
      days: 189,
      waitingCount: '4 creators',
      waitingDetail: 'all within 48h target',
      liveCount: '10',
      liveDetail: '2 this week',
      avatarBg: 'bg-rose-500 text-white',
      badgeColor: 'text-emerald-600',
      badgeDot: 'bg-emerald-500',
      riskScore: 28.1
    },
    {
      id: 'iron',
      initial: 'I',
      title: 'Iron boost Q3 (Rural Piped Drinking Water)',
      work_id: 'MPLADS-2024-PB-012',
      status: 'Review required',
      days: 14,
      waitingCount: '8 creators',
      waitingDetail: '1 waiting over 3 days',
      liveCount: '28',
      liveDetail: '5 this week',
      avatarBg: 'bg-blue-600 text-white',
      badgeColor: 'text-amber-600',
      badgeDot: 'bg-amber-500',
      riskScore: 58.6
    },
    {
      id: 'ambassador',
      initial: 'A',
      title: 'Ambassador program (Community Solar Center)',
      work_id: 'MPLADS-2024-MP-009',
      status: 'Active',
      days: 60,
      waitingCount: '15 creators',
      waitingDetail: '2 waiting over 4 days',
      liveCount: '34',
      liveDetail: '8 this week',
      avatarBg: 'bg-purple-600 text-white',
      badgeColor: 'text-emerald-600',
      badgeDot: 'bg-emerald-500',
      riskScore: 44.2
    }
  ];

  return (
    <div className="clean-card rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Campaigns that need you</h2>
        <span className="text-xs font-semibold text-slate-500">4 active campaigns</span>
      </div>

      {/* Table Structure matching Screenshot 1 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
              <th className="pb-3 font-semibold">Campaign</th>
              <th className="pb-3 font-semibold text-right sm:text-left">Waiting on you</th>
              <th className="pb-3 font-semibold text-right">Live posts</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {demoCampaigns.map((camp) => (
              <tr
                key={camp.id}
                onClick={() => {
                  const match = projects.find(p => p.work_id === camp.work_id) || {
                    work_id: camp.work_id,
                    work_title: camp.title,
                    state: 'Demo Region',
                    risk_score: camp.riskScore,
                    disbursed_amount_inr: 2500000
                  };
                  onSelectCampaign(match);
                }}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                {/* Campaign Info */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${camp.avatarBg} flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                      {camp.initial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-xs sm:max-w-md">
                        {camp.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${camp.badgeDot}`}></span>
                        <span>{camp.status} &bull; day {camp.days}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Waiting On You */}
                <td className="py-3.5 px-2 text-right sm:text-left whitespace-nowrap">
                  <div className="font-bold text-slate-900">{camp.waitingCount}</div>
                  <div className="text-[11px] text-slate-400">{camp.waitingDetail}</div>
                </td>

                {/* Live Posts */}
                <td className="py-3.5 pl-2 text-right whitespace-nowrap">
                  <div className="font-bold text-slate-900">{camp.liveCount}</div>
                  <div className="text-[11px] text-slate-400">{camp.liveDetail}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
