import React from 'react';

interface ExportButtonsProps {
  isExporting: boolean;
  isZipping: boolean;
  onExportPdf: () => void;
  onDownloadZip: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  isExporting,
  isZipping,
  onExportPdf,
  onDownloadZip,
}) => {
  return (
    <div id="export-btn-container" className="absolute top-8 right-8 z-10 flex gap-3">
      <button
        onClick={onExportPdf}
        disabled={isExporting || isZipping}
        className="flex items-center gap-2 bg-surface hover:bg-page text-muted hover:text-main px-4 py-2 rounded-lg border border-dim transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download PDF Guide"
      >
        {isExporting ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
        <span className="hidden sm:inline">{isExporting ? "PDF..." : "PDF Guide"}</span>
      </button>

      <button
        onClick={onDownloadZip}
        disabled={isExporting || isZipping}
        className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-lg border border-accent/20 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download All Assets (ZIP)"
      >
        {isZipping ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V3m0 0l-3 3m3-3l3 3m-6 8h6" />
          </svg>
        )}
        <span className="hidden sm:inline">{isZipping ? "Packaging..." : "Download Mantle"}</span>
      </button>
    </div>
  );
};

export default ExportButtons;
