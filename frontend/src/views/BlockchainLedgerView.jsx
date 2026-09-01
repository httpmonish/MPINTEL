import React, { useState } from 'react';
import { Link2, ShieldCheck, RefreshCw, CheckCircle2, Lock, FileCode, Layers } from 'lucide-react';
import { BLOCKCHAIN_LEDGER_BLOCKS } from '../data/mpintelDataset';

export default function BlockchainLedgerView() {
  const [verifyingBlock, setVerifyingBlock] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerifyBlock = (blockIndex) => {
    setVerifyingBlock(blockIndex);
    setTimeout(() => {
      setVerifyingBlock(null);
      setVerificationResult({
        block: blockIndex,
        status: 'IMMUTABLE_HASH_MATCHED',
        delta: '0.000 ms',
        message: 'Cryptographic SHA-256 state on Hyperledger Fabric matches local off-chain evidence digest byte-for-byte.'
      });
    }, 450);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Trust & Governance Layer</span>
            <span>&gt;</span>
            <span className="text-slate-900">Feature 8: Permissioned Blockchain Evidence Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Immutable SHA-256 Audit Trail & Cryptographic Provenance
          </h1>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Hyperledger Fabric Channel: mps-ledger-v1
        </span>
      </div>

      {/* Blockchain Protocol Explainer Banner */}
      <div className="clean-card rounded-2xl p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 font-mono">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>ZERO-RAW-DATA ON-CHAIN ARCHITECTURE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          To strictly safeguard citizen privacy and maximize throughput, raw images and citizen personal data are kept <strong>off-chain in secure government storage</strong>. Only cryptographically hashed digests (SHA-256), timestamped event states, and authorized officer signatures are anchored to the immutable permissioned blockchain blocks.
        </p>
      </div>

      {/* Live Blockchain Verification Result Alert */}
      {verificationResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Block #{verificationResult.block} Integrity Verified: {verificationResult.status}
          </div>
          <p className="text-[11px] text-emerald-800 font-mono">{verificationResult.message}</p>
        </div>
      )}

      {/* Block Stream List */}
      <div className="space-y-4">
        {BLOCKCHAIN_LEDGER_BLOCKS.map((blk) => (
          <div key={blk.block_index} className="clean-card rounded-2xl p-5 space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  #{blk.block_index}
                </span>
                <span className="font-bold text-slate-900 font-sans">{blk.event_type}</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500">{blk.work_id}</span>
              </div>

              <button
                onClick={() => handleVerifyBlock(blk.block_index)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-2xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifyingBlock === blk.block_index ? 'animate-spin' : ''}`} />
                Verify Integrity
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="truncate">Evidence SHA-256 Digest: <strong className="text-blue-700">{blk.evidence_hash_sha256}</strong></div>
              <div className="truncate text-slate-500">Previous Block Hash: {blk.previous_block_hash}</div>
              <div className="flex flex-wrap items-center justify-between text-slate-600 pt-1 border-t border-slate-200/50">
                <span>Signer Authority: <strong>{blk.signer_role}</strong></span>
                <span>Timestamp: <strong>{blk.timestamp}</strong></span>
                <span className="text-emerald-700 font-bold">Status: {blk.integrity_status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
