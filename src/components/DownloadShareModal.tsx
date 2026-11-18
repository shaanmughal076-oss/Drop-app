import React, { useState } from 'react';
import {
  CampusMetrics,
  CampusZoneId,
  DropOrder,
  buildPublicShareLink,
  getApkAndPwaInstallSteps,
} from '../domain/campusData';
import { downloadDropWebsiteAsZip } from '../utils/downloadZipGenerator';
import { soundEngine } from '../utils/soundEffects';
import { copyTextRobust, usePWAInstall } from '../utils/usePWAInstall';

export interface DownloadShareModalProps {
  isOpen: boolean;
  activeZone: CampusZoneId;
  orders: DropOrder[];
  metrics: CampusMetrics;
  onClose: () => void;
}

export const DownloadShareModal: React.FC<DownloadShareModalProps> = ({
  isOpen,
  activeZone,
  orders,
  metrics,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showInstallSteps, setShowInstallSteps] = useState<boolean>(true);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
  const [copiedMode, setCopiedMode] = useState<
    'link' | 'whatsapp' | 'instagram' | null
  >(null);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined' ? window.location.origin : undefined;
  const sharePackage = buildPublicShareLink(origin, activeZone);
  const apkGuide = getApkAndPwaInstallSteps();

  const handlePwaInstallClick = async () => {
    soundEngine.playDispatchChime();
    setShowInstallSteps(true);
    if (isInstalled) {
      setStatusMessage(
        'DROP Web App is already installed on your device! Open it directly from your Home Screen.',
      );
      return;
    }
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setStatusMessage(
          'DROP Web App installation started! Check your Home Screen.',
        );
        return;
      }
    }
    setStatusMessage(
      'APK Coming Soon - Abhi Web App Install Karo! Niche diye Step-by-Step guide se 2 second me Home Screen pe add karein.',
    );
  };

  const handleDownloadZipClick = async () => {
    soundEngine.playUiClick(640);
    setIsGeneratingZip(true);
    try {
      const res = await downloadDropWebsiteAsZip(orders, metrics);
      soundEngine.playDispatchChime();
      setStatusMessage(
        `Website ZIP Downloaded: ${res.filename} (${res.fileCount} files bundled)!`,
      );
    } catch {
      setStatusMessage('Failed to generate ZIP archive. Please try again.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleCopyShareLink = async () => {
    soundEngine.playUiClick(680);
    await copyTextRobust(sharePackage.shareUrl);
    setCopiedMode('link');
    setStatusMessage(
      `Complete Public Download URL Copied: ${sharePackage.shareUrl}`,
    );
  };

  const handleShareWhatsApp = async () => {
    soundEngine.playUiClick(700);
    await copyTextRobust(sharePackage.whatsappText);
    setCopiedMode('whatsapp');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Download DROP App — Joya, Amroha',
          text: sharePackage.whatsappText,
          url: sharePackage.shareUrl,
        });
      } catch {
        // User cancelled or share not permitted in iframe
      }
    }
    setStatusMessage(
      'WhatsApp Share Message & Full Download Link copied! Paste directly in WhatsApp.',
    );
  };

  const handleShareInstagram = async () => {
    soundEngine.playUiClick(720);
    await copyTextRobust(sharePackage.instagramCaption);
    setCopiedMode('instagram');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'DROP App — Joya, Amroha',
          text: sharePackage.instagramCaption,
          url: sharePackage.shareUrl,
        });
      } catch {
        // Ignore
      }
    }
    setStatusMessage(
      'Instagram Bio/Story Link & Caption copied! Paste directly on Instagram DM or Story.',
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-drop-modal-title"
      className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#0f172a] border border-slate-700 p-4 sm:p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800">
          <div>
            <div className="text-xs text-[#10b981] font-semibold">
              VENOM STONE COMPANY · OFFICIAL APP INSTALLER &amp; SHARE HUB
            </div>
            <h2
              id="download-drop-modal-title"
              className="font-brand text-lg sm:text-xl font-bold text-[#d49b27] mt-0.5"
            >
              Download &amp; Share DROP App (Joya, Amroha)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick(460);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Close
          </button>
        </div>

        {/* Dynamic Status Feedback Banner */}
        {statusMessage && (
          <div
            role="status"
            data-testid="download-status-banner"
            className="p-3 rounded-lg bg-emerald-950/90 border border-[#10b981] text-xs font-medium text-emerald-200 break-all"
          >
            {statusMessage}
          </div>
        )}

        {/* Full Un-Truncated Public Link Box & 1-Click "Copy Full Download Link" Button */}
        <div className="rounded-xl bg-slate-900/95 border border-[#10b981]/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-[#10b981]">
              COMPLETE PUBLIC APP LINK (NO TRUNCATION)
            </h3>
            <span className="text-[11px] text-slate-300">
              Mobile Chrome &amp; PWA Ready
            </span>
          </div>

          {/* Full visible URL without any ellipsis */}
          <div
            data-testid="full-public-url-display"
            className="p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-[#10b981] font-mono-tabular break-all select-all leading-relaxed"
          >
            {sharePackage.shareUrl}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-slate-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-md"
            >
              {copiedMode === 'link'
                ? 'Copied Full Download Link!'
                : 'Copy Full Download Link'}
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3.5 rounded-lg bg-[#15803d] hover:bg-[#16a34a] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedMode === 'whatsapp'
                ? 'WhatsApp Invite Copied!'
                : 'Share on WhatsApp'}
            </button>
            <button
              type="button"
              onClick={handleShareInstagram}
              className="py-2.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedMode === 'instagram'
                ? 'Instagram Link Copied!'
                : 'Share on Instagram'}
            </button>
          </div>
        </div>

        {/* 3 Primary Download & Share Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Download as APK / Install App (PWA install) */}
          <button
            type="button"
            onClick={handlePwaInstallClick}
            className="flex flex-col justify-between text-left p-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-[#10b981]/60 transition-colors cursor-pointer group"
          >
            <div>
              <div className="text-xs font-semibold text-[#10b981]">
                OPTION 01 · MOBILE &amp; DESKTOP
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Download as APK / Install App
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Install DROP Web App (PWA) directly on your Home Screen like a
                native APK.
              </p>
            </div>
            <div className="mt-3 w-full py-2 px-3 rounded-lg bg-[#10b981] group-hover:bg-[#34d399] text-slate-950 text-xs font-bold text-center whitespace-nowrap">
              {isInstalled
                ? 'App Installed'
                : isInstallable
                  ? 'Install App Now'
                  : 'Install Web App (PWA)'}
            </div>
          </button>

          {/* Option 2: Download Website as ZIP */}
          <button
            type="button"
            onClick={handleDownloadZipClick}
            disabled={isGeneratingZip}
            className="flex flex-col justify-between text-left p-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-[#d49b27]/60 transition-colors cursor-pointer group disabled:opacity-60"
          >
            <div>
              <div className="text-xs font-semibold text-[#d49b27]">
                OPTION 02 · OFFLINE PACKAGE
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Download Website as ZIP
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Download standalone HTML, PWA manifest, and 3D Campus blueprint
                archive (.zip).
              </p>
            </div>
            <div className="mt-3 w-full py-2 px-3 rounded-lg bg-[#d49b27] group-hover:bg-[#fbbf24] text-slate-950 text-xs font-bold text-center whitespace-nowrap">
              {isGeneratingZip ? 'Bundling ZIP...' : 'Download Website ZIP'}
            </div>
          </button>

          {/* Option 3: Copy Share Link */}
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="flex flex-col justify-between text-left p-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer group"
          >
            <div>
              <div className="text-xs font-semibold text-slate-300">
                OPTION 03 · PUBLIC LINK
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Copy Share Link
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Generate &amp; copy public shareable download link for WhatsApp
                and Instagram.
              </p>
            </div>
            <div className="mt-3 w-full py-2 px-3 rounded-lg bg-slate-800 group-hover:bg-slate-700 text-white text-xs font-bold text-center whitespace-nowrap border border-slate-600">
              {copiedMode === 'link' ? 'Link Copied!' : 'Copy Share Link'}
            </div>
          </button>
        </div>

        {/* Clear APK Status & Step-by-Step PWA Installation Guide */}
        {showInstallSteps && (
          <div className="rounded-xl bg-slate-900/95 border border-slate-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#d49b27]">
                {apkGuide.noticeHeadline}
              </h3>
              <span className="text-xs text-[#10b981] font-mono-tabular">
                PWA v2.4 · Offline Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {apkGuide.noticeSubtext}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-xs font-semibold text-[#10b981] mb-1.5">
                  Android / Chrome Install Steps (APK Style)
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {apkGuide.androidSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-xs font-semibold text-[#d49b27] mb-1.5">
                  iPhone / iPad Safari Install Steps {isIOS ? '(Detected)' : ''}
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {apkGuide.iosSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
