import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { manifestSchema } from '../schemas/manifest';
import { ManifestType, PackagingUnit, WeightUnit } from '../types/manifest';

export function ManifestForm({ parsedData, onComplete }) {
  const [manifestType, setManifestType] = useState<ManifestType>('ACE');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(manifestSchema),
    defaultValues: parsedData || {}
  });

  const onSubmit = (data: any) => {
    const manifestData = {
      data: manifestType === 'ACE' ? 'ACE_TRIP' : 'ACI_TRIP',
      tripNumber: generateTripNumber(), // Implement this function
      portOfEntry: data.portOfEntry,
      estimatedArrivalDateTime: data.estimatedArrivalDateTime,
      truck: {
        number: data.truckNumber,
        type: 'TR',
        vinNumber: data.vinNumber,
        ...(manifestType === 'ACI' && {
          dotNumber: data.dotNumber,
          insurancePolicy: {
            insuranceCompanyName: data.insuranceCompanyName,
            policyNumber: data.policyNumber,
            issuedDate: data.insuranceIssuedDate,
            policyAmount: parseFloat(data.policyAmount)
          }
        }),
        licensePlate: {
          number: data.licensePlateNumber,
          stateProvince: data.licensePlateState
        }
      },
      drivers: [{
        driverNumber: data.driverNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        citizenshipCountry: data.citizenshipCountry,
        ...(manifestType === 'ACE' && {
          fastCardNumber: data.fastCardNumber
        }),
        ...(manifestType === 'ACI' && {
          travelDocuments: data.travelDocuments
        })
      }],
      shipments: [{
        data: manifestType === 'ACE' ? 'ACE_SHIPMENT' : 'ACI_SHIPMENT',
        type: data.shipmentType,
        shipmentControlNumber: generateControlNumber(), // Implement this function
        // ... other shipment fields
      }],
      autoSend: false
    };

    onComplete(manifestData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Manifest Type Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Manifest Type
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              manifestType === 'ACE' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setManifestType('ACE')}
          >
            ACE
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              manifestType === 'ACI' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setManifestType('ACI')}
          >
            ACI
          </button>
        </div>
      </div>

      {/* Add form fields for all required data */}
      {/* This would be a long form with all the necessary fields */}
      {/* Consider breaking it into sections using tabs or accordion */}
      
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Review Manifest
      </button>
    </form>
  );
} 