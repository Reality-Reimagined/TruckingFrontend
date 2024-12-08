import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { supabase } from '../lib/supabase';
import { ManifestForm } from './ManifestForm';
import { DocumentUpload } from './DocumentUpload';
import { ManifestReview } from './ManifestReview';
import { LogOut } from 'lucide-react';

export function Dashboard() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'form' | 'review'>('upload');
  const [manifestData, setManifestData] = useState<any>(null);
  const [parsedDocument, setParsedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDocumentUpload = async (file: File, manifestType: string, borderCrossing: string, crossingTime: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('manifestType', manifestType);
      formData.append('borderCrossing', borderCrossing);
      formData.append('crossingTime', crossingTime);

      // First get the parsed document
      const parsedResponse = await ApiService.uploadDocument(formData);
      console.log('Parsed Document:', parsedResponse);
      setParsedDocument(parsedResponse);

      // Then process with Groq
      const groqResponse = await ApiService.processWithGroq({
        content: parsedResponse.content,
        manifestType,
        crossingTime,
        borderCrossing
      });
      console.log('Groq Response:', groqResponse);
      setManifestData(groqResponse);
      
      setCurrentStep('form');
    } catch (error) {
      console.error('Upload error:', error);
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
      const borderConnectResponse = await ApiService.sendToBorderConnect(manifestResponse.id);
      
      setCurrentStep('upload');
      setManifestData(null);
      setParsedDocument(null);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Freight Flow Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <Step number={1} title="Upload Document" active={currentStep === 'upload'} />
            <div className="h-1 w-16 bg-gray-200" />
            <Step number={2} title="Review Data" active={currentStep === 'form'} />
            <div className="h-1 w-16 bg-gray-200" />
            <Step number={3} title="Submit Manifest" active={currentStep === 'review'} />
          </div>
        </div>

        {currentStep === 'upload' && (
          <DocumentUpload 
            onUpload={handleDocumentUpload}
            disabled={loading}
          />
        )}
        
        {currentStep === 'form' && (
          <ManifestForm 
            parsedData={parsedDocument}
            manifestData={manifestData}
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
      </main>
    </div>
  );
}

function Step({ number, title, active }: { number: number; title: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${
          active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {number}
      </div>
      <div className="mt-2 text-sm font-medium text-gray-600">{title}</div>
    </div>
  );
}
