import React from 'react';

interface ModificationModalProps {
  editMode: 'refine' | 'regenerate';
  editPrompt: string;
  isProcessing: boolean;
  maxLength: number;
  onPromptChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const ModificationModal: React.FC<ModificationModalProps> = ({
  editMode,
  editPrompt,
  isProcessing,
  maxLength,
  onPromptChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-dim p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
        <h3 className="text-xl font-bold text-main mb-2 font-serif">
          {editMode === 'refine' ? 'Reshape Sigil' : 'Regenerate Sigil'}
        </h3>
        <p className="text-muted text-sm mb-2">
          {editMode === 'refine' 
            ? 'Describe how the current Mantle should be altered.' 
            : 'Feedback for the new iteration (optional). Leave empty for a fresh attempt.'}
        </p>
        <div className="text-xs text-muted mb-2 text-right">
          {editPrompt.length}/{maxLength}
        </div>
        
        <textarea 
          value={editPrompt}
          onChange={(e) => e.target.value.length <= maxLength && onPromptChange(e.target.value)}
          placeholder={editMode === 'refine' ? "E.g., Make it blue, add a crown..." : "E.g., Make it more abstract, less detailed..."}
          maxLength={maxLength}
          className="w-full bg-page border border-dim rounded-lg p-3 text-main placeholder-muted focus:ring-2 focus:ring-accent outline-none resize-none h-32 mb-6"
          autoFocus
        />
        
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-2 rounded-lg border border-dim text-muted hover:bg-page transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={onSubmit}
            disabled={isProcessing || (editMode === 'refine' && !editPrompt.trim())}
            className="flex-1 py-2 rounded-lg bg-accent text-on-accent hover:opacity-90 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Weaving...
              </>
            ) : (
              editMode === 'refine' ? 'Reshape' : 'Regenerate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModificationModal;
