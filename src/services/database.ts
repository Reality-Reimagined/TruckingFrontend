import { supabase } from '../lib/supabase';
import { Logger } from './logger';
import {
  Manifest,
  Driver,
  Vehicle,
  InsurancePolicy,
  Shipment,
  Commodity,
  User
} from '../types/database';

export class DatabaseService {
  static async getManifestWithRelations(manifestId: string) {
    try {
      Logger.log('info', 'Fetching manifest data', { manifestId });

      // Fetch manifest
      const { data: manifest, error: manifestError } = await supabase
        .from('manifests')
        .select('*')
        .eq('id', manifestId)
        .single();

      if (manifestError) throw manifestError;
      if (!manifest) throw new Error('Manifest not found');

      // Fetch related driver
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', manifest.driver_id)
        .single();

      if (driverError) throw driverError;
      if (!driver) throw new Error('Driver not found');

      // Fetch related vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', manifest.vehicle_id)
        .single();

      if (vehicleError) throw vehicleError;
      if (!vehicle) throw new Error('Vehicle not found');

      // Fetch insurance policy
      const { data: insurance, error: insuranceError } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .single();

      if (insuranceError) throw insuranceError;

      // Fetch shipments
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .eq('manifest_id', manifestId);

      if (shipmentsError) throw shipmentsError;

      // Fetch commodities for each shipment
      const shipmentsWithCommodities = await Promise.all(
        shipments.map(async (shipment) => {
          const { data: commodities, error: commoditiesError } = await supabase
            .from('commodities')
            .select('*')
            .eq('shipment_id', shipment.id);

          if (commoditiesError) throw commoditiesError;

          return {
            shipment,
            commodities
          };
        })
      );

      Logger.log('info', 'Successfully fetched manifest data', { manifestId });

      return {
        manifest,
        driver,
        vehicle,
        insurance,
        shipments: shipmentsWithCommodities
      };
    } catch (error) {
      Logger.log('error', 'Failed to fetch manifest data', { manifestId }, error as Error);
      throw error;
    }
  }

  static async createManifest(manifestData: any) {
    try {
      Logger.log('info', 'Creating new manifest', manifestData);

      const { data, error } = await supabase
        .from('manifests')
        .insert([manifestData])
        .select()
        .single();

      if (error) throw error;

      Logger.log('info', 'Successfully created manifest', { manifestId: data.id });
      return data;
    } catch (error) {
      Logger.log('error', 'Failed to create manifest', manifestData, error as Error);
      throw error;
    }
  }

  static async updateManifestStatus(manifestId: string, status: string, borderconnectResponse?: any) {
    try {
      Logger.log('info', 'Updating manifest status', { manifestId, status });

      const updateData: Partial<Manifest> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (borderconnectResponse) {
        updateData.borderconnect_response = borderconnectResponse;
      }

      const { data, error } = await supabase
        .from('manifests')
        .update(updateData)
        .eq('id', manifestId)
        .select()
        .single();

      if (error) throw error;

      Logger.log('info', 'Successfully updated manifest status', { manifestId, status });
      return data;
    } catch (error) {
      Logger.log('error', 'Failed to update manifest status', { manifestId, status }, error as Error);
      throw error;
    }
  }

  static async getUserManifests(userId: string) {
    try {
      Logger.log('info', 'Fetching user manifests', { userId });

      const { data, error } = await supabase
        .from('manifests')
        .select(`
          *,
          drivers (
            first_name,
            last_name
          ),
          vehicles (
            number,
            type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      Logger.log('info', 'Successfully fetched user manifests', { userId, count: data.length });
      return data;
    } catch (error) {
      Logger.log('error', 'Failed to fetch user manifests', { userId }, error as Error);
      throw error;
    }
  }
} 