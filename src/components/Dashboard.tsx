import { useState } from 'react';
import { ApiService } from '../services/api';
import { ManifestForm } from './ManifestForm';
import { DocumentUpload } from './DocumentUpload';
import { ManifestReview } from './ManifestReview';
import { useToast } from '../hooks/useToast';

export function Dashboard() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'form' | 'review'>('upload');
  const [manifestData, setManifestData] = useState<any>(null);
  const [parsedDocument, setParsedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleDocumentUpload = async (file: File, manifestType: string, borderCrossing: string, crossingTime: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('manifestType', manifestType);
      formData.append('borderCrossing', borderCrossing);
      formData.append('crossingTime', crossingTime);

      const response = await ApiService.uploadDocument(formData);
      setParsedDocument(response);
      setCurrentStep('form');
      showToast('Document successfully parsed', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to parse document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManifestFormComplete = (data: any) => {
    setManifestData(data);
    setCurrentStep('review');
  };

  const handleManifestSubmit = async () => {
    setLoading(true);
    try {
      // First submit to your backend
      const manifestResponse = await ApiService.submitManifest(manifestData);
      
      // Then send to BorderConnect
      const borderConnectResponse = await ApiService.sendToBorderConnect(manifestResponse);
      
      showToast('Manifest successfully submitted', 'success');
      setCurrentStep('upload');
      setManifestData(null);
      setParsedDocument(null);
    } catch (error) {
      console.error('Submission error:', error);
      showToast('Failed to submit manifest', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        )}

        {currentStep === 'upload' && (
          <DocumentUpload 
            onUpload={handleDocumentUpload}
            disabled={loading}
          />
        )}
        
        {currentStep === 'form' && (
          <ManifestForm 
            parsedData={parsedDocument}
            onComplete={handleManifestFormComplete}
            disabled={loading}
          />
        )}
        
        {currentStep === 'review' && (
          <ManifestReview 
            data={manifestData}
            onSubmit={handleManifestSubmit}
            onEdit={() => setCurrentStep('form')}
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
}