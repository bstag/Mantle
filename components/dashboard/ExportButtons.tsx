import React from 'react';

interface ExportButtonsProps {
  isZipping: boolean;
  onDownloadZip: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ isZipping, onDownloadZip }) => {
  return (
    <div id="export-btn-container" className="flex flex-col items-center gap-4 mb-8">
      <button
        onClick={onDownloadZip}
        disabled={isZipping}
        className="px-8 py-4 bg-accent text-on-accent rounded-lg font-bold text-lg shadow-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-3"
      >
        {isZipping ? (
          <>
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Vectorizing & Packaging...
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Complete Package
          </>
        )}
      </button>
      <p className="text-muted text-sm text-center max-w-md">
        Includes all logos in PNG + SVG, brand data, and CSS theme
      </p>
    </div>
  );
};

export default ExportButtons;
