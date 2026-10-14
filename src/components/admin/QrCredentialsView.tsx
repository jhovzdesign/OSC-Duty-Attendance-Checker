import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle, 
  Search, 
  Eye, 
  Share2, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { Personnel } from '../../types';

interface QrCredentialsViewProps {
  personnel: Personnel[];
}

export const QrCredentialsView: React.FC<QrCredentialsViewProps> = ({ personnel }) => {
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel>(personnel[0] || null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cardSide, setCardSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [batchMode, setBatchMode] = useState<boolean>(false);

  // Generate QR Code data URL when selected personnel changes
  useEffect(() => {
    if (!selectedPersonnel) return;

    // Cryptographic-like JSON payload verifying duty identity
    const payload = JSON.stringify({
      system: 'OSC-DAMTS',
      dutyId: selectedPersonnel.dutyId,
      name: selectedPersonnel.fullName,
      division: selectedPersonnel.division,
      clearance: selectedPersonnel.clearanceLevel,
      issued: new Date().getFullYear(),
      secToken: btoa(`${selectedPersonnel.dutyId}-OSC-2026`).substring(0, 16),
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [selectedPersonnel]);

  const filtered = personnel.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dutyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !selectedPersonnel) return;
    const link = document.createElement('a');
    link.download = `OSC_QR_${selectedPersonnel.dutyId}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            QR Credentials & Badges
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Generate, verify, and issue standardized digital ID credentials and printable institutional duty badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              batchMode
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{batchMode ? 'Single Card View' : 'Batch Print Mode'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Badges</span>
          </button>
        </div>
      </div>

      {batchMode ? (
        /* Batch Print Grid */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs no-print">
            <strong>Batch Print Mode:</strong> Standard CR80 badge manifest layout. Click "Print Official Badges" above or press Cmd/Ctrl+P to print.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div
                key={p.id}
                className="w-full aspect-[1.586/1] max-w-[380px] mx-auto bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-700 rounded-2xl p-4 shadow-xl flex flex-col justify-between text-white relative overflow-hidden"
              >
                {/* Institutional Top Band */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <img
                      src="/src/assets/images/osc_institutional_emblem_1791956358770.jpg"
                      alt="OSC Emblem"
                      className="w-7 h-7 rounded-full border border-blue-400/40 object-cover"
                    />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block text-white">
                        Office of Strategic Comms
                      </span>
                      <span className="text-[8px] font-mono text-blue-400 block">
                        OSC Duty Attendance System
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {p.clearanceLevel.replace('_', ' ')}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex items-center gap-3 my-2">
                  <img
                    src={p.avatarUrl}
                    alt={p.fullName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-600 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-blue-400 block">
                      {p.dutyId}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">
                      {p.fullName}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {p.rankDesignation}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate mt-0.5">
                      {p.division}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[8px] font-mono text-slate-400">
                  <span>VALID: 2026-2027</span>
                  <span className="text-emerald-400 font-semibold">VERIFIED DUTY BADGE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Single Card Customizer & Live Preview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Personnel Selector List (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 no-print flex flex-col h-[640px]">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search officer or Duty ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filtered.map(p => {
                const isSelected = selectedPersonnel?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonnel(p)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border border-blue-500/50 shadow-sm'
                        : 'bg-slate-950/40 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.fullName}
                      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {p.fullName}
                        </span>
                        <span className="text-[10px] font-mono text-blue-400">
                          {p.dutyId}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {p.rankDesignation}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Physical Badge & QR Inspector (8 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 border border-slate-800">
            {/* Front / Back Toggle Buttons */}
            <div className="flex items-center gap-2 mb-6 no-print">
              <button
                onClick={() => setCardSide('FRONT')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  cardSide === 'FRONT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Badge Front
              </button>
              <button
                onClick={() => setCardSide('BACK')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  cardSide === 'BACK'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Badge Reverse (QR Code)
              </button>
            </div>

            {selectedPersonnel && (
              <div className="w-full flex flex-col items-center">
                {/* Realistic CR80 Institutional ID Badge */}
                <div className="relative w-full max-w-[440px] aspect-[1.586/1] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/80 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col justify-between text-white overflow-hidden">
                  {/* Security microprint watermark lines */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />

                  {cardSide === 'FRONT' ? (
                    <>
                      {/* Badge Top Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800/90 relative z-10">
                        <div className="flex items-center gap-2.5">
                          <img
                            src="/src/assets/images/osc_institutional_emblem_1791956358770.jpg"
                            alt="OSC Seal"
                            className="w-10 h-10 rounded-full border border-blue-400/50 object-cover shadow-sm"
                          />
                          <div>
                            <span className="text-[11px] font-extrabold tracking-wider uppercase block text-white">
                              Office of Strategic Communications
                            </span>
                            <span className="text-[9px] font-mono text-blue-400 block font-semibold">
                              OSC Duty Attendance Management Tracking System
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 block">
                            {selectedPersonnel.clearanceLevel.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Badge Center Information */}
                      <div className="flex items-center gap-4 my-2 relative z-10">
                        <div className="relative">
                          <img
                            src={selectedPersonnel.avatarUrl}
                            alt={selectedPersonnel.fullName}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-600 shadow-md shrink-0"
                          />
                          <div className="absolute -bottom-1 -right-1 p-0.5 bg-blue-600 rounded-full text-white">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="text-xs font-mono font-bold text-blue-400">
                            {selectedPersonnel.dutyId}
                          </div>
                          <h3 className="text-base font-extrabold text-white tracking-tight truncate">
                            {selectedPersonnel.fullName}
                          </h3>
                          <p className="text-xs font-medium text-slate-300 truncate">
                            {selectedPersonnel.rankDesignation}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {selectedPersonnel.division}
                          </p>
                        </div>
                      </div>

                      {/* Badge Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 relative z-10 text-[9px] font-mono text-slate-400">
                        <div>
                          <span>DUTY STATION: </span>
                          <span className="text-slate-200 font-semibold">{selectedPersonnel.dutyStation}</span>
                        </div>
                        <div className="text-emerald-400 font-bold">
                          OFFICIAL CREDENTIAL
                        </div>
                      </div>
                    </>
                  ) : (
                    /* REVERSE SIDE: QR CODE & DIGITAL TOKEN */
                    <>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Machine-Readable Duty Verification Token
                        </span>
                        <span className="text-[10px] font-mono text-blue-400">
                          {selectedPersonnel.dutyId}
                        </span>
                      </div>

                      <div className="flex items-center justify-around my-2">
                        {qrDataUrl ? (
                          <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-300">
                            <img
                              src={qrDataUrl}
                              alt="Duty QR Code"
                              className="w-28 h-28 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-28 bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                            Generating...
                          </div>
                        )}

                        <div className="space-y-1 text-[10px] text-slate-400 max-w-[180px]">
                          <p className="font-semibold text-slate-200">
                            Instructions for Duty Officer:
                          </p>
                          <p>Present this encrypted QR code at any OSC terminal scanner upon entry and exit.</p>
                          <p className="text-[9px] text-slate-500">
                            Property of Office of Strategic Communications. Unauthorized reproduction strictly prohibited.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] font-mono text-slate-500">
                        <span>ENCRYPTED OSC-DAMTS PROTOCOL</span>
                        <span>ISSUED 2026</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Single Card Actions */}
                <div className="mt-6 flex items-center gap-3 no-print">
                  <button
                    onClick={handleDownloadQr}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Download QR Code PNG</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print This Officer's Badge</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
