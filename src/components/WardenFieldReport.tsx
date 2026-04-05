import React, { useState } from 'react';
import { MapPin, BatteryWarning, AlertTriangle, CheckCircle, Send } from 'lucide-react';

export default function WardenFieldReport() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Field Report Synced to Command Center!");
    setStatus(null);
  };

  return (
    <div className="min-h-dvh w-full max-w-[100vw] overflow-x-hidden bg-slate-100 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 font-sans">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-blue-900 p-5 text-center text-white sm:p-6">
          <h2 className="text-2xl font-bold">Data Scout Entry</h2>
          <p className="text-blue-200 text-sm mt-1">Mobile Field Reporting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          {/* Location Select */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin size={16} /> Node Location
            </label>
            <select className="h-12 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-base text-slate-900">
              <option>SN-01 (Ngadda Bridge)</option>
              <option>SN-02 (Alau Dam)</option>
              <option>SN-03 (Customs Bridge)</option>
            </select>
          </div>

          {/* Status Buttons */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Hardware Status</label>
            <div className="grid grid-cols-1 gap-3">
              <button 
                type="button"
                onClick={() => setStatus('nominal')}
                className={`flex min-h-12 items-center gap-3 rounded-xl border-2 p-4 transition-all ${status === 'nominal' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                <CheckCircle className={status === 'nominal' ? 'text-green-600' : 'text-slate-400'} />
                <span className="font-medium text-slate-800">Node Nominal (Operational)</span>
              </button>

              <button 
                type="button"
                onClick={() => setStatus('battery')}
                className={`flex min-h-12 items-center gap-3 rounded-xl border-2 p-4 transition-all ${status === 'battery' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-300'}`}>
                <BatteryWarning className={status === 'battery' ? 'text-amber-600' : 'text-slate-400'} />
                <span className="font-medium text-slate-800">Battery Degraded/Swollen</span>
              </button>

              <button 
                type="button"
                onClick={() => setStatus('silt')}
                className={`flex min-h-12 items-center gap-3 rounded-xl border-2 p-4 transition-all ${status === 'silt' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-300'}`}>
                <AlertTriangle className={status === 'silt' ? 'text-red-600' : 'text-slate-400'} />
                <span className="font-medium text-slate-800">Sensor Fouled (Silt/Mud)</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!status}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300">
            <Send size={20} /> Submit Field Data
          </button>
        </form>
      </div>
    </div>
  );
}
