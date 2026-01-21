import React, { useEffect, useState } from 'react';
import { fetchExampleIndex, ExampleBrand, loadExample, downloadExampleZip, LoadedExample } from '../../services/exampleService';

interface ExampleGalleryProps {
  onViewExample: (example: LoadedExample) => void;
}

const ExampleGallery: React.FC<ExampleGalleryProps> = ({ onViewExample }) => {
  const [examples, setExamples] = useState<ExampleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExampleIndex()
      .then((data) => {
        setExamples(data.examples);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load examples');
        setLoading(false);
        console.error(err);
      });
  }, []);

  const handleView = async (example: ExampleBrand) => {
    setLoadingId(example.id);
    try {
      const loaded = await loadExample(example.folder);
      onViewExample(loaded);
    } catch (err) {
      console.error('Failed to load example:', err);
      setError('Failed to load example');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownload = async (example: ExampleBrand) => {
    setDownloadingId(example.id);
    try {
      await downloadExampleZip(example.folder);
    } catch (err) {
      console.error('Failed to download example:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted">
        <p>{error}</p>
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p>No examples available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {examples.map((example) => (
        <div
          key={example.id}
          className="bg-surface border border-dim rounded-2xl p-6 hover:border-accent transition-colors duration-300"
        >
          <h3 className="text-xl font-bold font-serif text-main mb-2">{example.name}</h3>
          <p className="text-muted text-sm mb-6 leading-relaxed">{example.description}</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleView(example)}
              disabled={loadingId === example.id}
              className="flex-1 px-4 py-2 bg-accent text-on-accent rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loadingId === example.id ? 'Loading...' : 'Preview'}
            </button>
            <button
              onClick={() => handleDownload(example)}
              disabled={downloadingId === example.id}
              className="px-4 py-2 bg-surface border border-dim text-main rounded-lg font-medium text-sm hover:bg-page transition-colors disabled:opacity-50"
            >
              {downloadingId === example.id ? (
                <span className="animate-spin inline-block">↓</span>
              ) : (
                '↓ ZIP'
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExampleGallery;
