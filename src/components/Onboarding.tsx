import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Truck, User, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type OnboardingStep = 'company' | 'driver' | 'vehicle' | 'insurance';

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('company');
  
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
  });

  const [driverInfo, setDriverInfo] = useState({
    driverNumber: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    citizenshipCountry: '',
    fastCardNumber: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    number: '',
    type: 'TR', // TR for Truck
    vinNumber: '',
    dotNumber: '',
    licensePlateNumber: '',
    licensePlateState: '',
  });

  const [insuranceInfo, setInsuranceInfo] = useState({
    companyName: '',
    policyNumber: '',
    issuedDate: '',
    expiryDate: '',
    policyAmount: '',
  });

  // const handleCompanySubmit = async () => {
  //   try {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) throw new Error('No user found');

  //     const { error } = await supabase
  //       .from('users')
  //       .update(companyInfo)
  //       .eq('id', user.id);

  //     if (error) throw error;
  //     setCurrentStep('driver');
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };
const handleCompanySubmit = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // Ensure the user is inserted if not already present
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        company_name: companyInfo.companyName,
        company_address: companyInfo.companyAddress,
        company_phone: companyInfo.companyPhone,
      }], { upsert: true });

    if (insertError) throw insertError;
    setCurrentStep('driver');
  } catch (error) {
    console.error('Error:', error);
  }
};


  // const handleDriverSubmit = async () => {
  //   try {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) throw new Error('No user found');

  //     const { error } = await supabase
  //       .from('drivers')
  //       .insert([{ ...driverInfo, user_id: user.id }]);

  //     if (error) throw error;
  //     setCurrentStep('vehicle');
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };
const handleDriverSubmit = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('drivers')
      .insert([{
        user_id: user.id,
        driver_number: driverInfo.driverNumber,
        first_name: driverInfo.firstName,
        last_name: driverInfo.lastName,
        gender: driverInfo.gender,
        date_of_birth: driverInfo.dateOfBirth,
        citizenship_country: driverInfo.citizenshipCountry, // Corrected field
        fast_card_number: driverInfo.fastCardNumber,
        license_number: driverInfo.licenseNumber,
        license_state: driverInfo.licenseState,
        license_expiry: driverInfo.licenseExpiry,
      }]);

    if (error) throw error;
    setCurrentStep('vehicle'); // Proceed to the next step
  } catch (error) {
    console.error('Error:', error);
  }
};

  // const handleVehicleSubmit = async () => {
  //   try {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) throw new Error('No user found');

  //     const { error } = await supabase
  //       .from('vehicles')
  //       .insert([{ ...vehicleInfo, user_id: user.id }]);

  //     if (error) throw error;
  //     setCurrentStep('insurance');
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  const handleVehicleSubmit = async () => {
   // Reset errors before submission
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { error } = await supabase.from('vehicles').insert({
      user_id: user.id,
      number: vehicleInfo.number,
      type: vehicleInfo.type,
      vin_number: vehicleInfo.vinNumber, // Corrected
      dot_number: vehicleInfo.dotNumber, // Corrected
      license_plate_number: vehicleInfo.licensePlateNumber, // Corrected
      license_plate_state: vehicleInfo.licensePlateState, // Corrected
    });

    if (error) throw error;
    setCurrentStep('insurance');
  } catch (err: any) {
    setError(err.message || 'An error occurred. Please try again.');
  }
};

  

  // const handleInsuranceSubmit = async () => {
  //   try {
  //     const { data: vehicles } = await supabase
  //       .from('vehicles')
  //       .select('id')
  //       .limit(1);

  //     if (!vehicles?.length) throw new Error('No vehicle found');

  //     const { error } = await supabase
  //       .from('insurance_policies')
  //       .insert([{ ...insuranceInfo, vehicle_id: vehicles[0].id }]);

  //     if (error) throw error;
  //     navigate('/dashboard');
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  const handleInsuranceSubmit = async () => {
  
  try {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1);

    if (!vehicles?.length) throw new Error('No vehicle found');

    const { error } = await supabase.from('insurance_policies').insert({
      vehicle_id: vehicles[0].id,
      company_name: insuranceInfo.companyName,    // Corrected field
      policy_number: insuranceInfo.policyNumber,  // Corrected field
      issued_date: insuranceInfo.issuedDate,      // Corrected field
      expiry_date: insuranceInfo.expiryDate,      // Corrected field
      policy_amount: insuranceInfo.policyAmount,  // Corrected field
    });

    if (error) throw error;
    navigate('/dashboard'); // Redirect after completion
  } catch (err: any) {
    setError(err.message || 'An error occurred. Please try again.');
  }
};

  const renderCompanyForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          required
          value={companyInfo.companyName}
          onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Address</label>
        <input
          type="text"
          required
          value={companyInfo.companyAddress}
          onChange={(e) => setCompanyInfo({ ...companyInfo, companyAddress: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Phone</label>
        <input
          type="tel"
          required
          value={companyInfo.companyPhone}
          onChange={(e) => setCompanyInfo({ ...companyInfo, companyPhone: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleCompanySubmit}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Next
      </button>
    </div>
  );

  const renderDriverForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            required
            value={driverInfo.firstName}
            onChange={(e) => setDriverInfo({ ...driverInfo, firstName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            required
            value={driverInfo.lastName}
            onChange={(e) => setDriverInfo({ ...driverInfo, lastName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Driver Number</label>
        <input
          type="text"
          required
          value={driverInfo.driverNumber}
          onChange={(e) => setDriverInfo({ ...driverInfo, driverNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          required
          value={driverInfo.gender}
          onChange={(e) => setDriverInfo({ ...driverInfo, gender: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input
          type="date"
          required
          value={driverInfo.dateOfBirth}
          onChange={(e) => setDriverInfo({ ...driverInfo, dateOfBirth: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Citizenship Country</label>
        <input
          type="text"
          required
          value={driverInfo.citizenshipCountry}
          onChange={(e) => setDriverInfo({ ...driverInfo, citizenshipCountry: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">FAST Card Number</label>
        <input
          type="text"
          value={driverInfo.fastCardNumber}
          onChange={(e) => setDriverInfo({ ...driverInfo, fastCardNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">License Number</label>
        <input
          type="text"
          required
          value={driverInfo.licenseNumber}
          onChange={(e) => setDriverInfo({ ...driverInfo, licenseNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">License State</label>
        <input
          type="text"
          required
          value={driverInfo.licenseState}
          onChange={(e) => setDriverInfo({ ...driverInfo, licenseState: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">License Expiry</label>
        <input
          type="date"
          required
          value={driverInfo.licenseExpiry}
          onChange={(e) => setDriverInfo({ ...driverInfo, licenseExpiry: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleDriverSubmit}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Next
      </button>
    </div>
  );

  const renderVehicleForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
        <input
          type="text"
          required
          value={vehicleInfo.number}
          onChange={(e) => setVehicleInfo({ ...vehicleInfo, number: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
        <select
          required
          value={vehicleInfo.type}
          onChange={(e) => setVehicleInfo({ ...vehicleInfo, type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="TR">Truck</option>
          <option value="TL">Trailer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">VIN Number</label>
        <input
          type="text"
          required
          value={vehicleInfo.vinNumber}
          onChange={(e) => setVehicleInfo({ ...vehicleInfo, vinNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">DOT Number</label>
        <input
          type="text"
          value={vehicleInfo.dotNumber}
          onChange={(e) => setVehicleInfo({ ...vehicleInfo, dotNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">License Plate Number</label>
        <input
          type="text"
          required
          value={vehicleInfo.licensePlateNumber}
          onChange={(e) => setVehicleInfo({ ...vehicleInfo, licensePlateNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">License Plate State</label>
        <input
          type="text"
          required
          value={vehicleInfo.licensePlateState}
          onChange={(e) => setVehicleInfo({ ...vehicleInfo, licensePlateState: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleVehicleSubmit}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Next
      </button>
    </div>
  );

  const renderInsuranceForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Insurance Company</label>
        <input
          type="text"
          required
          value={insuranceInfo.companyName}
          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, companyName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Policy Number</label>
        <input
          type="text"
          required
          value={insuranceInfo.policyNumber}
          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Issue Date</label>
        <input
          type="date"
          required
          value={insuranceInfo.issuedDate}
          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, issuedDate: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
        <input
          type="date"
          required
          value={insuranceInfo.expiryDate}
          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, expiryDate: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Policy Amount</label>
        <input
          type="number"
          required
          value={insuranceInfo.policyAmount}
          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyAmount: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleInsuranceSubmit}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Complete Setup
      </button>
    </div>
  );

  const steps = [
    { id: 'company', name: 'Company Info', icon: FileText },
    { id: 'driver', name: 'Driver Info', icon: User },
    { id: 'vehicle', name: 'Vehicle Info', icon: Truck },
    { id: 'insurance', name: 'Insurance Info', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <nav className="flex justify-center" aria-label="Progress">
              <ol className="flex items-center space-x-5">
                {steps.map((step) => (
                  <li key={step.id}>
                    <div className={`relative ${currentStep === step.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
              {steps.find(step => step.id === currentStep)?.name}
            </h2>
          </div>

          {currentStep === 'company' && renderCompanyForm()}
          {currentStep === 'driver' && renderDriverForm()}
          {currentStep === 'vehicle' && renderVehicleForm()}
          {currentStep === 'insurance' && renderInsuranceForm()}
        </div>
      </div>
    </div>
  );
}