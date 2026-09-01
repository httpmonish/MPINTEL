import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Share2, 
  SlidersHorizontal, 
  Check, 
  Clock, 
  Sparkles, 
  User, 
  Layers
} from 'lucide-react';

export default function CalendarScheduleView({ onOpenEvent }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDone, setShowDone] = useState(false);
  const [viewType, setViewType] = useState('week'); // 'week' | 'month' | 'day'
  const [searchQuery, setSearchQuery] = useState('');

  // Days of current week
  const days = [
    { name: 'Mon', date: '18', fullDate: 'May 18' },
    { name: 'Tue', date: '19', fullDate: 'May 19' },
    { name: 'Wed', date: '20', fullDate: 'May 20' },
    { name: 'Thu', date: '21', fullDate: 'May 21' },
    { name: 'Fri', date: '22', fullDate: 'May 22' },
    { name: 'Sat', date: '23', fullDate: 'May 23' },
  ];

  // Hours 8 AM to 3 PM / 6 PM
  const hours = [
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'
  ];

  // Events matching the calendar in Screenshot 2
  const calendarEvents = [
    {
      id: 'ev-1',
      title: 'Weekly kickoff & SLA Review',
      time: '8:30 AM',
      dayIndex: 0, // Mon
      startHour: 8.5,
      durationHours: 1.0,
      category: 'work',
      colorBg: '#f3e8ff', // Soft purple
      colorBorder: '#e9d5ff',
      colorText: '#6b21a8'
    },
    {
      id: 'ev-2',
      title: 'Fintech app wireframes / Bridge Audit',
      time: '10:00 AM',
      dayIndex: 0, // Mon
      startHour: 10.0,
      durationHours: 1.5,
      category: 'work',
      colorBg: '#ecfdf5', // Soft teal / mint
      colorBorder: '#a7f3d0',
      colorText: '#047857'
    },
    {
      id: 'ev-3',
      title: 'Invoice: Bihar Infrastructure Co.',
      time: '2:30 PM',
      dayIndex: 0, // Mon
      startHour: 14.5,
      durationHours: 1.0,
      category: 'admin',
      colorBg: '#fef9c3', // Soft yellow
      colorBorder: '#fde047',
      colorText: '#854d0e'
    },
    {
      id: 'ev-4',
      title: 'District call: John / Novi (Bihar IDA)',
      time: '9:00 AM',
      dayIndex: 1, // Tue
      startHour: 9.0,
      durationHours: 1.0,
      category: 'client',
      colorBg: '#ffe4e6', // Soft coral / pink
      colorBorder: '#fecdd3',
      colorText: '#9f1239'
    },
    {
      id: 'ev-5',
      title: 'Design review Fintech / GIS Pipeline',
      time: '12:00 PM',
      dayIndex: 1, // Tue
      startHour: 12.0,
      durationHours: 1.2,
      category: 'work',
      colorBg: '#e6fffa', // Soft cyan
      colorBorder: '#b2f5ea',
      colorText: '#234e52'
    },
    {
      id: 'ev-6',
      title: 'Deep work: Risk AI kit & ML Models',
      time: '9:00 AM',
      dayIndex: 2, // Wed
      startHour: 9.0,
      durationHours: 2.0,
      category: 'work',
      colorBg: '#e0f2fe', // Soft blue
      colorBorder: '#bae6fd',
      colorText: '#0369a1'
    },
    {
      id: 'ev-7',
      title: 'Lunch w/ District Planning Team',
      time: '12:30 PM',
      dayIndex: 2, // Wed
      startHour: 12.5,
      durationHours: 1.0,
      category: 'personal',
      colorBg: '#ffedd5', // Soft peach
      colorBorder: '#fed7aa',
      colorText: '#9a3412'
    },
    {
      id: 'ev-8',
      title: 'Figma session: SaaS dashboard UI',
      time: '8:30 AM',
      dayIndex: 3, // Thu
      startHour: 8.5,
      durationHours: 1.5,
      category: 'work',
      colorBg: '#ecfdf5', // Soft mint
      colorBorder: '#a7f3d0',
      colorText: '#065f46'
    },
    {
      id: 'ev-9',
      title: 'Feedback call: Orion / MoSPI Verification',
      time: '10:30 AM',
      dayIndex: 3, // Thu
      startHour: 10.5,
      durationHours: 1.2,
      category: 'client',
      colorBg: '#ffe4e6', // Soft pink
      colorBorder: '#fecdd3',
      colorText: '#9f1239'
    },
    {
      id: 'ev-10',
      title: 'Bookkeeping & Allocation Audit',
      time: '1:00 PM',
      dayIndex: 3, // Thu
      startHour: 13.0,
      durationHours: 1.0,
      category: 'admin',
      colorBg: '#fef3c7', // Soft amber
      colorBorder: '#fde68a',
      colorText: '#92400e'
    },
    {
      id: 'ev-11',
      title: 'Weekly review & Evidence Signoff',
      time: '8:30 AM',
      dayIndex: 4, // Fri
      startHour: 8.5,
      durationHours: 1.0,
      category: 'work',
      colorBg: '#f3e8ff', // Soft purple
      colorBorder: '#e9d5ff',
      colorText: '#6b21a8'
    },
    {
      id: 'ev-12',
      title: 'Handoff: Sector v1 & Inspection Plan',
      time: '10:30 AM',
      dayIndex: 4, // Fri
      startHour: 10.5,
      durationHours: 2.0,
      category: 'work',
      colorBg: '#e0f2fe', // Soft blue
      colorBorder: '#bae6fd',
      colorText: '#0369a1'
    }
  ];

  const filteredEvents = calendarEvents.filter(ev => {
    if (selectedFilter !== 'all' && ev.category !== selectedFilter) return false;
    if (searchQuery && !ev.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header matching Screenshot 2 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        {/* Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="cursor-pointer hover:text-slate-800">Tasks</span>
            <span>&gt;</span>
            <span className="text-slate-900 font-bold">Calendar</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-mono text-[11px] flex items-center gap-1 cursor-pointer hover:text-slate-900">
              officer@mpintel.gov.in
              <span className="text-[10px]">&or;</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Calendar</h2>
        </div>

        {/* Right Tools: Search AI, Avatars, Actions */}
        <div className="flex items-center gap-3">
          {/* Ask AI / Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ask AI or search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition w-48 sm:w-64"
            />
            <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              ⌘K
            </span>
          </div>

          {/* Team Avatars Cluster */}
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs">SN</div>
            <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs">JD</div>
            <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs">RK</div>
            <div className="w-7 h-7 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs">AP</div>
            <button className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 shadow-xs transition">
              +
            </button>
          </div>

          {/* Action Buttons */}
          <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-2xs">
            Manage
          </button>
          <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-2xs">
            <Share2 className="w-3 h-3 text-slate-500" />
            Share
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center justify-center transition shadow-2xs">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Date Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          {[
            { id: 'all', label: 'All events' },
            { id: 'client', label: 'Client work' },
            { id: 'personal', label: 'Personal' },
            { id: 'admin', label: 'Admin' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedFilter === tab.id 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Show Done Toggle & Search Switcher */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <div 
              onClick={() => setShowDone(!showDone)}
              className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                showDone ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-2xs"></div>
            </div>
            Show done
          </label>

          {/* Date Switcher */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 font-mono">
              18-24 May 2026
            </span>
            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Weekly Calendar Grid */}
      <div className="clean-card rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
        {/* Day Header Row */}
        <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-slate-200/80 bg-slate-50/50">
          <div className="p-3 text-[11px] font-mono text-slate-400 border-r border-slate-200/60 flex flex-col items-center justify-center">
            <span className="font-semibold">MAY</span>
            <span className="text-sm font-extrabold text-slate-800">18</span>
          </div>
          {days.map((d, idx) => (
            <div 
              key={d.name} 
              className={`p-3 text-center border-r border-slate-200/60 last:border-r-0 ${
                idx === 0 ? 'bg-slate-100/50' : ''
              }`}
            >
              <div className="text-xs font-bold text-slate-800">
                {d.name} <span className="font-mono text-slate-500">{d.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid Matrix */}
        <div className="relative grid grid-cols-[60px_repeat(6,1fr)] bg-white divide-y divide-slate-100">
          
          {/* Current Time Indicator Red Line (at 1:15 PM) */}
          <div 
            className="calendar-time-line"
            style={{ top: `${(13.25 - 8) * 60}px` }}
          ></div>

          {hours.map((hour, hIdx) => (
            <React.Fragment key={hour}>
              {/* Hour Label */}
              <div className="h-[60px] text-[11px] font-mono text-slate-400 flex items-start justify-center pt-1 border-r border-slate-200/60 select-none">
                {hour}
              </div>

              {/* 6 Day Columns for this hour */}
              {days.map((d, dIdx) => (
                <div 
                  key={d.name} 
                  className={`h-[60px] border-r border-slate-100/80 last:border-r-0 hover:bg-slate-50/40 transition-colors ${
                    dIdx === 0 ? 'bg-slate-50/20' : ''
                  }`}
                ></div>
              ))}
            </React.Fragment>
          ))}

          {/* Absolute Positioned Event Cards */}
          {filteredEvents.map((ev) => {
            const topPx = (ev.startHour - 8) * 60;
            const heightPx = ev.durationHours * 60;
            // Left offset calculation: column 0 is 60px wide, each day is 1/6th of remaining space
            const colWidthPct = 100 / 6;

            return (
              <div
                key={ev.id}
                onClick={() => onOpenEvent && onOpenEvent(ev)}
                className="absolute z-10 p-2 rounded-xl border transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md hover:scale-[1.01]"
                style={{
                  top: `${topPx}px`,
                  height: `${heightPx}px`,
                  left: `calc(60px + ${ev.dayIndex * colWidthPct}%)`,
                  width: `calc(${colWidthPct}% - 8px)`,
                  marginLeft: '4px',
                  backgroundColor: ev.colorBg,
                  borderColor: ev.colorBorder,
                  color: ev.colorText
                }}
              >
                <div className="font-bold text-xs line-clamp-2 leading-tight">
                  {ev.title}
                </div>
                <div className="text-[10px] font-mono opacity-80 mt-0.5 font-semibold">
                  {ev.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
