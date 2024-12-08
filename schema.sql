-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    company_name TEXT,
    company_address TEXT,
    company_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Drivers table
CREATE TABLE drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    citizenship_country TEXT NOT NULL,
    fast_card_number TEXT,
    license_number TEXT NOT NULL,
    license_state TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, driver_number)
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    type TEXT NOT NULL,
    vin_number TEXT NOT NULL,
    dot_number TEXT,
    license_plate_number TEXT NOT NULL,
    license_plate_state TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, number)
);

-- Insurance policies table
CREATE TABLE insurance_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    policy_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Manifests table
CREATE TABLE manifests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    manifest_type TEXT NOT NULL CHECK (manifest_type IN ('ACE', 'ACI')),
    trip_number TEXT NOT NULL,
    port_of_entry TEXT NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    borderconnect_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, trip_number)
);

-- Shipments table
CREATE TABLE shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    manifest_id UUID REFERENCES manifests(id) ON DELETE CASCADE,
    shipment_control_number TEXT NOT NULL,
    type TEXT NOT NULL,
    province_of_loading TEXT NOT NULL,
    shipper_name TEXT NOT NULL,
    shipper_address TEXT NOT NULL,
    shipper_city TEXT NOT NULL,
    shipper_state TEXT NOT NULL,
    shipper_postal_code TEXT NOT NULL,
    consignee_name TEXT NOT NULL,
    consignee_address TEXT NOT NULL,
    consignee_city TEXT NOT NULL,
    consignee_state TEXT NOT NULL,
    consignee_postal_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Commodities table
CREATE TABLE commodities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    packaging_unit TEXT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    weight_unit TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at
    BEFORE UPDATE ON insurance_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manifests_updated_at
    BEFORE UPDATE ON manifests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commodities_updated_at
    BEFORE UPDATE ON commodities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own drivers" ON drivers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vehicles" ON vehicles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insurance policies" ON insurance_policies
    FOR ALL USING (
        vehicle_id IN (
            SELECT id FROM vehicles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own manifests" ON manifests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own shipments" ON shipments
    FOR ALL USING (
        manifest_id IN (
            SELECT id FROM manifests WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own commodities" ON commodities
    FOR ALL USING (
        shipment_id IN (
            SELECT id FROM shipments WHERE manifest_id IN (
                SELECT id FROM manifests WHERE user_id = auth.uid()
            )
        )
    );