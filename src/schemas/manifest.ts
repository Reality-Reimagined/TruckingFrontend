import { z } from 'zod';

export const manifestSchema = z.object({
  // Basic Manifest Info
  manifestType: z.enum(['ACE', 'ACI']),
  portOfEntry: z.string().min(4).max(4),
  estimatedArrivalDateTime: z.string().datetime(),

  // Truck Info
  truckNumber: z.string(),
  vinNumber: z.string(),
  licensePlateNumber: z.string(),
  licensePlateState: z.string(),
  
  // Insurance (required for ACI)
  insuranceCompanyName: z.string().optional(),
  policyNumber: z.string().optional(),
  insuranceIssuedDate: z.string().optional(),
  policyAmount: z.number().optional(),

  // Driver Info
  driverNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.enum(['M', 'F']),
  dateOfBirth: z.string(),
  citizenshipCountry: z.string(),
  fastCardNumber: z.string().optional(),
  
  // Travel Documents (for ACI)
  travelDocuments: z.array(
    z.object({
      number: z.string(),
      type: z.string(),
      stateProvince: z.string()
    })
  ).optional(),

  // Shipment Info
  shipmentType: z.string(),
  commodities: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      packagingUnit: z.enum(['BOX', 'PCE', 'PLT', 'CTN', 'DRM', 'ROL']),
      weight: z.number(),
      weightUnit: z.enum(['L', 'K', 'LBR', 'KGM'])
    })
  )
}); 