import { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';

interface DocumentUploadProps {
  onUpload: (parsedData: any) => void;
  disabled?: boolean;
}

export function DocumentUpload({ onUpload, disabled }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [manifestType, setManifestType] = useState<'ACE' | 'ACI'>('ACE');
  const [borderCrossing, setBorderCrossing] = useState('');
  const [crossingTime, setCrossingTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF or Word document');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !borderCrossing || !crossingTime) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('manifestType', manifestType);
      formData.append('borderCrossing', borderCrossing);
      formData.append('crossingTime', crossingTime);

      const response = await ApiService.uploadDocument(formData);
      onUpload(response);
    } catch (error) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manifest Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manifest Type
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              className={`px-4 py-2 rounded ${
                manifestType === 'ACE' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setManifestType('ACE')}
              disabled={disabled}
            >
              ACE
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded ${
                manifestType === 'ACI' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setManifestType('ACI')}
              disabled={disabled}
            >
              ACI
            </button>
          </div>
        </div>

        {/* Border Crossing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Crossing
          </label>
          <input
            type="text"
            value={borderCrossing}
            onChange={(e) => setBorderCrossing(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={disabled}
            required
          />
        </div>

        {/* Crossing Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crossing Time
          </label>
          <input
            type="datetime-local"
            value={crossingTime}
            onChange={(e) => setCrossingTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={disabled}
            required
          />
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload a document
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  disabled={disabled}
                />
              </label>
            </div>
          </div>
          {file && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2" />
              {file.name}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={!file || disabled || loading}
        >
          {loading ? 'Processing...' : 'Upload and Process'}
        </button>
      </form>
    </div>
  );
} 