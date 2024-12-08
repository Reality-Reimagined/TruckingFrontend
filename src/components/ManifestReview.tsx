import { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ManifestReviewProps {
  data: any;
  onSubmit: () => void;
  onEdit: () => void;
  disabled?: boolean;
}

export function ManifestReview({ data, onSubmit, onEdit, disabled }: ManifestReviewProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const renderSection = (title: string, content: any) => (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="font-medium text-lg mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <span className="text-sm text-gray-500">{key}</span>
            <p className="font-medium">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Review Manifest</h2>
        <p className="text-gray-600">
          Please review all information carefully before submitting to BorderConnect.
        </p>
      </div>

      {/* Manifest Info */}
      {renderSection('Manifest Information', {
        'Manifest Type': data.manifestType,
        'Border Crossing': data.borderCrossing,
        'Crossing Time': new Date(data.crossingTime).toLocaleString()
      })}

      {/* Driver Info */}
      {renderSection('Driver Information', data.driver)}

      {/* Vehicle Info */}
      {renderSection('Vehicle Information', data.truck)}

      {/* Shipment Info */}
      {data.shipments.map((shipment: any, index: number) => (
        renderSection(`Shipment ${index + 1}`, shipment)
      ))}

      {/* Warning Message */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
          <p className="text-sm text-yellow-700">
            Once submitted, this information will be sent to BorderConnect and cannot be modified.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onEdit}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={disabled}
        >
          Edit Information
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={disabled}
        >
          Submit to BorderConnect
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Confirm Submission</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit this manifest to BorderConnect?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  onSubmit();
                }}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 