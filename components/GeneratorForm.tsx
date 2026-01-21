
import React, { useState } from 'react';
import { ImageSize } from '../types';

interface GeneratorFormProps {
  onGenerate: (mission: string, size: ImageSize) => void;
  isGenerating: boolean;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isGenerating }) => {
  const [mission, setMission] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const MAX_MISSION_LENGTH = 5000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mission.trim() && mission.length <= MAX_MISSION_LENGTH) {
      onGenerate(mission, size);
    }
  };

  const handleMissionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MISSION_LENGTH) {
      setMission(value);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-surface/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-dim transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 text-main text-center font-serif tracking-wide">Establish Your Authority</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="mission" className="block text-sm font-medium text-muted uppercase tracking-wider">
              Core Mission / Purpose
            </label>
            <span className="text-xs text-muted">
              {mission.length}/{MAX_MISSION_LENGTH}
            </span>
          </div>
          <textarea
            id="mission"
            rows={4}
            className="w-full bg-page border border-dim rounded-lg p-4 text-main placeholder-muted focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none shadow-inner"
            placeholder="Describe the entity you wish to clothe. E.g., A logistics firm requiring ironclad reliability, or a boutique seeking a summer refresh..."
            value={mission}
            onChange={handleMissionChange}
            disabled={isGenerating}
            maxLength={MAX_MISSION_LENGTH}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-muted mb-2 uppercase tracking-wider">
              Sigil Resolution (Nano Banana Pro)
            </label>
            <div className="flex bg-page p-1 rounded-lg border border-dim">
              {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  disabled={isGenerating}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    size === s
                      ? 'bg-accent text-on-accent shadow-sm'
                      : 'text-muted hover:text-main hover:bg-surface'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isGenerating || !mission.trim()}
            className={`w-full py-3 px-6 rounded-lg text-on-accent font-semibold shadow-lg transition-all flex items-center justify-center ${
              isGenerating || !mission.trim()
                ? 'bg-dim cursor-not-allowed opacity-50 text-muted'
                : 'bg-accent hover:opacity-90 transform hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Stitching Seasons...
              </>
            ) : (
              'Assume the Mantle'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneratorForm;
