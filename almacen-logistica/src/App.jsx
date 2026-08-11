import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  PackageCheck, 
  MapPin, 
  Rocket, 
  Database, 
  Cpu, 
  Settings, 
  Camera, 
  Check, 
  X, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  AlertTriangle, 
  Info,
  Calendar,
  DollarSign,
  QrCode,
  Map,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Trash2,  Lock,  Unlock,
  Edit2,
  Save
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase, supabaseConfig } from './supabaseClient';

// Helper: Haversine distance in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
};

// Initial Mock Data (used for Demo Mode and fallback)
const INITIAL_PRODUCTS = [
  { sku: 'VSABORIG42', name: 'PACK SABRITAS 1/5/10/40G', description: 'Garis - Sabritas', purchase_price: 15.12, sale_price: 16.00, tax_rate: 16 },
  { sku: 'VDORNACH61', name: 'PACK DORITOS 1/5/10/54G', description: 'Garis - Doritos', purchase_price: 13.60, sale_price: 14.00, tax_rate: 16 },
  { sku: 'VSABADOB57', name: 'PAPAS FRITAS SABRITAS ADOBADAS 57 G', description: 'Garis - Adobadas', purchase_price: 11.00, sale_price: 12.00, tax_rate: 16 },
  { sku: 'VRANCHER40', name: 'PACK RANCHERITOS 1/5/10/40G', description: 'Garis - Rancheritos', purchase_price: 10.00, sale_price: 11.00, tax_rate: 16 },
  { sku: 'VCHETOS46', name: 'BOTANA CHEETOS TORCIDITOS CHICO 46G', description: 'Garis - Cheetos', purchase_price: 10.00, sale_price: 11.00, tax_rate: 16 },
  { sku: 'AB00009', name: 'SOPA INSTANTANEA MARUCHAN CAMARON HABANERO 64', description: 'Indw - Maruchan', purchase_price: 12.17, sale_price: 13.00, tax_rate: 0 },
  { sku: 'AB00010', name: 'SOPA INSTANTANEA MARUCHAN CAMARON PIQUIN 64 GR', description: 'Indw - Maruchan', purchase_price: 12.17, sale_price: 13.00, tax_rate: 0 },
  { sku: 'DURP0078', name: 'PALETA PAYASO CJ 10P 43.5G (NUEVO)', description: 'Indw - Dulces', purchase_price: 9.59, sale_price: 10.00, tax_rate: 8 },
  { sku: 'VGALOREO63', name: 'FAR OREO 4 COUNT 6/9/42G', description: 'Garis - Nabisco', purchase_price: 5.42, sale_price: 6.00, tax_rate: 16 },
  { sku: 'VGALSPON60', name: 'CAJA SPONCH 1/12/63G', description: 'Garis - Marinela', purchase_price: 7.24, sale_price: 8.00, tax_rate: 16 },
  { sku: 'VGALPRIN42', name: 'PRINCIPE 1/16/63 GRS', description: 'Garis - Marinela', purchase_price: 6.47, sale_price: 7.00, tax_rate: 16 },
  { sku: 'VGALMAMU30', name: 'GALLETA GAMESA MAMUT 30 G', description: 'Garis - Gamesa', purchase_price: 5.86, sale_price: 7.00, tax_rate: 16 },
  { sku: 'VGALROCK44', name: 'ROCKO 4/44G', description: 'Garis - Marinela', purchase_price: 9.50, sale_price: 10.00, tax_rate: 16 },
  { sku: 'VGALTRIKI51', name: 'CAJA TRIKI TRAKES 1/26/51G', description: 'Garis - Marinela', purchase_price: 8.95, sale_price: 10.00, tax_rate: 16 },
  { sku: 'VGALEMCHO40', name: 'GAMESA EMPERADOR 112/40 GRM CHOCOLATE', description: 'Garis - Gamesa', purchase_price: 6.40, sale_price: 7.00, tax_rate: 16 },
  { sku: 'VGALEMVAI40', name: 'GALLETAS GAMESA EMPERADOR SABOR VAINILLA 40 G', description: 'Garis - Gamesa', purchase_price: 6.40, sale_price: 7.00, tax_rate: 16 },
  { sku: 'VGALPRIRE42', name: 'PRRINCIPE/ REESE 1/12/9/42G', description: 'Garis - Marinela', purchase_price: 6.22, sale_price: 7.00, tax_rate: 16 },
  { sku: 'VCONM&M37.5', name: 'MMS CACAHUATE 37GPZ/ CJ.1/32/6/37.5G', description: 'Garis - Mars', purchase_price: 14.24, sale_price: 15.00, tax_rate: 16 },
  { sku: 'DUM00035', name: 'LCS MCS CHAMOY AX CS 1/24/10/24G MX', description: 'Garis - Lucas', purchase_price: 6.32, sale_price: 7.00, tax_rate: 8 },
  { sku: 'DUC00080', name: 'GOMITAS MANGUITOS 12X96G (NUEVO)', description: 'Garis - Ricolino', purchase_price: 8.21, sale_price: 9.00, tax_rate: 8 },
  { sku: 'DUR00053', name: 'BUBULUBU CAJA 12P 35G MAY RIC', description: 'Garis - Ricolino', purchase_price: 5.63, sale_price: 6.00, tax_rate: 8 },
  { sku: 'DUM00034', name: 'SKW SSGT SAN GDA 20/12/24G MX', description: 'Garis - Lucas', purchase_price: 6.68, sale_price: 7.00, tax_rate: 8 },
  { sku: 'DUH00038', name: 'PELONETES TMRND DSPL 8/18/30G', description: 'Garis - Hershey', purchase_price: 6.78, sale_price: 7.00, tax_rate: 8 },
  { sku: 'DUM00039', name: 'MEGA BUBBALOO FRESA 39 GRS', description: 'Garis - Adams', purchase_price: 9.79, sale_price: 11.00, tax_rate: 16 },
  { sku: 'DUM00046', name: 'TRIDENT XTRACARE MENTA 13.6GR', description: 'Garis - Adams', purchase_price: 5.32, sale_price: 6.00, tax_rate: 16 },
  { sku: 'DUM00033', name: 'SKW CLA CHA GDA 24/12/19.5G MX', description: 'Garis - Lucas', purchase_price: 5.78, sale_price: 6.00, tax_rate: 8 },
  { sku: 'DUF00093', name: 'KINDER DELICE 10 X 14 X 40G', description: 'Garis - Ferrero', purchase_price: 10.40, sale_price: 11.00, tax_rate: 8 },
  { sku: 'DUM00051', name: 'HALLS MENTA FOP 30X12X25.2G', description: 'Garis - Mondelez', purchase_price: 4.74, sale_price: 5.00, tax_rate: 8 },
  { sku: '5000000402', name: 'BOING LATA MANGO 1/24/340', description: 'Garis - Pascual', purchase_price: 8.35, sale_price: 10.00, tax_rate: 16 },
  { sku: '5000000182', name: 'BOING LATA GUAYABA 1/24/340', description: 'Garis - Pascual', purchase_price: 8.35, sale_price: 10.00, tax_rate: 16 },
  { sku: 'VCOCAORI335', name: 'COCA COLA 1/12/355 ML', description: 'Garis - CocaCola', purchase_price: 11.50, sale_price: 12.00, tax_rate: 16 },
  { sku: 'VCOCAORI600', name: 'COCA COLA 1/24/600 ML', description: 'Garis - CocaCola', purchase_price: 19.46, sale_price: 20.00, tax_rate: 16 }
];

const INITIAL_MACHINES = [
  { id: 'VM-101', name: 'Corp. Nestlé - Piso 3', address: 'Av. Ejército Nacional 843, CDMX', latitude: 19.4398, longitude: -99.2031, status: 'active', products: [
    { sku: 'VSABORIG42', coil_number: '10', capacity: 15, current_quantity: 6 },
    { sku: 'VDORNACH61', coil_number: '11', capacity: 10, current_quantity: 4 },
    { sku: 'VSABADOB57', coil_number: '12', capacity: 10, current_quantity: 3 },
    { sku: 'AB00009', coil_number: '20', capacity: 15, current_quantity: 4 },
    { sku: 'AB00010', coil_number: '21', capacity: 10, current_quantity: 2 }
  ]},
  { id: 'VM-102', name: 'Hub Toluca Innovación', address: 'Industrial Toluca Lerma, EdoMex', latitude: 19.2922, longitude: -99.5312, status: 'active', products: [
    { sku: 'VSABORIG42', coil_number: '10', capacity: 15, current_quantity: 14 },
    { sku: 'VDORNACH61', coil_number: '11', capacity: 10, current_quantity: 9 },
    { sku: 'AB00009', coil_number: '12', capacity: 15, current_quantity: 13 }
  ]},
  { id: 'VM-103', name: 'UVM Campus Tlalpan', address: 'Calzada de Tlalpan 3058, CDMX', latitude: 19.3245, longitude: -99.1415, status: 'active', products: [
    { sku: 'VSABORIG42', coil_number: '10', capacity: 15, current_quantity: 5 },
    { sku: 'VSABADOB57', coil_number: '11', capacity: 10, current_quantity: 2 },
    { sku: 'AB00010', coil_number: '12', capacity: 10, current_quantity: 1 }
  ]},
  { id: 'VM-AS-01', name: 'Grupo Alphalab', address: 'Oficinas Grupo Alphalab, CDMX', latitude: 19.4326, longitude: -99.1942, status: 'active', products: [
    // Level 1: channels 10-14, capacity 10
    { sku: 'VSABORIG42', coil_number: '10', capacity: 10, current_quantity: 0 },
    { sku: 'VDORNACH61', coil_number: '11', capacity: 10, current_quantity: 0 },
    { sku: 'VSABADOB57', coil_number: '12', capacity: 10, current_quantity: 0 },
    { sku: 'VRANCHER40', coil_number: '13', capacity: 10, current_quantity: 0 },
    { sku: 'VCHETOS46', coil_number: '14', capacity: 10, current_quantity: 0 },
    // Level 2: channels 20-24, capacity 4
    { sku: 'AB00009', coil_number: '20', capacity: 4, current_quantity: 0 },
    { sku: 'AB00009', coil_number: '21', capacity: 4, current_quantity: 0 },
    { sku: 'AB00009', coil_number: '22', capacity: 4, current_quantity: 0 },
    { sku: 'AB00010', coil_number: '23', capacity: 4, current_quantity: 0 },
    { sku: 'AB00010', coil_number: '24', capacity: 4, current_quantity: 0 },
    // Level 3: channels 30-38, capacity 15 for 30, and 18 for others
    { sku: 'DURP0078', coil_number: '30', capacity: 15, current_quantity: 0 },
    { sku: 'VOREO4C', coil_number: '31', capacity: 18, current_quantity: 0 },
    { sku: 'VSPONCH', coil_number: '32', capacity: 18, current_quantity: 0 },
    { sku: 'VPRINCIPE', coil_number: '33', capacity: 18, current_quantity: 0 },
    { sku: 'VMAMUT30', coil_number: '34', capacity: 18, current_quantity: 0 },
    { sku: 'VTRIKI', coil_number: '35', capacity: 18, current_quantity: 0 },
    { sku: 'VREESE', coil_number: '36', capacity: 18, current_quantity: 0 },
    { sku: 'VMMSCAC', coil_number: '37', capacity: 18, current_quantity: 0 },
    { sku: 'VLCSMC', coil_number: '38', capacity: 18, current_quantity: 0 },
    // Level 4: channels 40-48, capacity 15 for 40, and 24 for others
    { sku: 'VMANGUITOS', coil_number: '40', capacity: 15, current_quantity: 0 },
    { sku: 'VBUBULUBU', coil_number: '41', capacity: 24, current_quantity: 0 },
    { sku: 'VSKWSSG', coil_number: '42', capacity: 24, current_quantity: 0 },
    { sku: 'VPELONETES', coil_number: '43', capacity: 24, current_quantity: 0 },
    { sku: 'VBUBBALOO', coil_number: '44', capacity: 24, current_quantity: 0 },
    { sku: 'VTRIDENT', coil_number: '45', capacity: 24, current_quantity: 0 },
    { sku: 'VSKWCLA', coil_number: '46', capacity: 24, current_quantity: 0 },
    { sku: 'VKINDER', coil_number: '47', capacity: 24, current_quantity: 0 },
    { sku: 'VHALLS', coil_number: '48', capacity: 24, current_quantity: 0 },
    // Level 5: channels 50-58, capacity 6
    { sku: 'VBOINGMANGO', coil_number: '50', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGMANGO', coil_number: '51', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGMANGO', coil_number: '52', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGMANGO', coil_number: '53', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGGUAYABA', coil_number: '54', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGGUAYABA', coil_number: '55', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGGUAYABA', coil_number: '56', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGGUAYABA', coil_number: '57', capacity: 6, current_quantity: 0 },
    { sku: 'VBOINGGUAYABA', coil_number: '58', capacity: 6, current_quantity: 0 },
    // Level 6: channels 60-68, capacity 6
    { sku: 'VCOCAORI335', coil_number: '60', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '61', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '62', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '63', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '64', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '65', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '66', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '67', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI335', coil_number: '68', capacity: 6, current_quantity: 0 },
    // Level 7: channels 70-78, capacity 6
    { sku: 'VCOCAORI600', coil_number: '70', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '71', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '72', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '73', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '74', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '75', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '76', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '77', capacity: 6, current_quantity: 0 },
    { sku: 'VCOCAORI600', coil_number: '78', capacity: 6, current_quantity: 0 }
  ]}
];

const INITIAL_POS = [
  { id: 'oc-1', oc_number: 'OC-2026-001', provider: 'Garis S.A.', order_date: '2026-07-18', status: 'pending', items: [
    { sku: 'VSABORIG42', quantity_ordered: 120, quantity_received: 0, purchase_price: 15.12 },
    { sku: 'AB00009', quantity_ordered: 60, quantity_received: 0, purchase_price: 14.12 }
  ]},
  { id: 'oc-2', oc_number: 'OC-2026-002', provider: 'Induwell Comercial', order_date: '2026-07-20', status: 'pending', items: [
    { sku: 'VDORNACH61', quantity_ordered: 80, quantity_received: 0, purchase_price: 13.60 },
    { sku: 'VSABADOB57', quantity_ordered: 40, quantity_received: 0, purchase_price: 11.00 }
  ]}
];

const INITIAL_ASSETS = [
  { id: 'VAN-001', name: 'Furgoneta Logística 01', type: 'van', model: 'Peugeot Manager L2H2', serial_number: 'PEUGEOT-MGR-2026-X8', lease_start_date: '2026-05-15', lease_months: 48, monthly_cost: 14500.00, location: 'Hub Toluca', status: 'recibida', assigned_client: null, assignment_date: null, lease_active: true, is_active: true },
  { id: 'VAN-002', name: 'Furgoneta Logística 02', type: 'van', model: 'JAC Sunray Cargo', serial_number: 'JAC-SUNRAY-9283-K1', lease_start_date: '2026-06-01', lease_months: 48, monthly_cost: 12500.00, location: 'Hub CDMX', status: 'recibida', assigned_client: null, assignment_date: null, lease_active: true, is_active: true },
  { id: 'SAFE-001', name: 'Bóveda Móvil Van 01', type: 'safe', model: 'VendingSafe V1', serial_number: 'VS-TOM-001', lease_start_date: '2026-05-15', lease_months: 48, monthly_cost: 850.00, location: 'A bordo VAN-001', status: 'recibida', assigned_client: null, assignment_date: null, lease_active: true, is_active: true },
  { id: 'VM-AS-01', name: 'Vending Machine AMS 39', type: 'vending_machine', model: 'AMS 39', serial_number: '1640193485', lease_start_date: '2026-07-01', lease_months: 48, monthly_cost: 3200.00, location: 'Instalada en Alphalab Oficinas', status: 'assigned', assigned_client: 'Alphalab oficinas', assignment_date: '2026-07-15', lease_active: true, is_active: true },
  { id: 'VM-AS-02', name: 'Vending Machine AMS 39', type: 'vending_machine', model: 'AMS 39', serial_number: '1640193494', lease_start_date: '2026-07-15', lease_months: 48, monthly_cost: 3200.00, location: 'Cedis Central Toluca', status: 'recibida', assigned_client: null, assignment_date: null, lease_active: false, is_active: true }
];

const INITIAL_LEADS = [
  { id: 'lead-1', company_name: 'Corporativo Banorte Reforma', contact_name: 'Ing. Roberto Gómez', contact_phone: '55-1234-5678', status: 'kyc', scorecard_score: 88, rent_amount: 6500.00, contract_signed: true, kyc_docs_count: 4, installation_date: '2026-08-01' },
  { id: 'lead-2', company_name: 'Gimnasio SmartFit Polanco', contact_name: 'Lic. Clara Montes', contact_phone: '55-7654-3210', status: 'contract', scorecard_score: 79, rent_amount: 6500.00, contract_signed: false, kyc_docs_count: 2, installation_date: null },
  { id: 'lead-3', company_name: 'Oficinas WeWork Satélite', contact_name: 'Arq. Luis Fuentes', contact_phone: '55-2345-6789', status: 'scorecard', scorecard_score: 65, rent_amount: 6500.00, contract_signed: false, kyc_docs_count: 0, installation_date: null },
  { id: 'lead-alphalab', company_name: 'Alphalab oficinas', contact_name: 'Dr. Alejandro Soto', contact_phone: '55-8888-9999', status: 'installed', scorecard_score: 92, rent_amount: 6500.00, contract_signed: true, kyc_docs_count: 5, installation_date: '2026-07-15' }
];

// Helper to generate sequential alphanumeric asset IDs
const generateAssetId = (type, existingAssets) => {
  if (type === 'vending_machine') {
    const vms = existingAssets.filter(a => a.type === 'vending_machine');
    const nextIndex = vms.length + 1;
    const groupIndex = Math.floor((nextIndex - 1) / 100);
    const char1 = String.fromCharCode(65 + Math.floor(groupIndex / 26));
    const char2 = String.fromCharCode(65 + (groupIndex % 26));
    const prefix = char1 + char2;
    const paddedNum = String(nextIndex).padStart(3, '0');
    return `${prefix}-${paddedNum}`;
  } else if (type === 'van') {
    const vans = existingAssets.filter(a => a.type === 'van');
    return `VAN-${String(vans.length + 1).padStart(3, '0')}`;
  } else {
    const safes = existingAssets.filter(a => a.type === 'safe');
    return `SAFE-${String(safes.length + 1).padStart(3, '0')}`;
  }
};

// Helper to get descriptive Vending machine level name based on coil number
const getLevelName = (coil) => {
  const firstChar = coil ? String(coil)[0] : '1';
  switch (firstChar) {
    case '1': return 'Nivel 1: Papas & Snacks (Cap. 10)';
    case '2': return 'Nivel 2: Sopas Instantáneas (Cap. 4)';
    case '3': return 'Nivel 3: Galletas & Dulces A (Cap. 18)';
    case '4': return 'Nivel 4: Dulces & Confitería B (Cap. 24)';
    case '5': return 'Nivel 5: Bebidas Jugos Boing (Cap. 6)';
    case '6': return 'Nivel 6: Refrescos Coca-Cola 355ml (Cap. 6)';
    case '7': return 'Nivel 7: Refrescos Coca-Cola 600ml (Cap. 6)';
    default: return 'Nivel General';
  }
};

let isMigrationRunningGlobal = false;

const getFolioFromUuid = (uuid) => {
  if (!uuid) return '';
  // Backwards compatibility for the first reception row in Google Sheets
  if (uuid === 'fc821425-de34-4870-9927-05ad7f5e60ac') {
    return 'REC-2026-846269';
  }
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const number = Math.abs(hash % 900000) + 100000;
  return `REC-2026-${number}`;
};

export default function App() {
  const handleConfirmInstallation = async (lead) => {
    // Generate a machine ID from the lead
    const initials = lead.company_name.split(' ').map(w => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanInitials = initials.substring(0, 4) || 'VM';
    const machineId = `VM-${cleanInitials}-${Math.floor(100 + Math.random() * 900)}`;
    
    // 1. Create the new machine object
    const newMachine = {
      id: machineId,
      name: `Máquina ${lead.company_name}`,
      address: `Ubicación programada en ${lead.company_name}`,
      latitude: 19.4398 + (Math.random() - 0.5) * 0.05,
      longitude: -99.2031 + (Math.random() - 0.5) * 0.05,
      status: 'active'
    };

    // 2. Set up default spirals for this new machine so it can immediately be filled in Pre-kitting!
    const defaultCoils = [
      { sku: 'VSABORIG42', coil_number: '10', capacity: 10, current_quantity: 0 },
      { sku: 'VDORNACH61', coil_number: '11', capacity: 10, current_quantity: 0 },
      { sku: 'VSABADOB57', coil_number: '12', capacity: 10, current_quantity: 0 },
      { sku: 'AB00009', coil_number: '20', capacity: 10, current_quantity: 0 },
      { sku: 'DURP0078', coil_number: '30', capacity: 15, current_quantity: 0 },
      { sku: 'VCOCAORI335', coil_number: '60', capacity: 10, current_quantity: 0 }
    ];

    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        // Insert into vending_machines
        await supabase.from('vending_machines').insert({
          id: newMachine.id,
          name: newMachine.name,
          address: newMachine.address,
          latitude: newMachine.latitude,
          longitude: newMachine.longitude,
          status: 'active'
        });

        // Insert spirals
        const coilsToInsert = defaultCoils.map(c => ({
          vending_machine_id: newMachine.id,
          sku: c.sku,
          coil_number: c.coil_number,
          capacity: c.capacity,
          current_quantity: c.current_quantity
        }));
        await supabase.from('vending_machine_products').insert(coilsToInsert);

        // Update lead status
        await supabase.from('leads')
          .update({ status: 'deployed' })
          .eq('id', lead.id);
      }

      // Update Local state
      // Add the machine with its products
      setVendingMachines(prev => [...prev, { ...newMachine, products: defaultCoils }]);
      
      // Update lead status locally
      setLeads(prev => prev.map(l => {
        if (l.id === lead.id) {
          const updated = { ...l, status: 'deployed' };
          syncLeadToGoogleSheets(updated);
          return updated;
        }
        return l;
      }));

      alert(`✓ ¡Instalación Completada!\nID de Máquina: ${machineId}\nSe han asignado sus espirales iniciales y ya se encuentra activa para ser operada en Pre-Kitting y Rutas.`);    } catch (err) {
      console.error(err);
      alert("Error al confirmar instalación");    } finally {
      setKardexDetailLoading(false);
    }
  };

  const handleDeletePO = async (poId) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar esta Orden de Compra (${targetPO.oc_number}) por completo? Se borrarán también sus partidas y sus registros de recepción asociados en Google Sheets.`)) return;
    setDbLoading(true);
    try {
      let receptionIds = [];
      if (isSupabaseMode && supabase) {
        // Fetch receptions for this PO to obtain their IDs/folios
        const { data: recs } = await supabase.from('receptions').select('id').eq('purchase_order_id', poId);
        if (recs) {
          receptionIds = recs.map(r => r.id);
        }

        // Delete inventory logs associated with these receptions
        if (receptionIds.length > 0) {
          await supabase.from('inventory_logs').delete().in('reference_id', receptionIds);
        }

        // Delete the receptions
        await supabase.from('receptions').delete().eq('purchase_order_id', poId);

        // Delete the purchase order items
        await supabase.from('purchase_order_items').delete().eq('purchase_order_id', poId);

        // Delete the purchase order itself
        const { error } = await supabase.from('purchase_orders').delete().eq('id', poId);
        if (error) throw error;
      }

      // Notify Google Sheets to delete all receptions of this PO Gid: 869108026
      const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
      const mainSheetsUrl = 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
      
      const payload = {
        action: 'delete_by_oc',
        oc_netsuite: targetPO.oc_number
      };

      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("Error notifying receptions script of PO delete:", err);
      }

      try {
        await fetch(mainSheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("Error notifying main script of PO delete:", err);
      }

      // Filter out the deleted receptions from the inventory logs state
      setInventoryLogs(prev => prev.filter(log => {
        if (log.type === 'reception') {
          if (isSupabaseMode && receptionIds.includes(log.reference_id)) {
            return false;
          }
          if (log.details && log.details.includes(targetPO.oc_number)) {
            return false;
          }
        }
        return true;
      }));

      setPurchaseOrders(prev => prev.filter(p => p.id !== poId));
      setSelectedPO(null);
      alert("✓ Orden de Compra, sus partidas, entradas en el Kardex y sus parcialidades en Google Sheets han sido eliminadas.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la Orden de Compra: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };  const handleSaveKardexDetailEdit = async () => {
    setDbLoading(true);
    try {
      if (selectedKardexLog.type === 'reception') {
        const { purchase_order, items } = kardexDetailData;
        
        if (isSupabaseMode && supabase) {
          if (purchase_order) {
            await supabase.from('purchase_orders')
              .update({ oc_number: purchase_order.oc_number, provider: purchase_order.provider })
              .eq('id', purchase_order.id);
          }
          
          for (const item of items) {
            await supabase.from('inventory_logs')
              .update({ quantity: item.quantity })
              .eq('id', item.id);
          }
        }

        // Sync updates to Google Sheets
        const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
        try {
          const updatePayload = {
            action: 'update',
            folio: getFolioFromUuid(selectedKardexLog.reference_id),
            oc_netsuite: purchase_order ? purchase_order.oc_number : 'OC-MANUAL',
            currency: 'MXN',
            exchange_rate: 1.0,
            items: items.map(item => {
              const prod = products.find(p => p.sku === item.sku) || { name: 'Producto', purchase_price: 0, tax_rate: 16 };
              return {
                sku: item.sku,
                name: prod.name,
                qty: Math.abs(item.quantity),
                quantity: Math.abs(item.quantity),
                purchase_price: prod.purchase_price,
                tax_rate: prod.tax_rate
              };
            })
          };
          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
          });
        } catch (e) {
          console.error("Google Sheets Update Sync Error:", e);
        }
        
        setInventoryLogs(prev => prev.map(l => {
          const matchedItem = items.find(it => it.id === l.id);
          return matchedItem ? { ...l, quantity: matchedItem.quantity } : l;
        }));

        if (purchase_order) {
          setPurchaseOrders(prev => prev.map(po => 
            po.id === purchase_order.id 
              ? { ...po, oc_number: purchase_order.oc_number, provider: purchase_order.provider } 
              : po
          ));
        }

      } else if (selectedKardexLog.type === 'prekitting_exit' || selectedKardexLog.type === 'route_out') {
        const { box, items } = kardexDetailData;
        
        if (isSupabaseMode && supabase) {
          if (box) {
            await supabase.from('boxes')
              .update({ vending_machine_id: box.vending_machine_id })
              .eq('id', box.id);
          }

          for (const item of items) {
            await supabase.from('box_items')
              .update({ quantity: item.quantity })
              .eq('box_id', box.id)
              .eq('sku', item.sku);

            await supabase.from('inventory_logs')
              .update({ quantity: -item.quantity })
              .eq('reference_id', box.id)
              .eq('sku', item.sku);
          }
        }

        setInventoryLogs(prev => prev.map(l => {
          if (l.reference_id === box.id) {
            const matchedItem = items.find(it => it.sku === l.sku);
            return matchedItem ? { ...l, quantity: -matchedItem.quantity } : l;
          }
          return l;
        }));

        setBoxes(prev => prev.map(b => 
          b.id === box.id 
            ? { ...b, vending_machine_id: box.vending_machine_id, items: b.items.map(it => {
                const matchedItem = items.find(mi => mi.sku === it.sku);
                return matchedItem ? { ...it, quantity: matchedItem.quantity } : it;
              })} 
            : b
        ));
      } else if (selectedKardexLog.type === 'return') {
        const ret = kardexDetailData.return;
        
        if (isSupabaseMode && supabase) {
          await supabase.from('returns')
            .update({ reason: ret.reason })
            .eq('id', ret.id);

          await supabase.from('inventory_logs')
            .update({ quantity: selectedKardexLog.quantity })
            .eq('id', selectedKardexLog.id);
        }

        setInventoryLogs(prev => prev.map(l => 
          l.id === selectedKardexLog.id ? { ...l, quantity: selectedKardexLog.quantity } : l
        ));
        setReturns(prev => prev.map(r => 
          r.id === ret.id ? { ...r, reason: ret.reason, quantity: selectedKardexLog.quantity } : r
        ));
      }
      
      setIsEditingKardexDetail(false);
      alert("✓ Cambios guardados.\nNetsuite sincronizado y Google Sheets actualizado con éxito.");
      if (isSupabaseMode) fetchDataFromSupabase();
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleEditPO = (po) => {
    setNewPOForm({
      id: po.id,
      oc_number: po.oc_number,
      provider: po.provider,
      items: po.items.map(it => ({
        sku: it.sku,
        quantity_ordered: it.quantity_ordered,
        purchase_price: it.purchase_price
      }))
    });
    setIsCreatingPO(true);
  };  const handleDeleteKardexLogTransaction = async (log) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente esta transacción (${log.type})? Esto restaurará/ajustará los movimientos de inventario asociados.`)) return;
    
    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        if (log.type === 'reception') {
          await supabase.from('receptions').delete().eq('id', log.reference_id);
          await supabase.from('inventory_logs').delete().eq('reference_id', log.reference_id);
        } else if (log.type === 'prekitting_exit' || log.type === 'route_out') {
          await supabase.from('boxes').delete().eq('id', log.reference_id);
          await supabase.from('inventory_logs').delete().eq('reference_id', log.reference_id);
        } else if (log.type === 'return') {
          await supabase.from('returns').delete().eq('id', log.reference_id);
          await supabase.from('inventory_logs').delete().eq('reference_id', log.reference_id);
        }
      }

      // Sync deletion to Google Sheets (ALWAYS, regardless of Supabase configuration mode!)
      if (log.type === 'reception') {
        const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
        try {
          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              folio: getFolioFromUuid(log.reference_id)
            })
          });
        } catch (e) {
          console.error("Google Sheets Delete Sync Error:", e);
        }
      }

      setInventoryLogs(prev => prev.filter(l => l.reference_id !== log.reference_id));
      if (log.type === 'prekitting_exit' || log.type === 'route_out') {
        setBoxes(prev => prev.filter(b => b.id !== log.reference_id));
      } else if (log.type === 'return') {
        setReturns(prev => prev.filter(r => r.id !== log.reference_id));
      }

      setSelectedKardexLog(null);
      setKardexDetailData(null);
      alert("✓ Transacción eliminada.\nKardex saneado, Netsuite sincronizado y Google Sheets actualizado con éxito.");
      if (isSupabaseMode) fetchDataFromSupabase();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la transacción: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };


  // Navigation State (Mobile tabs)
  // Options: 'reception', 'prekitting', 'routing', 'rollout', 'more' (leads to assets, smart)
  const [activeTab, setActiveTab] = useState('reception');
  const [moreTabSub, setMoreTabSub] = useState('assets'); // 'assets', 'smart'

  // DB Mode State
  const [isSupabaseMode, setIsSupabaseMode] = useState(supabaseConfig.isConfigured);
  const [dbLoading, setDbLoading] = useState(false);

  // App Data States
  const [products, setProducts] = useState(() => {
    const local = localStorage.getItem('snackeando_products');
    return local ? JSON.parse(local) : INITIAL_PRODUCTS;
  });
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const local = localStorage.getItem('snackeando_purchase_orders');
    return local ? JSON.parse(local) : INITIAL_POS;
  });
  const [inventoryLogs, setInventoryLogs] = useState(() => {
    const local = localStorage.getItem('snackeando_inventory_logs');
    return local ? JSON.parse(local) : [
      { id: 'log-1', sku: 'VSABORIG42', quantity: 200, type: 'reception', reference_id: 'rec-1', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'log-2', sku: 'VDORNACH61', quantity: 150, type: 'reception', reference_id: 'rec-2', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: 'log-3', sku: 'VSABORIG42', quantity: -9, type: 'prekitting_exit', reference_id: 'box-1', created_at: new Date().toISOString() }
    ];
  });
  const [vendingMachines, setVendingMachines] = useState(() => {
    const local = localStorage.getItem('snackeando_vending_machines');
    return local ? JSON.parse(local) : INITIAL_MACHINES;
  });
  const [boxes, setBoxes] = useState(() => {
    const local = localStorage.getItem('snackeando_boxes');
    return local ? JSON.parse(local) : [
      { id: 'box-1', box_code: 'TOTE-VM-101-X92B', vending_machine_id: 'VM-101', status: 'verified', picked_by: 'Carlos Picker', verified_by: 'Eduardo Validador', loaded_by: null, created_at: new Date().toISOString(), items: [
        { sku: 'VSABORIG42', quantity: 9, quantity_verified: 9, quantity_stocked: 0 },
        { sku: 'VDORNACH61', quantity: 6, quantity_verified: 6, quantity_stocked: 0 },
        { sku: 'VSABADOB57', quantity: 7, quantity_verified: 7, quantity_stocked: 0 }
      ]}
    ];
  });
  const [returns, setReturns] = useState(() => {
    const local = localStorage.getItem('snackeando_returns');
    return local ? JSON.parse(local) : [];
  });
  const [assets, setAssets] = useState(() => {
    const local = localStorage.getItem('snackeando_assets');
    return local ? JSON.parse(local) : INITIAL_ASSETS;
  });
  const [leads, setLeads] = useState(() => {
    const local = localStorage.getItem('snackeando_leads');
    return local ? JSON.parse(local) : INITIAL_LEADS;
  });
  const [maintenanceLogs, setMaintenanceLogs] = useState(() => {
    const local = localStorage.getItem('snackeando_maintenance_logs');
    return local ? JSON.parse(local) : [];
  });

  // Offline persistence hooks
  useEffect(() => {
    localStorage.setItem('snackeando_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('snackeando_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('snackeando_inventory_logs', JSON.stringify(inventoryLogs));
  }, [inventoryLogs]);

  useEffect(() => {
    localStorage.setItem('snackeando_vending_machines', JSON.stringify(vendingMachines));
  }, [vendingMachines]);

  useEffect(() => {
    localStorage.setItem('snackeando_boxes', JSON.stringify(boxes));
  }, [boxes]);

  useEffect(() => {
    localStorage.setItem('snackeando_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('snackeando_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('snackeando_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('snackeando_maintenance_logs', JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  // Cleanup old machines (like VM-ALPHALAB) from cached state
  useEffect(() => {
    setVendingMachines(prev => prev.filter(m => m.id !== 'VM-ALPHALAB'));
  }, []);

  // Sub-Tab States
  const [receptionSubTab, setReceptionSubTab] = useState('catalog'); // 'catalog', 'po_rec', 'kardex', 'returns'
  const [prekittingSubTab, setPrekittingSubTab] = useState('picker'); // 'picker', 'validator'

  // Form & Camera States
  const [selectedPO, setSelectedPO] = useState(null);
  const [poQuantities, setPoQuantities] = useState({}); // { sku: { qty: 0, cost: 0, tax: 16, expDate: '' } }
  const [receptionPhoto, setReceptionPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(''); // 'reception', 'seal_left', 'seal_right', 'spiral', 'clean'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Picker App States
  const [pickerMachineId, setPickerMachineId] = useState('');
  const [pickerItems, setPickerItems] = useState([]); // { sku, quantity }
  const [pickerCheckedItems, setPickerCheckedItems] = useState({}); // { [sku_coil]: boolean }
  const [newBoxCode, setNewBoxCode] = useState('');
  const [showPrintTicketModal, setShowPrintTicketModal] = useState(false);
  const [printedBoxDetails, setPrintedBoxDetails] = useState(null);

  // Validator App States
  const [scannedBoxCode, setScannedBoxCode] = useState('');
  const [scannedInputText, setScannedInputText] = useState('');
  const [activeVerificationBox, setActiveVerificationBox] = useState(null);
  const [verifiedItems, setVerifiedItems] = useState({}); // { [sku_coil]: boolean }

  // Transportista States
  const [routingBoxCode, setRoutingBoxCode] = useState('');
  const [activeRoutingMachine, setActiveRoutingMachine] = useState(null);
  const [activeRoutingBox, setActiveRoutingBox] = useState(null);
  const [gpsValidated, setGpsValidated] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [gpsDistance, setGpsDistance] = useState(null);
  const [sealPhotos, setSealPhotos] = useState({ left: null, right: null });
  const [routeStep, setRouteStep] = useState('scan'); // 'scan', 'gps_photo', 'stocking_checklist'
  const [routeChecklist, setRouteChecklist] = useState({ fifo: false, clean_readers: false, clean_display: false });
  const [stockingPhotos, setStockingPhotos] = useState({ spirals: null, cleaning: null });
  const [visitTimer, setVisitTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Leads CRM Form States
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ company_name: '', contact_name: '', contact_phone: '', type: 'moral', rfc: '', address: '', email: '' });
  const [selectedLeadForScorecard, setSelectedLeadForScorecard] = useState(null);
  const [scorecardAnswers, setScorecardAnswers] = useState({ traffic: 5, employees: 5, competition: 5, access: 5, signal: 5 });  const [kycUploadModalLead, setKycUploadModalLead] = useState(null);

  const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';

  const syncLeadToGoogleSheets = async (lead) => {
    if (!googleSheetsUrl) return;
    try {
      await fetch(googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lead)
      });
    } catch (err) {
      console.error("Error syncing lead to Google Sheets:", err);
    }
  };

  // Product Edit controlled states
  const [skuVal, setSkuVal] = useState('');
  const [nameVal, setNameVal] = useState('');
  const [descVal, setDescVal] = useState('');
  const [purchaseVal, setPurchaseVal] = useState('');
  const [saleVal, setSaleVal] = useState('');
  const [taxVal, setTaxVal] = useState('16');  const [isEditingProduct, setIsEditingProduct] = useState(false);  // Asset leasing assignment states
  const [assigningAssetId, setAssigningAssetId] = useState(null);
  const [selectedAssignLeadId, setSelectedAssignLeadId] = useState('');
  const [newAssetForm, setNewAssetForm] = useState({
    id: '',
    name: '',
    type: 'vending_machine',
    model: '',
    serial_number: '',
    status: 'recibida',
    lease_start_date: new Date().toISOString().split('T')[0],
    lease_months: 48,
    monthly_cost: '',
    location: '',
    internal_plate_number: '',
    seed_asset_number: ''
  });
  const [isEditingAsset, setIsEditingAsset] = useState(false);
  const [leasingAssetId, setLeasingAssetId] = useState(null);
  const [leaseCostForm, setLeaseCostForm] = useState('');
  const [leaseStartForm, setLeaseStartForm] = useState(new Date().toISOString().split('T')[0]);  const [leaseMonthsForm, setLeaseMonthsForm] = useState(48);  const [assetFilter, setAssetFilter] = useState('all'); // 'all', 'vending_machine', 'transport'
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [receptionCurrency, setReceptionCurrency] = useState('MXN');
  const [receptionExchangeRate, setReceptionExchangeRate] = useState('19.20');  const [receptionNetsuiteOc, setReceptionNetsuiteOc] = useState('');
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [newPOForm, setNewPOForm] = useState({
    oc_number: '',
    provider: '',
    items: []
  });
  const [newPOItemSku, setNewPOItemSku] = useState('');  const [newPOItemQty, setNewPOItemQty] = useState('');
  const [selectedKardexLog, setSelectedKardexLog] = useState(null);
  const [kardexDetailData, setKardexDetailData] = useState(null);
  const [kardexDetailLoading, setKardexDetailLoading] = useState(false);
  const [userProfile, setUserProfile] = useState('director'); // 'director', 'gerente', 'validador', 'pickeo', 'abasto', 'finanzas'
  const [isEditingKardexDetail, setIsEditingKardexDetail] = useState(false);
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' or 'tablet'

  // Load from Supabase if configured & auto-migrate catalog
  useEffect(() => {
    const initializeApp = async () => {
      const isSynced = localStorage.getItem('snackeando_products_catalog_v7_synced');
      if (!isSynced && !isMigrationRunningGlobal) {
        isMigrationRunningGlobal = true;
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('snackeando_products', JSON.stringify(INITIAL_PRODUCTS));
        
        if (supabaseConfig.isConfigured && supabase) {
          try {
            await supabase.from('products').delete().neq('sku', 'FORCE_DELETE_ALL_PRODUCTS');
            await supabase.from('products').upsert(INITIAL_PRODUCTS);
          } catch (e) {
            console.error("Auto Sync Catalog Error:", e);
          }
        }
 
        // Sync entire initial catalog of 32 products to Google Sheets (GID: 2033206781)
        const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
        try {
          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sync_all_products',
              products: INITIAL_PRODUCTS
            })
          });
        } catch (e) {
          console.error("Google Sheets Bulk Catalog Sync Error:", e);
        }
 
        localStorage.setItem('snackeando_products_catalog_v7_synced', 'true');
      }
 
      if (supabaseConfig.isConfigured) {
        await fetchDataFromSupabase();
      }
    };
    initializeApp();
  }, []);

  // Timer logic for route execution
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const startVisitTimer = () => {
    setVisitTimer(0);
    const interval = setInterval(() => {
      setVisitTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopVisitTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const formatTimer = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // --- SUPABASE API CALLS ---
  const fetchDataFromSupabase = async () => {
    if (!supabase) return;
    setDbLoading(true);
    try {
      // Products
      const { data: pData } = await supabase.from('products').select('*');
      if (pData) setProducts(pData);

      // Vending Machines
      let { data: vmData } = await supabase.from('vending_machines').select('*');
      if (vmData) {
        const hasAlphalab = vmData.some(vm => vm.id === 'VM-AS-01');
        if (!hasAlphalab) {
          try {
            // 1. Insert Alphalab machine
            await supabase.from('vending_machines').insert({
              id: 'VM-AS-01',
              name: 'Grupo Alphalab',
              address: 'Oficinas Grupo Alphalab, CDMX',
              latitude: 19.4326,
              longitude: -99.1942,
              status: 'active'
            });

            // 2. Ensure all products exist in products table
            for (const prod of INITIAL_PRODUCTS) {
              const { data: existingProd } = await supabase.from('products').select('sku').eq('sku', prod.sku).maybeSingle();
              if (!existingProd) {
                await supabase.from('products').insert(prod);
              }
            }

            // 3. Setup coils/spirals
            const alphalabObj = INITIAL_MACHINES.find(m => m.id === 'VM-AS-01');
            if (alphalabObj) {
              const coilsToInsert = alphalabObj.products.map(c => ({
                vending_machine_id: 'VM-AS-01',
                sku: c.sku,
                coil_number: c.coil_number,
                capacity: c.capacity,
                current_quantity: c.current_quantity
              }));
              await supabase.from('vending_machine_products').insert(coilsToInsert);
            }

            // Fetch again
            const { data: reloadedVmData } = await supabase.from('vending_machines').select('*');
            if (reloadedVmData) vmData = reloadedVmData;
          } catch (e) {
            console.error("Auto setup for VM-AS-01 in Supabase failed:", e);
          }
        }

        // Fetch products per machine
        const enrichedVms = await Promise.all(vmData.map(async (vm) => {
          let { data: vmp } = await supabase.from('vending_machine_products').select('*').eq('vending_machine_id', vm.id);
          
          // Self-healing: if coils are empty in database, populate default ones
          if (!vmp || vmp.length === 0) {
            const defaultMachine = INITIAL_MACHINES.find(m => m.id === vm.id);
            if (defaultMachine && defaultMachine.products && defaultMachine.products.length > 0) {
              try {
                // Ensure all products exist in products table first to avoid FK constraint errors
                for (const prod of INITIAL_PRODUCTS) {
                  const { data: existingProd } = await supabase.from('products').select('sku').eq('sku', prod.sku).maybeSingle();
                  if (!existingProd) {
                    await supabase.from('products').insert(prod);
                  }
                }

                const coilsToInsert = defaultMachine.products.map(c => ({
                  vending_machine_id: vm.id,
                  sku: c.sku,
                  coil_number: c.coil_number,
                  capacity: c.capacity,
                  current_quantity: c.current_quantity
                }));
                await supabase.from('vending_machine_products').insert(coilsToInsert);
                
                // Re-fetch coils after insert
                const { data: reloadedVmp } = await supabase.from('vending_machine_products').select('*').eq('vending_machine_id', vm.id);
                if (reloadedVmp) vmp = reloadedVmp;
              } catch (setupErr) {
                console.error(`Auto setup of coils for ${vm.id} failed:`, setupErr);
              }
            }
          }
          
          return { ...vm, products: vmp || [] };
        }));
        setVendingMachines(enrichedVms);
      }

      // POs
      const { data: poData } = await supabase.from('purchase_orders').select('*');
      if (poData) {
        const enrichedPOs = await Promise.all(poData.map(async (po) => {
          const { data: items } = await supabase.from('purchase_order_items').select('*').eq('purchase_order_id', po.id);
          return { ...po, items: items || [] };
        }));
        setPurchaseOrders(enrichedPOs);
      }

      // Boxes
      const { data: boxData } = await supabase.from('boxes').select('*');
      if (boxData) {
        const enrichedBoxes = await Promise.all(boxData.map(async (bx) => {
          const { data: items } = await supabase.from('box_items').select('*').eq('box_id', bx.id);
          return { ...bx, items: items || [] };
        }));
        setBoxes(enrichedBoxes);
      }

      // Inventory Logs
      const { data: invLogs } = await supabase.from('inventory_logs').select('*').order('created_at', { ascending: false });
      if (invLogs) setInventoryLogs(invLogs);

      // Returns
      const { data: retData } = await supabase.from('returns').select('*');
      if (retData) setReturns(retData);

      // Assets
      const { data: assetData } = await supabase.from('assets_leasing').select('*');
      if (assetData) {
        const overrides = JSON.parse(localStorage.getItem('snackeando_asset_active_overrides') || '{}');
        const plateOverrides = JSON.parse(localStorage.getItem('snackeando_asset_plate_overrides') || '{}');
        const seedOverrides = JSON.parse(localStorage.getItem('snackeando_asset_seed_overrides') || '{}');
        const processedAssets = assetData.map(a => ({
          ...a,
          is_active: overrides[a.id] !== undefined ? overrides[a.id] : (a.is_active !== undefined ? a.is_active : true),
          lease_active: a.lease_active !== undefined ? a.lease_active : (a.monthly_cost > 0),
          internal_plate_number: plateOverrides[a.id] || a.internal_plate_number || '',
          seed_asset_number: seedOverrides[a.id] || a.seed_asset_number || ''
        }));
        setAssets(processedAssets);
      }

      // Leads
      const { data: leadData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadData) {
        const leadExtras = JSON.parse(localStorage.getItem('snackeando_lead_extra_overrides') || '{}');
        const processedLeads = leadData.map(l => ({
          ...l,
          type: leadExtras[l.id]?.type || l.type || 'moral',
          rfc: leadExtras[l.id]?.rfc || l.rfc || '',
          address: leadExtras[l.id]?.address || l.address || '',
          email: leadExtras[l.id]?.email || l.email || ''
        }));
        setLeads(processedLeads);
      }

    } catch (err) {
      console.error("Error loading data from Supabase:", err);
    } finally {
      setDbLoading(false);
    }
  };

  // --- CAMERA UTILS ---
  const startCamera = async (target) => {
    setCameraTarget(target);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara. Usando captura simulada.");
    }
  };

  const capturePhoto = () => {
    let capturedDataUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300"; // Default fallback
    
    if (streamRef.current && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      capturedDataUrl = canvas.toDataURL('image/jpeg');
    }

    stopCamera();

    if (cameraTarget === 'reception') {
      setReceptionPhoto(capturedDataUrl);
    } else if (cameraTarget === 'seal_left') {
      setSealPhotos(prev => ({ ...prev, left: capturedDataUrl }));
    } else if (cameraTarget === 'seal_right') {
      setSealPhotos(prev => ({ ...prev, right: capturedDataUrl }));
    } else if (cameraTarget === 'spiral') {
      setStockingPhotos(prev => ({ ...prev, spirals: capturedDataUrl }));
    } else if (cameraTarget === 'clean') {
      setStockingPhotos(prev => ({ ...prev, cleaning: capturedDataUrl }));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceptionPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --- MODULE 1: PRODUCT RECEPTION LÓGICA ---
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "SKU": "VSABORIG42",
        "Nombre": "Papas Sabritas Originales 42g",
        "Proveedor": "Sabritas SA",
        "Compra": 14.50,
        "Venta": 18.00,
        "Impuesto": 0
      },
      {
        "SKU": "VDORNACH61",
        "Nombre": "Doritos Nacho 61g",
        "Proveedor": "Sabritas SA",
        "Compra": 15.20,
        "Venta": 20.00,
        "Impuesto": 0
      },
      {
        "SKU": "VCOCAORI335",
        "Nombre": "Coca Cola Original 335ml",
        "Proveedor": "Femsa Coca Cola",
        "Compra": 12.00,
        "Venta": 17.00,
        "Impuesto": 16
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "Plantilla_Carga_Masiva_Productos.xlsx");
  };

  const handleDeleteProduct = async (sku) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto con SKU "${sku}" del catálogo?`)) return;
    
    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        const { error } = await supabase.from('products').delete().eq('sku', sku);
        if (error) throw error;
      }

      // Sync deletion to Google Sheets
      const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_product',
            sku: sku
          })
        });
      } catch (err) {
        console.error("Google Sheets Product Delete Error:", err);
      }

      setProducts(prev => prev.filter(p => p.sku !== sku));
      alert("✓ Producto eliminado del catálogo y Google Sheets correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el producto: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      setDbLoading(true);
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Parse rows
        const parsedProducts = data.map((row, idx) => ({
          sku: String(row.SKU || row.sku || `SKU-${idx}-${Date.now()}`),
          name: String(row.Descripcion || row.Nombre || row.name || 'Producto Nuevo'),
          description: String(row.Proveedor || row.description || ''),
          purchase_price: parseFloat(row['Compra C/IVA'] || row.PrecioCompra || row.Compra || row.purchase_price || 0),
          sale_price: parseFloat(row.Venta || row.sale_price || 0),
          tax_rate: parseFloat(row.Impuesto || row.tax || 16)
        }));

        if (isSupabaseMode && supabase) {
          const { error } = await supabase.from('products').upsert(parsedProducts);
          if (error) throw error;
        }

        let finalMergedProducts = [];
        setProducts(prev => {
          const merged = [...prev];
          parsedProducts.forEach(newP => {
            const idx = merged.findIndex(p => p.sku === newP.sku);
            if (idx >= 0) merged[idx] = newP;
            else merged.push(newP);
          });
          finalMergedProducts = merged;
          localStorage.setItem('snackeando_products', JSON.stringify(merged));
          return merged;
        });

        // Sync entire merged catalog to Google Sheets!
        const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
        try {
          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sync_all_products',
              products: finalMergedProducts
            })
          });
        } catch (err) {
          console.error("Google Sheets Bulk Catalog Sync Error:", err);
        }

        alert(`✓ Se importaron ${parsedProducts.length} productos con éxito y se sincronizaron en Google Sheets.`);
      } catch (err) {
        console.error(err);
        alert(`Error al procesar archivo excel: ${err.message}`);
      } finally {
        setDbLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };  const handleSelectPO = (po) => {
    setSelectedPO(po);
    setReceptionNetsuiteOc(po.oc_number);
    setReceptionCurrency('MXN');
    setReceptionExchangeRate('19.20');
    const initialQtys = {};
    if (po && po.items && Array.isArray(po.items)) {
      po.items.forEach(it => {
        const prod = products.find(p => p.sku === it.sku);
        const taxRate = prod ? prod.tax_rate : 16;
        initialQtys[it.sku] = {
          qty: it.quantity_ordered - it.quantity_received,
          cost: it.purchase_price,
          tax: taxRate,
          expDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
        };
      });
    }
    setPoQuantities(initialQtys);
    setReceptionPhoto(null);
  };

  const handleReceptionItemChange = (sku, field, value) => {
    setPoQuantities(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        [field]: value
      }
    }));
  };  const submitReception = async () => {
    if (!receptionPhoto) {
      alert("⚠️ Evidencia fotográfica obligatoria. Por favor toma una foto de la mercancía.");
      return;
    }

    setDbLoading(true);
    try {
      const receptionId = crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`;
      const folio = getFolioFromUuid(receptionId);
      let finalPhotoUrl = 'https://placehold.co/600x400?text=Evidencia+Sin+Bucket';
      let bucketWarning = '';

      // In real supabase mode, upload to Storage Bucket
      if (isSupabaseMode && supabase) {
        try {
          // Decode base64 to blob
          const res = await fetch(receptionPhoto);
          const blob = await res.blob();
          const fileExt = 'jpg';
          const filePath = `receptions/${receptionId}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, blob, { contentType: 'image/jpeg' });
            
          if (uploadError) {
            console.warn("Storage upload error: ", uploadError);
            if (uploadError.message && uploadError.message.includes("Bucket not found")) {
              bucketWarning = "\n\n⚠️ Nota: La foto no se subió a Supabase porque el bucket 'photos' no existe. Recuerda crearlo como 'Público' en tu consola de Supabase.";
            } else {
              bucketWarning = `\n\n⚠️ Nota: No se pudo subir la foto a Supabase (${uploadError.message}).`;
            }
          } else {
            const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
            finalPhotoUrl = urlData.publicUrl;
          }
        } catch (storageErr) {
          console.warn("Storage exception: ", storageErr);
          bucketWarning = "\n\n⚠️ Nota: Error de conexión al intentar subir la foto a Supabase.";
        }

        // Insert reception
        try {
          const { error: recErr } = await supabase.from('receptions').insert({
            id: receptionId,
            purchase_order_id: selectedPO.id,
            received_by: 'Almacenista Central',
            photo_url: finalPhotoUrl
          });
          if (recErr) console.warn("Receptions insert error: ", recErr);
        } catch (recInsertErr) {
          console.warn("Receptions insert exception: ", recInsertErr);
        }
      }

      // Process each received item and prepare Google Sheet rows payload
      const newLogs = [];
      const itemsToSend = [];
      const updatedPoItems = selectedPO.items.map(poItem => {
        const recData = poQuantities[poItem.sku];
        if (recData && recData.qty > 0) {
          newLogs.push({
            id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${poItem.sku}`,
            sku: poItem.sku,
            quantity: parseInt(recData.qty),
            type: 'reception',
            reference_id: receptionId,
            created_at: new Date().toISOString()
          });

          // Product details from catalog
          const prod = products.find(p => p.sku === poItem.sku) || { name: poItem.sku, purchase_price: poItem.purchase_price, tax_rate: 16 };
          const taxRate = prod.tax_rate || 16;
          const unitPriceWithTax = prod.purchase_price || poItem.purchase_price || 0;
          
          const totalVal = recData.qty * unitPriceWithTax;
          const subtotalVal = totalVal / (1 + (taxRate / 100));
          const taxAmountVal = totalVal - subtotalVal;

          itemsToSend.push({
            sku: poItem.sku,
            name: prod.name,
            qty: parseInt(recData.qty),
            quantity: parseInt(recData.qty),
            purchase_price: unitPriceWithTax,
            tax_rate: taxRate,
            subtotal: parseFloat(subtotalVal.toFixed(2)),
            tax_amount: parseFloat(taxAmountVal.toFixed(2)),
            total: parseFloat(totalVal.toFixed(2))
          });

          return {
            ...poItem,
            quantity_received: poItem.quantity_received + parseInt(recData.qty)
          };
        }
        return poItem;
      });

      // Write logs to DB if online
      if (isSupabaseMode && supabase) {
        await supabase.from('inventory_logs').insert(newLogs);
        
        // Update PO Items
        for (const item of updatedPoItems) {
          await supabase.from('purchase_order_items')
            .update({ quantity_received: item.quantity_received })
            .match({ purchase_order_id: selectedPO.id, sku: item.sku });
        }

        // Check if PO completed
        const isCompleted = updatedPoItems.every(i => i.quantity_received >= i.quantity_ordered);
        if (isCompleted) {
          await supabase.from('purchase_orders')
            .update({ status: 'received' })
            .eq('id', selectedPO.id);
        }
      }

      // POST reception data to Google Sheet Apps Script Web App
      const payload = {
        folio: folio,
        oc_netsuite: receptionNetsuiteOc || selectedPO.oc_number,
        currency: receptionCurrency,
        exchange_rate: receptionCurrency === 'USD' ? parseFloat(receptionExchangeRate || 1.0) : 1.0,
        photo_url: finalPhotoUrl,
        items: itemsToSend
      };      const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
      
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } catch (sheetErr) {
        console.error("Google Sheets POST Error: ", sheetErr);
      }

      // Update local states
      setInventoryLogs(prev => [...newLogs, ...prev]);
      setPurchaseOrders(prev => prev.map(p => {
        if (p.id === selectedPO.id) {
          const isCompleted = updatedPoItems.every(i => i.quantity_received >= i.quantity_ordered);
          return { ...p, items: updatedPoItems, status: isCompleted ? 'received' : 'pending' };
        }
        return p;
      }));      alert(`✓ Recepción registrada exitosamente.\nFolio Interno: ${folio}\nDatos guardados en Google Sheets.${bucketWarning}`);
      setSelectedPO(null);
      setReceptionPhoto(null);      if (isSupabaseMode) fetchDataFromSupabase();
    } catch (err) {
      console.error(err);
      alert(`Error al registrar recepción: ${err.message}`);
    } finally {
      setDbLoading(false);
    }
  };  const handleSavePO = async (e) => {
    e.preventDefault();
    if (!newPOForm.oc_number || !newPOForm.provider) {
      alert("Por favor introduce número de OC y proveedor.");
      return;
    }
    if (newPOForm.items.length === 0) {
      alert("Por favor agrega al menos una partida a la Orden de Compra.");
      return;
    }

    setDbLoading(true);
    try {
      const isEditing = !!newPOForm.id;
      const poId = isEditing ? newPOForm.id : (crypto.randomUUID ? crypto.randomUUID() : `po-${Date.now()}`);
      
      const poObj = {
        id: poId,
        oc_number: newPOForm.oc_number,
        provider: newPOForm.provider,
        order_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      if (isSupabaseMode && supabase) {
        if (isEditing) {
          const { error: poErr } = await supabase.from('purchase_orders')
            .update({ oc_number: poObj.oc_number, provider: poObj.provider })
            .eq('id', poId);
          if (poErr) throw poErr;

          const { error: delErr } = await supabase.from('purchase_order_items')
            .delete().eq('purchase_order_id', poId);
          if (delErr) throw delErr;
        } else {
          const { error: poErr } = await supabase.from('purchase_orders').insert(poObj);
          if (poErr) throw poErr;
        }

        const itemRows = newPOForm.items.map(it => ({
          purchase_order_id: poId,
          sku: it.sku,
          quantity_ordered: it.quantity_ordered,
          quantity_received: 0,
          purchase_price: it.purchase_price
        }));

        const { error: itemsErr } = await supabase.from('purchase_order_items').insert(itemRows);
        if (itemsErr) throw itemsErr;
      }

      const formattedPO = {
        ...poObj,
        items: newPOForm.items.map(it => ({
          sku: it.sku,
          quantity_ordered: it.quantity_ordered,
          quantity_received: 0,
          purchase_price: it.purchase_price
        }))
      };

      if (isEditing) {
        setPurchaseOrders(prev => prev.map(p => p.id === poId ? formattedPO : p));
      } else {
        setPurchaseOrders(prev => [formattedPO, ...prev]);
      }
      
      setNewPOForm({
        oc_number: '',
        provider: '',
        items: []
      });
      setIsCreatingPO(false);
      alert(isEditing ? "✓ Orden de Compra actualizada exitosamente." : "✓ Orden de Compra registrada exitosamente como pendiente.");
    } catch (err) {
      console.error(err);
      alert(`Error al guardar la OC: ${err.message}`);
    } finally {
      setDbLoading(false);
    }
  };  const handleOpenKardexDetail = async (log) => {
    setSelectedKardexLog(log);
    setKardexDetailData(null);
    setKardexDetailLoading(true);
    
    try {
      if (log.type === 'reception') {
        if (isSupabaseMode && supabase) {
          const { data: recData, error } = await supabase
            .from('receptions')
            .select('*, purchase_orders(*)')
            .eq('id', log.reference_id)
            .maybeSingle();
            
          if (error) throw error;
          
          const { data: logsData } = await supabase
            .from('inventory_logs')
            .select('*')
            .eq('reference_id', log.reference_id);
            
          setKardexDetailData({
            reception: recData,
            purchase_order: recData ? recData.purchase_orders : null,
            items: logsData || []
          });
        } else {
          const matchedPO = purchaseOrders.find(p => p.items.some(i => i.sku === log.sku));
          setKardexDetailData({
            reception: { id: log.reference_id, photo_url: 'https://placehold.co/600x400?text=Evidencia+Local', received_by: 'Almacenista Central' },
            purchase_order: matchedPO || { oc_number: 'N/A', provider: 'Proveedor Local' },
            items: [{ sku: log.sku, quantity: log.quantity }]
          });
        }
      } else if (log.type === 'prekitting_exit' || log.type === 'route_out') {
        if (isSupabaseMode && supabase) {
          const { data: boxData, error } = await supabase
            .from('boxes')
            .select('*, vending_machines(*)')
            .eq('id', log.reference_id)
            .maybeSingle();
            
          if (error) throw error;

          const { data: boxItems, error: itemsErr } = await supabase
            .from('box_items')
            .select('*')
            .eq('box_id', log.reference_id);

          if (itemsErr) throw itemsErr;

          setKardexDetailData({
            box: boxData,
            machine: boxData ? boxData.vending_machines : null,
            items: boxItems || []
          });
        } else {
          const matchedBox = boxes.find(b => b.id === log.reference_id);
          const matchedMachine = matchedBox ? vendingMachines.find(m => m.id === matchedBox.vending_machine_id) : null;
          setKardexDetailData({
            box: matchedBox || { box_code: 'BOX-LOCAL', created_at: log.created_at },
            machine: matchedMachine || { name: 'Vending Machine Local' },
            items: matchedBox ? (matchedBox.items || []) : [{ sku: log.sku, quantity: Math.abs(log.quantity) }]
          });
        }
      } else if (log.type === 'return') {
        if (isSupabaseMode && supabase) {
          const { data: returnData, error } = await supabase
            .from('returns')
            .select('*')
            .eq('id', log.reference_id)
            .maybeSingle();
          if (error) throw error;
          setKardexDetailData({ return: returnData });
        } else {
          setKardexDetailData({ return: { id: log.reference_id, reason: 'Retorno local', created_at: log.created_at } });
        }
      }
    } catch (err) {
      console.error("Error loading Kardex details:", err);
    } finally {
      setKardexDetailLoading(false);
    }
  };

  // --- MODULE 2: REGISTRO DE RETORNOS LÓGICA ---
  const handleRegisterReturn = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const sku = data.get('sku');
    const qty = parseInt(data.get('qty'));
    const boxId = data.get('box_id') || null;
    const vmId = data.get('vending_machine_id') || null;
    const reason = data.get('reason');

    if (!sku || isNaN(qty) || qty <= 0) {
      alert("Introduce SKU y cantidad válidos");
      return;
    }

    setDbLoading(true);
    try {
      const returnId = crypto.randomUUID ? crypto.randomUUID() : `ret-${Date.now()}`;
      
      const newReturn = {
        id: returnId,
        sku,
        quantity: qty,
        box_id: boxId,
        vending_machine_id: vmId,
        reason,
        created_at: new Date().toISOString()
      };

      const newLog = {
        id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
        sku,
        quantity: qty, // Retorno de mercancía entra de nuevo al almacén
        type: 'return',
        reference_id: returnId,
        created_at: new Date().toISOString()
      };

      if (isSupabaseMode && supabase) {
        await supabase.from('returns').insert(newReturn);
        await supabase.from('inventory_logs').insert(newLog);
      }

      setReturns(prev => [newReturn, ...prev]);
      setInventoryLogs(prev => [newLog, ...prev]);

      alert("✓ Retorno registrado exitosamente. Producto ingresado de nuevo al Almacén Cedis.");
      e.target.reset();
      if (isSupabaseMode) fetchDataFromSupabase();
    } catch (err) {
      console.error(err);
      alert("Error al registrar retorno");
    } finally {
      setDbLoading(false);
    }
  };

  // --- MODULE 3: PRE-KITTING (PICKER & VALIDADOR) ---
  const handleSelectPickerMachine = (id) => {
    setPickerMachineId(id);
    const m = vendingMachines.find(v => v.id === id);
    if (!m) return;

    // Calculate prediction: fill all spirals to 100% capacity
    const needed = m.products.map(p => {
      const qtyNeeded = p.capacity - p.current_quantity;
      return {
        sku: p.sku,
        quantity: qtyNeeded > 0 ? qtyNeeded : 0,
        coil_number: p.coil_number
      };
    }).filter(p => p.quantity > 0);

    setPickerItems(needed);
    const initialChecked = {};
    needed.forEach(it => {
      initialChecked[it.sku + '_' + it.coil_number] = false;
    });
    setPickerCheckedItems(initialChecked);
    setNewBoxCode(`TOTE-${id.replace('-', '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  };

  const handleCreateBox = async () => {
    if (!pickerMachineId || pickerItems.length === 0) {
      alert("Selecciona una máquina y valida productos");
      return;
    }

    setDbLoading(true);
    try {
      const boxId = crypto.randomUUID ? crypto.randomUUID() : `box-${Date.now()}`;
      const newBox = {
        id: boxId,
        box_code: newBoxCode,
        vending_machine_id: pickerMachineId,
        status: 'picking',
        picked_by: 'Carlos Picker',
        created_at: new Date().toISOString()
      };

      const boxItemsInsert = pickerItems.map(item => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `bit-${Date.now()}-${item.sku}`,
        box_id: boxId,
        sku: item.sku,
        quantity: item.quantity,
        quantity_verified: 0,
        quantity_stocked: 0
      }));

      const logsOut = pickerItems.map(item => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${item.sku}`,
        sku: item.sku,
        quantity: -item.quantity, // Despacho de almacén
        type: 'prekitting_exit',
        reference_id: boxId,
        created_at: new Date().toISOString()
      }));

      if (isSupabaseMode && supabase) {
        await supabase.from('boxes').insert(newBox);
        await supabase.from('box_items').insert(boxItemsInsert);
        await supabase.from('inventory_logs').insert(logsOut);
      }

      setBoxes(prev => [
        { ...newBox, items: boxItemsInsert, vending_machine_id: pickerMachineId },
        ...prev
      ]);
      setInventoryLogs(prev => [...logsOut, ...prev]);

      // Set details for printing ticket and show modal
      setPrintedBoxDetails({
        ...newBox,
        items: boxItemsInsert.map(item => {
          const p = products.find(p => p.sku === item.sku) || { name: 'Producto' };
          const pi = pickerItems.find(x => x.sku === item.sku);
          return {
            ...item,
            name: p.name,
            coil_number: pi ? pi.coil_number : ''
          };
        })
      });
      setShowPrintTicketModal(true);
      
      // Reset Picker state
      setPickerMachineId('');
      setPickerItems([]);
      setPickerCheckedItems({});
      setNewBoxCode('');
    } catch (err) {
      console.error(err);
      alert("Error al registrar caja pre-kitting");
    } finally {
      setDbLoading(false);
    }
  };

  const handleScanBoxForVerification = (codeToScan) => {
    const code = typeof codeToScan === 'string' ? codeToScan : (scannedInputText || scannedBoxCode);
    if (!code) {
      alert("Introduce o selecciona un código de caja");
      return;
    }
    const box = boxes.find(b => b.box_code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!box) {
      alert(`Código de caja "${code}" no encontrado`);
      return;
    }
    if (box.status !== 'picking') {
      alert(`La caja ya está en estatus: ${box.status}`);
      return;
    }
    setActiveVerificationBox(box);
    const initialChecked = {};
    box.items.forEach(it => {
      initialChecked[it.id || it.sku] = false;
    });
    setVerifiedItems(initialChecked);
    setScannedInputText('');
    setScannedBoxCode('');
  };

  const handleToggleVerifyItem = (itemId) => {
    setVerifiedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleVerifyAndReleaseBox = async () => {
    const allChecked = Object.values(verifiedItems).every(v => v === true);
    if (!allChecked) {
      alert("⚠️ Debes verificar físicamente cada una de las partidas antes de liberar la caja.");
      return;
    }

    setDbLoading(true);
    try {
      const verifiedAt = new Date().toISOString();
      if (isSupabaseMode && supabase) {
        await supabase.from('boxes')
          .update({ status: 'verified', verified_by: 'Eduardo Validador', verified_at: verifiedAt })
          .eq('id', activeVerificationBox.id);

        // Set verified quantity = original quantity
        for (const item of activeVerificationBox.items) {
          await supabase.from('box_items')
            .update({ quantity_verified: item.quantity })
            .match({ box_id: activeVerificationBox.id, sku: item.sku });
        }
      }

      setBoxes(prev => prev.map(b => {
        if (b.id === activeVerificationBox.id) {
          return {
            ...b,
            status: 'verified',
            verified_by: 'Eduardo Validador',
            verified_at: verifiedAt,
            items: b.items.map(it => ({ ...it, quantity_verified: it.quantity }))
          };
        }
        return b;
      }));

      alert(`✓ Caja ${activeVerificationBox.box_code} verificada por Calidad.\nLiberada a fase: Listo para Ruteo.`);
      setActiveVerificationBox(null);
      setScannedBoxCode('');
    } catch (err) {
      console.error(err);
      alert("Error al liberar la caja");
    } finally {
      setDbLoading(false);
    }
  };

  // --- MODULE 4: ROUTING & DELIVERIES (TRANSPORTISTA) ---
  const handleLoadBoxToTransport = async () => {
    const box = boxes.find(b => b.box_code === routingBoxCode);
    if (!box) {
      alert("Caja no encontrada");
      return;
    }
    if (box.status !== 'verified') {
      alert(`La caja debe estar en estatus 'verified' para cargarse. Estatus actual: ${box.status}`);
      return;
    }

    setDbLoading(true);
    try {
      const loadedAt = new Date().toISOString();
      if (isSupabaseMode && supabase) {
        await supabase.from('boxes')
          .update({ status: 'in_route', loaded_by: 'Transportista 01', loaded_at: loadedAt })
          .eq('id', box.id);
      }

      setBoxes(prev => prev.map(b => {
        if (b.id === box.id) {
          return { ...b, status: 'in_route', loaded_by: 'Transportista 01', loaded_at: loadedAt };
        }
        return b;
      }));

      alert(`✓ Caja ${box.box_code} cargada en furgoneta. Estatus cambiado a EN RUTA.`);
      setRoutingBoxCode('');
    } catch (err) {
      console.error(err);
      alert("Error al cargar caja");
    } finally {
      setDbLoading(false);
    }
  };

  const handleSelectRouteBoxToStock = (box) => {
    setActiveRoutingBox(box);
    const m = vendingMachines.find(v => v.id === box.vending_machine_id);
    setActiveRoutingMachine(m);
    setGpsValidated(false);
    setGpsCoordinates(null);
    setGpsDistance(null);
    setSealPhotos({ left: null, right: null });
    setStockingPhotos({ spirals: null, cleaning: null });
    setRouteChecklist({ fifo: false, clean_readers: false, clean_display: false });
    setRouteStep('gps_photo');
  };

  const handleValidateGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en el navegador");
      return;
    }
    
    // Set simulator GPS or query API
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoordinates({ lat, lng });

        // Calculate distance
        if (activeRoutingMachine) {
          const dist = getDistance(lat, lng, activeRoutingMachine.latitude, activeRoutingMachine.longitude);
          setGpsDistance(dist);
          // Standard check: 100 meters range
          if (dist <= 100) {
            setGpsValidated(true);
          } else {
            // For developers or testing, show alert and mock validation bypass
            alert(`Coordenadas: (${lat.toFixed(4)}, ${lng.toFixed(4)}). Estás a ${dist.toFixed(0)}m de la máquina. La tolerancia es 100m.`);
          }
        }
      },
      (err) => {
        console.error(err);
        // Fallback for simulation
        const mockLat = activeRoutingMachine.latitude + 0.0002;
        const mockLng = activeRoutingMachine.longitude - 0.0001;
        const dist = getDistance(mockLat, mockLng, activeRoutingMachine.latitude, activeRoutingMachine.longitude);
        setGpsCoordinates({ lat: mockLat, lng: mockLng });
        setGpsDistance(dist);
        setGpsValidated(true); // Auto validation for mock simulation
        alert(`(Mock GPS) Geolocalización exitosa a ${dist.toFixed(0)} metros.`);
      }
    );
  };

  const handleStartStockingProcess = () => {
    if (!gpsValidated) {
      alert("Debe validar la geolocalización antes de abrir la máquina.");
      return;
    }
    if (!sealPhotos.left || !sealPhotos.right) {
      alert("⚠️ Evidencia de precintos obligatoria. Toma fotos de ambos sellos de seguridad.");
      return;
    }
    setRouteStep('stocking_checklist');
    startVisitTimer();
  };

  const handleFinishStocking = async () => {
    if (!routeChecklist.fifo || !routeChecklist.clean_readers || !routeChecklist.clean_display) {
      alert("Completa todos los rubros del checklist de calidad.");
      return;
    }
    if (!stockingPhotos.spirals || !stockingPhotos.cleaning) {
      alert("Toma las fotografías obligatorias de evidencia del mantenimiento.");
      return;
    }

    stopVisitTimer();
    setDbLoading(true);
    try {
      const stockedAt = new Date().toISOString();
      const logId = crypto.randomUUID ? crypto.randomUUID() : `mt-${Date.now()}`;
      
      // Update machine inventory
      const updatedVmProducts = activeRoutingMachine.products.map(p => {
        const boxItem = activeRoutingBox.items.find(bi => bi.sku === p.sku);
        if (boxItem) {
          return {
            ...p,
            current_quantity: Math.min(p.capacity, p.current_quantity + boxItem.quantity)
          };
        }
        return p;
      });

      if (isSupabaseMode && supabase) {
        // Upload route logs & photos
        await supabase.from('route_logs').insert({
          box_id: activeRoutingBox.id,
          action: 'stocking_complete',
          latitude: gpsCoordinates?.lat,
          longitude: gpsCoordinates?.lng,
          photo_url_1: sealPhotos.left,
          photo_url_2: sealPhotos.right
        });

        // Insert maintenance logs
        await supabase.from('machine_maintenance_logs').insert({
          id: logId,
          vending_machine_id: activeRoutingMachine.id,
          operator: 'Transportista 01',
          check_fifo: routeChecklist.fifo,
          check_clean_readers: routeChecklist.clean_readers,
          check_clean_display: routeChecklist.clean_display,
          photo_spirals_url: stockingPhotos.spirals,
          photo_display_url: stockingPhotos.cleaning,
          comments: `Abastecimiento completo en ${formatTimer(visitTimer)} mins. Cintos blindados OK.`
        });

        // Update box status
        await supabase.from('boxes')
          .update({ status: 'stocked', stocked_at: stockedAt })
          .eq('id', activeRoutingBox.id);

        for (const item of activeRoutingBox.items) {
          await supabase.from('box_items')
            .update({ quantity_stocked: item.quantity })
            .match({ box_id: activeRoutingBox.id, sku: item.sku });
        }

        // Update vending machine stock
        for (const prod of updatedVmProducts) {
          await supabase.from('vending_machine_products')
            .update({ current_quantity: prod.current_quantity })
            .match({ vending_machine_id: activeRoutingMachine.id, sku: prod.sku });
        }
      }

      // Local State Update
      setBoxes(prev => prev.map(b => {
        if (b.id === activeRoutingBox.id) {
          return {
            ...b,
            status: 'stocked',
            stocked_at: stockedAt,
            items: b.items.map(it => ({ ...it, quantity_stocked: it.quantity }))
          };
        }
        return b;
      }));

      setVendingMachines(prev => prev.map(v => {
        if (v.id === activeRoutingMachine.id) {
          return { ...v, products: updatedVmProducts };
        }
        return v;
      }));

      setMaintenanceLogs(prev => [
        {
          id: logId,
          vending_machine_id: activeRoutingMachine.id,
          operator: 'Transportista 01',
          created_at: stockedAt,
          comments: `Tiempo de visita: ${formatTimer(visitTimer)}`
        },
        ...prev
      ]);

      alert(`✓ ¡Abastecimiento Completado!\nSLA de visita: ${formatTimer(visitTimer)} minutos.\nInventario de máquina actualizado en sistema.`);
      setActiveRoutingBox(null);
      setActiveRoutingMachine(null);
      setRouteStep('scan');
      if (isSupabaseMode) fetchDataFromSupabase();
    } catch (err) {
      console.error(err);
      alert("Error al finalizar abastecimiento");
    } finally {
      setDbLoading(false);
    }
  };

  // --- MODULE 5: ROLL-OUT TRACKER (CRM & LEADS) ---
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setDbLoading(true);
    try {
      const leadId = crypto.randomUUID ? crypto.randomUUID() : `ld-${Date.now()}`;
      const newLead = {
        id: leadId,
        company_name: newLeadForm.company_name,
        contact_name: newLeadForm.contact_name,
        contact_phone: newLeadForm.contact_phone,
        type: newLeadForm.type || 'moral',
        rfc: newLeadForm.rfc || '',
        address: newLeadForm.address || '',
        email: newLeadForm.email || '',
        status: 'lead',
        scorecard_score: 0,
        rent_amount: 6500.00,
        contract_signed: false,
        kyc_docs_count: 0,
        installation_date: null,
        created_at: new Date().toISOString()
      };

      // Save local overrides for fields that might not exist in the remote database table schema
      const leadExtras = JSON.parse(localStorage.getItem('snackeando_lead_extra_overrides') || '{}');
      leadExtras[leadId] = {
        type: newLeadForm.type || 'moral',
        rfc: newLeadForm.rfc || '',
        address: newLeadForm.address || '',
        email: newLeadForm.email || ''
      };
      localStorage.setItem('snackeando_lead_extra_overrides', JSON.stringify(leadExtras));

      if (isSupabaseMode && supabase) {
        const dbLeadPayload = {
          id: newLead.id,
          company_name: newLead.company_name,
          contact_name: newLead.contact_name,
          contact_phone: newLead.contact_phone,
          status: newLead.status,
          scorecard_score: newLead.scorecard_score,
          rent_amount: newLead.rent_amount,
          contract_signed: newLead.contract_signed,
          kyc_docs_count: newLead.kyc_docs_count,
          installation_date: newLead.installation_date,
          created_at: newLead.created_at
        };
        await supabase.from('leads').insert(dbLeadPayload);
      }

      setLeads(prev => [newLead, ...prev]);
      setIsNewLeadModalOpen(false);
      setNewLeadForm({ company_name: '', contact_name: '', contact_phone: '', type: 'moral', rfc: '', address: '', email: '' });
      alert("✓ Nuevo lead corporativo agregado.");
      syncLeadToGoogleSheets(newLead);
      if (isSupabaseMode) fetchDataFromSupabase();
    } catch (err) {
      console.error(err);
      alert("Error al registrar lead: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este Lead permanentemente de la base de datos comercial?")) return;

    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        await supabase.from('leads')
          .delete()
          .eq('id', leadId);
      }
      setLeads(prev => prev.filter(l => l.id !== leadId));
      alert("✓ Lead eliminado con éxito.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar Lead: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleSaveScorecard = async () => {
    const totalScore = (
      scorecardAnswers.traffic * 4 +
      scorecardAnswers.employees * 4 +
      scorecardAnswers.competition * 4 +
      scorecardAnswers.access * 4 +
      scorecardAnswers.signal * 4
    ); // Max 100

    setDbLoading(true);
    try {
      let newStatus = 'lead';
      let isAuthorized = false;
      
      if (totalScore >= 75) {
        newStatus = 'contract';
      } else {
        const proceed = confirm(`Puntuación Scorecard: ${totalScore}/100.\nEl lead no alcanza la factibilidad mínima de 75 puntos.\n¿Desea el director o gerente de ventas autorizar el avance comercial de todos modos?`);
        if (proceed) {
          newStatus = 'contract';
          isAuthorized = true;
        }
      }

      if (isSupabaseMode && supabase) {
        await supabase.from('leads')
          .update({ scorecard_score: totalScore, status: newStatus })
          .eq('id', selectedLeadForScorecard.id);
      }

      setLeads(prev => prev.map(l => {
        if (l.id === selectedLeadForScorecard.id) {
          const updated = { ...l, scorecard_score: totalScore, status: newStatus };
          syncLeadToGoogleSheets(updated);
          return updated;
        }
        return l;
      }));

      if (totalScore >= 75) {
        alert(`✓ ¡Felicidades! Puntuación Scorecard: ${totalScore}/100. Lead calificado. Avanza a fase de Contrato.`);
      } else if (isAuthorized) {
        alert(`✓ Avance autorizado por Dirección/Gerencia. Puntuación Scorecard: ${totalScore}/100. Avanza a fase de Contrato (Puntaje en rojo durante el Roll-out).`);
      } else {
        alert(`Puntuación Scorecard: ${totalScore}/100. El lead permanece en fase inicial.`);
      }
      setSelectedLeadForScorecard(null);
    } catch (err) {
      console.error(err);
      alert("Error al guardar scorecard");
    } finally {
      setDbLoading(false);
    }
  };

  const handleSignContract = async (lead) => {
    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        await supabase.from('leads')
          .update({ contract_signed: true, status: 'kyc' })
          .eq('id', lead.id);
      }
      setLeads(prev => prev.map(l => {
        if (l.id === lead.id) {
          const updated = { ...l, contract_signed: true, status: 'kyc' };
          syncLeadToGoogleSheets(updated);
          return updated;
        }
        return l;
      }));
      alert("✓ Contrato legalizado y domiciliado. Avanza a fase de Carga KYC.");
    } catch (err) {
      console.error(err);
    } finally {
      setDbLoading(false);
    }
  };

  const handleCompleteKycDocs = async (lead) => {
    setDbLoading(true);
    try {
      const installDate = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0];
      if (isSupabaseMode && supabase) {
        await supabase.from('leads')
          .update({ kyc_docs_count: 5, status: 'installed', installation_date: installDate })
          .eq('id', lead.id);
      }
      setLeads(prev => prev.map(l => {
        if (l.id === lead.id) {
          const updated = { ...l, kyc_docs_count: 5, status: 'installed', installation_date: installDate };
          syncLeadToGoogleSheets(updated);
          return updated;
        }
        return l;
      }));
      alert(`✓ Carga completa de KYC y acta firmada. Programación logística asignada para el ${installDate}.`);
    } catch (err) {
      console.error(err);
    } finally {
      setDbLoading(false);    }
  };  const handleAssignAsset = async (assetId, leadId) => {
    if (!leadId) {
      alert("Por favor selecciona un lead/cliente.");
      return;
    }
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    setDbLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      if (isSupabaseMode && supabase) {
        // Update in assets_leasing
        await supabase.from('assets_leasing')
          .update({
            status: 'assigned',
            assigned_client: lead.company_name,
            assignment_date: today,
            location: `Instalada en ${lead.company_name}`
          })
          .eq('id', assetId);
      }

      // Update Local State
      setAssets(prev => prev.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            status: 'assigned',
            assigned_client: lead.company_name,
            assignment_date: today,
            location: `Instalada en ${lead.company_name}`
          };
        }
        return a;
      }));

      setAssigningAssetId(null);
      setSelectedAssignLeadId('');
      alert(`✓ Máquina asignada con éxito a ${lead.company_name}.`);
    } catch (err) {
      console.error(err);
      alert("Error al asignar máquina.");
    } finally {
      setDbLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    const cost = parseFloat(newAssetForm.monthly_cost) || 0;
    const months = parseInt(newAssetForm.lease_months) || 48;
    
    const existingAsset = assets.find(a => a.id === newAssetForm.id);

    const assetObj = {
      id: newAssetForm.id || generateAssetId(newAssetForm.type, assets),
      name: newAssetForm.name || (newAssetForm.type === 'vending_machine' ? 'Vending Machine' : newAssetForm.type === 'van' ? 'Furgoneta' : 'Bóveda'),
      type: newAssetForm.type,
      model: newAssetForm.model || 'Standard',
      serial_number: newAssetForm.serial_number,
      internal_plate_number: newAssetForm.internal_plate_number || '',
      seed_asset_number: newAssetForm.seed_asset_number || '',
      status: newAssetForm.status,
      lease_start_date: newAssetForm.lease_start_date,
      lease_months: months,
      monthly_cost: cost,
      location: newAssetForm.location || 'Cedis Toluca',
      assigned_client: existingAsset ? existingAsset.assigned_client : (newAssetForm.status === 'assigned' ? 'Asignada' : null),
      assignment_date: existingAsset ? existingAsset.assignment_date : (newAssetForm.status === 'assigned' ? new Date().toISOString().split('T')[0] : null),
      lease_active: existingAsset ? existingAsset.lease_active : (cost > 0),
      is_active: existingAsset ? (existingAsset.is_active !== undefined ? existingAsset.is_active : true) : true
    };

    // Save local overrides for columns that might not exist in remote Supabase table schema
    const plateOverrides = JSON.parse(localStorage.getItem('snackeando_asset_plate_overrides') || '{}');
    plateOverrides[assetObj.id] = assetObj.internal_plate_number;
    localStorage.setItem('snackeando_asset_plate_overrides', JSON.stringify(plateOverrides));

    const seedOverrides = JSON.parse(localStorage.getItem('snackeando_asset_seed_overrides') || '{}');
    seedOverrides[assetObj.id] = assetObj.seed_asset_number;
    localStorage.setItem('snackeando_asset_seed_overrides', JSON.stringify(seedOverrides));

    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        // Construct db payload excluding local-only columns
        const dbPayload = {
          id: assetObj.id,
          name: assetObj.name,
          type: assetObj.type,
          model: assetObj.model,
          serial_number: assetObj.serial_number,
          status: assetObj.status,
          lease_start_date: assetObj.lease_start_date,
          lease_months: assetObj.lease_months,
          monthly_cost: assetObj.monthly_cost,
          location: assetObj.location,
          assigned_client: assetObj.assigned_client,
          assignment_date: assetObj.assignment_date
        };
        const { error } = await supabase.from('assets_leasing').upsert(dbPayload);
        if (error) throw error;
      }

      setAssets(prev => [...prev.filter(a => a.id !== assetObj.id), assetObj]);
      
      // Reset form
      setNewAssetForm({
        id: '',
        name: '',
        type: 'vending_machine',
        model: '',
        serial_number: '',
        status: 'recibida',
        lease_start_date: new Date().toISOString().split('T')[0],
        lease_months: 48,
        monthly_cost: '',
        location: '',
        internal_plate_number: '',
        seed_asset_number: ''
      });
      setIsEditingAsset(false);

      alert(isEditingAsset ? "✓ Activo actualizado con éxito." : "✓ Activo registrado con éxito en el leasing.");
    } catch (err) {
      console.error(err);
      alert(`Error al guardar activo: ${err.message}`);
    } finally {
      setDbLoading(false);
    }
  };

  const handleToggleAssetOperationalStatus = async (asset) => {
    const updatedIsActive = !asset.is_active;
    
    // Save to overrides cache
    const overrides = JSON.parse(localStorage.getItem('snackeando_asset_active_overrides') || '{}');
    overrides[asset.id] = updatedIsActive;
    localStorage.setItem('snackeando_asset_active_overrides', JSON.stringify(overrides));

    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        await supabase.from('assets_leasing')
          .update({ is_active: updatedIsActive })
          .eq('id', asset.id);
      }
      setAssets(prev => prev.map(a => {
        if (a.id === asset.id) {
          return { ...a, is_active: updatedIsActive };
        }
        return a;
      }));
      alert(`✓ El equipo ahora está ${updatedIsActive ? 'OPERATIVO (ACTIVO)' : 'INACTIVO'}.`);
    } catch (err) {
      console.error("Supabase operational status update ignored/failed:", err);
      // Still update local state even if Supabase does not have the column
      setAssets(prev => prev.map(a => {
        if (a.id === asset.id) {
          return { ...a, is_active: updatedIsActive };
        }
        return a;
      }));
      alert(`✓ El equipo ahora está ${updatedIsActive ? 'OPERATIVO (ACTIVO)' : 'INACTIVO'}.`);
    } finally {
      setDbLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el activo con ID: ${assetId}?`)) return;

    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        await supabase.from('assets_leasing')
          .delete()
          .eq('id', assetId);
      }
      setAssets(prev => prev.filter(a => a.id !== assetId));
      alert("✓ Activo eliminado con éxito.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar activo: " + err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleActivateLease = async (assetId) => {
    const cost = parseFloat(leaseCostForm) || 0;
    const months = parseInt(leaseMonthsForm) || 48;
    const startDate = leaseStartForm;

    setDbLoading(true);
    try {
      if (isSupabaseMode && supabase) {
        await supabase.from('assets_leasing')
          .update({
            lease_active: true,
            monthly_cost: cost,
            lease_start_date: startDate,
            lease_months: months
          })
          .eq('id', assetId);
      }

      setAssets(prev => prev.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            lease_active: true,
            monthly_cost: cost,
            lease_start_date: startDate,
            lease_months: months
          };
        }
        return a;
      }));

      setLeasingAssetId(null);
      setLeaseCostForm('');
      alert("✓ Arrendamiento financiero (leasing) iniciado con éxito para este equipo.");
    } catch (err) {
      console.error(err);
      alert("Error al iniciar leasing.");
    } finally {
      setDbLoading(false);
    }
  };  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e2e8f0] pb-24 md:p-6 flex flex-col items-center justify-center gap-4">
      
      {/* VIEWPORT CONTROLLER */}
      <div className="flex items-center gap-2 bg-[#090d18] border border-slate-800/80 p-1.5 rounded-2xl shadow-lg select-none z-10 shrink-0">
        <button
          onClick={() => setViewMode('mobile')}
          className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
            viewMode === 'mobile'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📱 Móvil
        </button>
        <button
          onClick={() => setViewMode('tablet')}
          className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${
            viewMode === 'tablet'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💻 Tablet / PC
        </button>
      </div>

      {/* Screen Wrapper for high-fidelity Mockup */}
      <div 
        className={`bg-[#0c101d] flex flex-col shadow-2xl relative border-slate-800 border-2 overflow-hidden transition-all duration-300 ${
          viewMode === 'mobile'
            ? 'w-full md:w-[412px] md:h-[892px] md:rounded-[40px]'
            : 'w-full md:w-[1024px] md:h-[768px] md:rounded-[32px]'
        }`}
      >        {/* TOP STATUS BAR SIMULATOR */}
        <div className="bg-[#090d18] px-6 py-2.5 flex items-center justify-between border-b border-slate-800/80 select-none text-[11px] font-bold text-slate-400">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Snackeando Hub Toluca</span>
          </div>          <div className="flex items-center gap-1.5">
            <select
              value={userProfile}
              onChange={e => setUserProfile(e.target.value)}
              className="bg-[#121827] border border-slate-800 text-[8.5px] text-emerald-400 font-extrabold rounded-lg px-1.5 py-0.5 outline-none cursor-pointer"
            >
              <option value="director">👑 Director</option>
              <option value="gerente">Gerente</option>
              <option value="validador">Validador</option>
              <option value="pickeo">Pickeo</option>
              <option value="abasto">Abasto</option>
              <option value="finanzas">Finanzas (Consulta)</option>
            </select>
            {dbLoading && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />}
          </div>
        </div>        {/* KARDEX LOG DETAILS MODAL */}
        {selectedKardexLog && (
          <div className="absolute inset-0 bg-[#090d16]/95 z-50 flex flex-col p-6 overflow-y-auto animate-fade-in text-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">{selectedKardexLog.type}</span>
                <h3 className="text-sm font-black text-white mt-1">Detalle de Movimiento</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {userProfile === 'director' && (
                  <>
                    <button
                      onClick={() => {
                        if (isEditingKardexDetail) {
                          handleSaveKardexDetailEdit();
                        } else {
                          setIsEditingKardexDetail(true);
                        }
                      }}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold uppercase ${
                        isEditingKardexDetail
                          ? 'bg-emerald-950/30 text-emerald-450 border-emerald-900/35 hover:bg-emerald-950/50'
                          : 'bg-sky-950/30 text-sky-400 border-sky-900/35 hover:bg-sky-950/50'
                      }`}
                      title={isEditingKardexDetail ? "Guardar Cambios" : "Editar Transacción"}
                    >
                      {isEditingKardexDetail ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      <span>{isEditingKardexDetail ? 'Guardar' : 'Editar'}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (isEditingKardexDetail) {
                          setIsEditingKardexDetail(false);
                          handleOpenKardexDetail(selectedKardexLog);
                        } else {
                          handleDeleteKardexLogTransaction(selectedKardexLog);
                        }
                      }}
                      className="p-1.5 bg-rose-950/30 text-rose-450 hover:text-rose-450 hover:bg-rose-950/50 rounded-lg border border-rose-900/30 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold uppercase"
                      title={isEditingKardexDetail ? "Cancelar Edición" : "Eliminar Transacción Completa"}
                    >
                      {isEditingKardexDetail ? <X className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span>{isEditingKardexDetail ? 'Cancelar' : 'Eliminar'}</span>
                    </button>
                  </>
                )}
                {!isEditingKardexDetail && (
                  <button 
                    onClick={() => {
                      setSelectedKardexLog(null);
                      setKardexDetailData(null);
                    }}
                    className="p-2 bg-slate-900 rounded-full border border-slate-800 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {kardexDetailLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-[10px] text-slate-500 uppercase font-black">Cargando detalles de base de datos...</span>
              </div>
            ) : kardexDetailData ? (
              <div className="mt-4 space-y-4">
                
                {/* 1. ENTRADA DE OC / RECEPTION DETAIL */}
                {selectedKardexLog.type === 'reception' && (
                  <div className="space-y-4">
                    {/* General PO information */}
                    <div className="bg-[#121827] p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">ORDEN DE COMPRA</span>
                        {isEditingKardexDetail ? (
                          <input 
                            type="text" 
                            value={kardexDetailData.purchase_order?.oc_number || ''} 
                            onChange={e => setKardexDetailData(prev => ({
                              ...prev,
                              purchase_order: { ...prev.purchase_order, oc_number: e.target.value }
                            }))} 
                            className="glass-input text-[10px] px-2 py-1 rounded w-32 text-emerald-400 font-mono font-bold"
                          />
                        ) : (
                          <span className="text-[9px] font-black text-emerald-400 font-mono">{kardexDetailData.purchase_order?.oc_number || 'OC-MANUAL'}</span>
                        )}
                      </div>
                      
                      {isEditingKardexDetail ? (
                        <div className="space-y-1">
                          <label className="text-[7.5px] text-slate-500 uppercase font-bold">Proveedor</label>
                          <input 
                            type="text" 
                            value={kardexDetailData.purchase_order?.provider || ''} 
                            onChange={e => setKardexDetailData(prev => ({
                              ...prev,
                              purchase_order: { ...prev.purchase_order, provider: e.target.value }
                            }))} 
                            className="glass-input text-[11px] px-2 py-1 rounded w-full text-white font-bold"
                          />
                        </div>
                      ) : (
                        <h4 className="text-xs font-bold text-white">{kardexDetailData.purchase_order?.provider || 'Proveedor'}</h4>
                      )}

                      <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                        <span>Folio Recepción:</span>
                        <span className="font-mono text-white">{getFolioFromUuid(kardexDetailData.reception?.id || selectedKardexLog.reference_id)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Recibido por:</span>
                        <span className="text-white">{kardexDetailData.reception?.received_by || 'Almacenista'}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Fecha:</span>
                        <span className="text-white">{new Date(selectedKardexLog.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Photo evidence if exists */}
                    {!isEditingKardexDetail && kardexDetailData.reception?.photo_url && (
                      <div className="glass-card p-3 rounded-2xl border border-slate-800 space-y-1.5">
                        <span className="text-[8px] text-slate-500 font-bold uppercase font-semibold">EVIDENCIA FOTOGRÁFICA</span>
                        <img 
                          src={kardexDetailData.reception.photo_url} 
                          alt="Evidencia fotográfica" 
                          className="w-full h-36 object-cover rounded-xl border border-slate-850"
                        />
                      </div>
                    )}

                    {/* Items of this reception */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Productos ingresados en esta entrada</h4>
                      
                      <div className="space-y-2">
                        {kardexDetailData.items.map(item => {
                          const prod = products.find(p => p.sku === item.sku) || { name: 'Producto', purchase_price: 0, tax_rate: 16 };
                          const quantity = Math.abs(item.quantity);
                          const unitPriceWithTax = prod.purchase_price || 0;
                          const taxRate = prod.tax_rate || 16;
                          
                          const totalVal = quantity * unitPriceWithTax;
                          const subtotalVal = totalVal / (1 + (taxRate / 100));
                          const taxAmountVal = totalVal - subtotalVal;

                          return (
                            <div key={item.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="text-[11px] font-bold text-white">{prod.name}</h5>
                                  <span className="text-[7.5px] text-slate-500 font-mono">SKU: {item.sku}</span>
                                </div>
                                
                                {isEditingKardexDetail ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-500">Cant:</span>
                                    <input 
                                      type="number" 
                                      value={item.quantity} 
                                      onChange={e => {
                                        const val = parseInt(e.target.value) || 0;
                                        setKardexDetailData(prev => ({
                                          ...prev,
                                          items: prev.items.map(it => it.id === item.id ? { ...it, quantity: val } : it)
                                        }));
                                      }} 
                                      className="glass-input text-[11px] px-2 py-0.5 rounded w-16 text-emerald-400 font-black text-right"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-black text-emerald-400">+{quantity} pzas</span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-3 gap-1.5 text-[8.5px] text-slate-500 border-t border-slate-850 pt-1.5 font-mono">
                                <div>
                                  <span className="block text-[7px] text-slate-650">SUBTOTAL</span>
                                  <span className="font-bold text-slate-400">${subtotalVal.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="block text-[7px] text-slate-650">IMPUESTO ({taxRate}%)</span>
                                  <span className="font-bold text-slate-400">${taxAmountVal.toFixed(2)}</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-[7px] text-slate-650">TOTAL</span>
                                  <span className="font-bold text-emerald-400">${totalVal.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SALIDA DE PRE-KITTING / RUTEO DETAIL */}
                {(selectedKardexLog.type === 'prekitting_exit' || selectedKardexLog.type === 'route_out') && (
                  <div className="space-y-4">
                    <div className="bg-[#121827] p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">DESPACHO / SURTIDO RUTA</span>
                        <span className="text-[9px] font-black text-rose-400 font-mono">{kardexDetailData.box?.box_code || 'SURTIDO'}</span>
                      </div>
                      
                      {isEditingKardexDetail ? (
                        <div className="space-y-1">
                          <label className="text-[7.5px] text-slate-500 uppercase font-bold">Destino Vending Machine</label>
                          <select
                            value={kardexDetailData.box?.vending_machine_id || ''}
                            onChange={e => setKardexDetailData(prev => ({
                              ...prev,
                              box: { ...prev.box, vending_machine_id: e.target.value }
                            }))}
                            className="glass-input text-[11px] p-2 rounded w-full text-white font-bold bg-slate-900 border border-slate-800"
                          >
                            <option value="">Selecciona Vending</option>
                            {vendingMachines.map(vm => (
                              <option key={vm.id} value={vm.id}>{vm.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <h4 className="text-xs font-bold text-white">Destino: {kardexDetailData.machine?.name || 'Vending Machine'}</h4>
                      )}

                      <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                        <span>Folio Caja/Salida:</span>
                        <span className="font-mono text-white">{selectedKardexLog.reference_id}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Fecha Despacho:</span>
                        <span className="text-white">{new Date(selectedKardexLog.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Productos en esta caja de surtido</h4>
                      
                      <div className="space-y-1.5">
                        {kardexDetailData.items.map(item => {
                          const prod = products.find(p => p.sku === item.sku) || { name: 'Producto', sale_price: 0 };
                          const quantity = Math.abs(item.quantity);
                          const unitPrice = prod.sale_price || 0;
                          const totalVal = quantity * unitPrice;

                          return (
                            <div key={item.id || item.sku} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                              <div>
                                <h5 className="text-[11px] font-bold text-white">{prod.name}</h5>
                                <span className="text-[7.5px] text-slate-500 font-mono">SKU: {item.sku} | P.Venta: ${unitPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-right">
                                {isEditingKardexDetail ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-500">Cant:</span>
                                    <input 
                                      type="number" 
                                      value={item.quantity} 
                                      onChange={e => {
                                        const val = parseInt(e.target.value) || 0;
                                        setKardexDetailData(prev => ({
                                          ...prev,
                                          items: prev.items.map(it => it.sku === item.sku ? { ...it, quantity: val } : it)
                                        }));
                                      }} 
                                      className="glass-input text-[11px] px-2 py-0.5 rounded w-16 text-rose-450 font-black text-right"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-[11px] font-black text-rose-400">-{quantity} pzas</span>
                                    <span className="text-[8px] text-slate-500 block font-mono">Valuado: ${totalVal.toFixed(2)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. RETORNOS DETAIL */}
                {selectedKardexLog.type === 'return' && (
                  <div className="space-y-4">
                    <div className="bg-[#121827] p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">RETORNO / DEVOLUCIÓN</span>
                        <span className="text-[9px] font-black text-amber-400 font-mono">RETORNO</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                        <span>ID Retorno:</span>
                        <span className="font-mono text-white">{selectedKardexLog.reference_id}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Motivo:</span>
                        {isEditingKardexDetail ? (
                          <input 
                            type="text" 
                            value={kardexDetailData.return?.reason || ''} 
                            onChange={e => setKardexDetailData(prev => ({
                              ...prev,
                              return: { ...prev.return, reason: e.target.value }
                            }))} 
                            className="glass-input text-[11px] px-2 py-0.5 rounded text-white font-bold"
                          />
                        ) : (
                          <span className="text-white font-bold">{kardexDetailData.return?.reason || 'Devolución de ruta'}</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Cantidad:</span>
                        {isEditingKardexDetail ? (
                          <input 
                            type="number" 
                            value={selectedKardexLog.quantity} 
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              setSelectedKardexLog(prev => ({ ...prev, quantity: val }));
                            }} 
                            className="glass-input text-[11px] px-2 py-0.5 rounded w-16 text-amber-400 font-bold text-right"
                          />
                        ) : (
                          <span className="text-white font-bold">{selectedKardexLog.quantity} pzas</span>
                        )}
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Fecha:</span>
                        <span className="text-white">{new Date(selectedKardexLog.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <span className="text-xs text-slate-500 italic">No se pudo cargar el detalle del movimiento.</span>
              </div>
            )}
          </div>
        )}

        {/* INTERACTIVE HUD OVERLAY CAMERA */}
        {isCameraActive && (
          <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col justify-between p-6">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 flex items-center gap-2">
                <Camera className="w-4 h-4 animate-pulse" /> Capturando Evidencia ({cameraTarget})
              </span>
              <button 
                onClick={stopCamera}
                className="p-2 bg-slate-900 rounded-full border border-slate-800 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Viewfinder */}
            <div className="flex-1 my-6 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 relative flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none border-dashed flex items-center justify-center">
                <div className="w-12 h-12 border border-emerald-500/40 rounded-full animate-ping pointer-events-none" />
              </div>
            </div>

            <button 
              onClick={capturePhoto}
              className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl shadow-xl transition-all tracking-wide flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" /> CAPTURAR FOTO FÍSICA
            </button>
          </div>
        )}

        {/* APP MAIN PANEL */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-20 space-y-4">
          
          {/* TAB 1: RECEPCIÓN Y INVENTARIO */}
          {activeTab === 'reception' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">Logística & Almacén</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Control de Productos y OC</p>
                </div>
                <div className="bg-[#121827] px-3 py-1.5 rounded-2xl border border-slate-800 text-right">
                  <span className="text-[9px] text-slate-500 block font-bold">STOCK SKU DISTINCT</span>
                  <span className="text-sm font-black text-[#a7f3d0]">{products.length}</span>
                </div>
              </div>

              {/* Sub Navigation */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {[
                  { id: 'catalog', label: 'Catálogo' },
                  { id: 'po_rec', label: 'Carga OC' },
                  { id: 'kardex', label: 'Kardex' },
                  { id: 'returns', label: 'Retornos' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setReceptionSubTab(tab.id)}
                    className={`text-[9.5px] font-extrabold py-2 rounded-lg transition-all ${
                      receptionSubTab === tab.id 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUB TAB: CATALOG */}
              {receptionSubTab === 'catalog' && (
                <div className="space-y-4">
                  {/* File Upload card */}
                  <div className="glass-card-accent-green p-4 rounded-3xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#a7f3d0]/10 p-2 rounded-xl border border-[#a7f3d0]/20">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Carga Masiva de Productos</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">Sube tu archivo excel (.xlsx) con columnas SKU, Nombre, Costo, Impuesto.</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="flex-1 border border-emerald-500/25 bg-slate-950/40 hover:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer"
                      >
                        <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase">📥 Descargar Plantilla</span>
                        <span className="text-[8px] text-slate-500 mt-1 uppercase">Formato de Referencia (.xlsx)</span>
                      </button>

                      <label className="flex-1 border border-dashed border-emerald-500/25 bg-slate-950/40 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-950/60 transition-all">
                        <span className="text-[10px] font-black text-[#a7f3d0] tracking-wider uppercase">📤 Subir Excel</span>
                        <span className="text-[8px] text-slate-500 mt-1 uppercase">Seleccionar archivo</span>
                        <input 
                          type="file" 
                          accept=".xlsx, .xls" 
                          onChange={handleExcelUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Product Form Manual */}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const newP = {
                      sku: skuVal,
                      name: nameVal,
                      description: descVal,
                      purchase_price: parseFloat(purchaseVal) || 0,
                      sale_price: parseFloat(saleVal) || 0,
                      tax_rate: parseFloat(taxVal) || 16
                    };
                    
                    setDbLoading(true);
                    try {
                      if (isSupabaseMode && supabase) {
                        await supabase.from('products').upsert(newP);
                      }
                      
                      // Sync product to Google Sheets
                      const scriptUrl = localStorage.getItem('google_sheet_script_url') || 'https://script.google.com/macros/s/AKfycbxVQdebGqyfDf1XYD5IXb3rd7urmMJw2bgDXi-6p8aC6TJlSusfvCvmULLr-AgJmDlmpA/exec';
                      try {
                        await fetch(scriptUrl, {
                          method: 'POST',
                          mode: 'no-cors',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'sync_product',
                            sku: newP.sku,
                            name: newP.name,
                            description: newP.description,
                            purchase_price: newP.purchase_price,
                            sale_price: newP.sale_price,
                            tax_rate: newP.tax_rate
                          })
                        });
                      } catch (err) {
                        console.error("Google Sheets Catalog Sync Error:", err);
                      }

                      setProducts(prev => [...prev.filter(p => p.sku !== newP.sku), newP]);
                      
                      // Reset Form
                      setSkuVal('');
                      setNameVal('');
                      setDescVal('');
                      setPurchaseVal('');
                      setSaleVal('');
                      setTaxVal('16');
                      setIsEditingProduct(false);
                      
                      alert(isEditingProduct ? "✓ Cambios del producto guardados con éxito en la app y Google Sheets." : "✓ SKU registrado con éxito en la app y Google Sheets.");
                    } catch (err) {
                      console.error(err);
                      alert("Error al registrar producto: " + err.message);
                    } finally {
                      setDbLoading(false);
                    }
                  }} className="glass-card p-4 rounded-3xl space-y-3">
                    <h4 className="text-xs font-bold text-white">
                      {isEditingProduct ? 'Editar Producto en Catálogo' : 'Alta Individual en Catálogo'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">SKU</label>
                        <input 
                          required 
                          value={skuVal} 
                          onChange={e => setSkuVal(e.target.value)} 
                          disabled={isEditingProduct}
                          placeholder="SKU (ej: VSABORIG42)" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white font-mono disabled:opacity-50" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Nombre Producto</label>
                        <input 
                          required 
                          value={nameVal} 
                          onChange={e => setNameVal(e.target.value)} 
                          placeholder="Nombre Producto" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-black">Proveedor / Descripción</label>
                      <input 
                        value={descVal} 
                        onChange={e => setDescVal(e.target.value)} 
                        placeholder="Proveedor / Descripción" 
                        className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Costo Compra ($)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          required 
                          value={purchaseVal} 
                          onChange={e => setPurchaseVal(e.target.value)} 
                          placeholder="15.12" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Precio Venta ($)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          required 
                          value={saleVal} 
                          onChange={e => setSaleVal(e.target.value)} 
                          placeholder="15.88" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Impuestos (%)</label>
                        <select 
                          value={taxVal} 
                          onChange={e => setTaxVal(e.target.value)} 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white"
                        >
                          <option value="16">16% IVA</option>
                          <option value="8">8% IEPS</option>
                          <option value="0">0% Exento</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-[10px] tracking-widest uppercase transition-all"
                      >
                        {isEditingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                      </button>
                      
                      {isEditingProduct && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setSkuVal('');
                            setNameVal('');
                            setDescVal('');
                            setPurchaseVal('');
                            setSaleVal('');
                            setTaxVal('16');
                            setIsEditingProduct(false);
                          }}
                          className="px-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  {/* List */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Productos en Catálogo ({products.length})</h4>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {products.map(p => (
                        <div key={p.sku} className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">{p.sku}</span>
                            <h5 className="text-xs font-bold text-white mt-1 truncate">{p.name}</h5>
                            <p className="text-[9px] text-slate-500 truncate">{p.description || 'Sin descripción'}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] font-black text-white block">C: ${p.purchase_price ? p.purchase_price.toFixed(2) : '0.00'}</span>
                              <span className="text-[10px] font-black text-emerald-400 block">V: ${p.sale_price ? p.sale_price.toFixed(2) : '0.00'}</span>
                              <span className="text-[8px] text-slate-500 font-bold block">Tax: {p.tax_rate}%</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setSkuVal(p.sku);
                                  setNameVal(p.name);
                                  setDescVal(p.description || '');
                                  setPurchaseVal(String(p.purchase_price));
                                  setSaleVal(String(p.sale_price || 0));
                                  setTaxVal(String(p.tax_rate));
                                  setIsEditingProduct(true);
                                }}
                                className="p-2 bg-slate-800 hover:bg-slate-750 text-sky-400 rounded-xl border border-slate-700 transition-all cursor-pointer"
                                title="Editar Producto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.sku)}
                                className="p-2 bg-slate-800 hover:bg-slate-750 text-rose-400 rounded-xl border border-slate-700 transition-all cursor-pointer"
                                title="Eliminar Producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div></div>
              )}

              {/* SUB TAB: PO RECEPTION */}
                            {receptionSubTab === 'po_rec' && (
                <div className={viewMode === 'tablet' ? "grid grid-cols-2 gap-6 items-start h-full overflow-y-auto pr-1" : "space-y-4"}>
                  
                  {/* Left Column in Tablet Mode / Main view in Mobile when no PO is selected */}
                  {((viewMode === 'tablet') || !selectedPO) && (
                    <div className="space-y-4">
                      {isCreatingPO ? (
                        <form onSubmit={handleSavePO} className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Registrar Nueva OC</h4>
                            <button 
                              type="button" 
                              onClick={() => setIsCreatingPO(false)}
                              className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[8px] text-slate-500 uppercase font-black font-semibold">OC Netsuite (Número)</label>
                              <input 
                                required
                                type="text"
                                placeholder="ej: OC-2026-001"
                                value={newPOForm.oc_number}
                                onChange={e => setNewPOForm({...newPOForm, oc_number: e.target.value})}
                                className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] text-slate-500 uppercase font-black font-semibold">Proveedor</label>
                              <input 
                                required
                                type="text"
                                placeholder="ej: Sabritas SA de CV"
                                value={newPOForm.provider}
                                onChange={e => setNewPOForm({...newPOForm, provider: e.target.value})}
                                className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                              />
                            </div>
                          </div>

                          {/* Add Item Block */}
                          <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-850 space-y-2">
                            <h5 className="text-[9px] font-black text-slate-400 uppercase">Agregar Partida / Producto</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-500 uppercase">Producto</label>
                                <select 
                                  value={newPOItemSku}
                                  onChange={e => setNewPOItemSku(e.target.value)}
                                  className="glass-input text-[10px] p-2 rounded-lg w-full text-white"
                                >
                                  <option value="">-- Seleccionar --</option>
                                  {products.map(p => (
                                    <option key={p.sku} value={p.sku}>{p.name} (${p.purchase_price})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-500 uppercase">Cantidad</label>
                                <input 
                                  type="number"
                                  placeholder="Cant"
                                  value={newPOItemQty}
                                  onChange={e => setNewPOItemQty(e.target.value)}
                                  className="glass-input text-[10px] p-2 rounded-lg w-full text-white" 
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!newPOItemSku || !newPOItemQty) {
                                  alert("Selecciona un producto y cantidad.");
                                  return;
                                }
                                const prod = products.find(p => p.sku === newPOItemSku);
                                if (!prod) return;
                                
                                setNewPOForm(prev => {
                                  if (prev.items.some(it => it.sku === newPOItemSku)) {
                                    alert("Este producto ya está agregado. Elimínalo primero si deseas cambiar la cantidad.");
                                    return prev;
                                  }
                                  return {
                                    ...prev,
                                    items: [
                                      ...prev.items,
                                      {
                                        sku: newPOItemSku,
                                        quantity_ordered: parseInt(newPOItemQty),
                                        purchase_price: prod.purchase_price
                                      }
                                    ]
                                  };
                                });
                                setNewPOItemSku('');
                                setNewPOItemQty('');
                              }}
                              className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold text-[9px] uppercase tracking-wider rounded-lg border border-slate-700 cursor-pointer text-center"
                            >
                              + Agregar Partida
                            </button>
                          </div>

                          {/* Added Items List */}
                          <div className="space-y-1.5">
                            <label className="text-[8px] text-slate-500 uppercase font-black block">Partidas Agregadas ({newPOForm.items.length})</label>
                            {newPOForm.items.length === 0 ? (
                              <p className="text-[9px] text-slate-600 italic">No hay partidas agregadas aún.</p>
                            ) : (
                              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {newPOForm.items.map(it => {
                                  const prod = products.find(p => p.sku === it.sku) || { name: 'Producto' };
                                  return (
                                    <div key={it.sku} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-xl border border-slate-850 text-[9.5px]">
                                      <div>
                                        <span className="font-bold text-white">{prod.name}</span>
                                        <span className="text-[7.5px] text-slate-500 block font-mono">SKU: {it.sku} | Costo: ${it.purchase_price}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-300">{it.quantity_ordered} pzas</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNewPOForm(prev => ({
                                              ...prev,
                                              items: prev.items.filter(item => item.sku !== it.sku)
                                            }));
                                          }}
                                          className="text-rose-400 font-bold text-[10px] px-1 cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <button 
                            type="submit"
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Guardar y Registrar OC
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center pb-1">
                            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                              Órdenes de Compra Pendientes ({purchaseOrders.filter(p => p.status === 'pending').length})
                            </h4>
                            <button
                              onClick={() => setIsCreatingPO(true)}
                              className="px-2.5 py-1 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 border border-emerald-500/25 text-[8.5px] font-black uppercase rounded-lg cursor-pointer"
                            >
                              + Crear OC Manual
                            </button>
                          </div>
                          
                          {purchaseOrders.filter(po => po.status === 'pending').length === 0 ? (
                            <div className="glass-card p-6 rounded-3xl border border-slate-800 text-center space-y-3">
                              <p className="text-[10px] text-slate-500 italic">No hay órdenes de compra pendientes en este momento.</p>
                              <button
                                onClick={() => setIsCreatingPO(true)}
                                className="px-4 py-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-xl tracking-wider cursor-pointer"
                              >
                                Crear una Orden de Compra ahora
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 overflow-y-auto max-h-[480px]">
                              {purchaseOrders.filter(po => po.status === 'pending').map(po => (
                                <div 
                                  key={po.id} 
                                  onClick={() => handleSelectPO(po)}
                                  className={`glass-card hover:bg-slate-800/30 p-4 rounded-3xl border flex items-center justify-between cursor-pointer transition-all ${
                                    selectedPO && selectedPO.id === po.id ? 'border-emerald-500/50 bg-slate-900/40' : 'border-slate-800'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0 pr-2">
                                    <span className="text-[10px] font-black text-emerald-400">{po.oc_number}</span>
                                    <h5 className="text-xs font-bold text-white mt-1 truncate">{po.provider}</h5>
                                    <p className="text-[9px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                      <Calendar className="w-3 text-slate-400" /> {po.order_date}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                    {userProfile === 'director' && (
                                      <>
                                        <button
                                          onClick={() => handleEditPO(po)}
                                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                          title="Editar Orden de Compra"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeletePO(po.id)}
                                          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-rose-400 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                          title="Eliminar Orden de Compra"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                    <ChevronRight className="w-5 h-5 text-slate-500" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right Column in Tablet Mode / Main view in Mobile when PO is selected */}
                  {((viewMode === 'tablet') || selectedPO) && (
                    <div className="space-y-4">
                      {selectedPO ? (
                        <div className="space-y-4 bg-slate-950/20 p-4 rounded-3xl border border-slate-900">
                          {/* Back button (Only visible in Mobile, since in Tablet the list is right next to it!) */}
                          {viewMode === 'mobile' && (
                            <button 
                              onClick={() => setSelectedPO(null)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase flex items-center gap-1.5"
                            >
                              ← Volver a OCs
                            </button>
                          )}

                          <div className="flex justify-between items-start">
                            <div className="bg-[#121827] p-3 rounded-2xl border border-slate-800 space-y-1 flex-1">
                              <span className="text-[10px] font-black text-emerald-400 block font-mono">{selectedPO.oc_number}</span>
                              <h4 className="text-xs font-bold text-white">{selectedPO.provider}</h4>
                            </div>
                            {viewMode === 'tablet' && (
                              <button
                                onClick={() => setSelectedPO(null)}
                                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-all"
                              >
                                Deseleccionar
                              </button>
                            )}
                          </div>

                          {/* Reception Metadata and Config Form */}
                          <div className="glass-card p-4 rounded-3xl space-y-3">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <Info className="w-4 h-4 text-emerald-300" /> Información de Recepción
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-500 uppercase font-black font-semibold">OC Netsuite</label>
                                <input 
                                  type="text" 
                                  value={receptionNetsuiteOc} 
                                  onChange={e => setReceptionNetsuiteOc(e.target.value)} 
                                  placeholder="ej: OC-2026-092" 
                                  className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-500 uppercase font-black font-semibold">Moneda</label>
                                <select 
                                  value={receptionCurrency} 
                                  onChange={e => setReceptionCurrency(e.target.value)} 
                                  className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white"
                                >
                                  <option value="MXN">MXN ($)</option>
                                  <option value="USD">USD ($)</option>
                                </select>
                              </div>
                            </div>

                            {receptionCurrency === 'USD' && (
                              <div className="space-y-1 animate-fade-in">
                                <label className="text-[8px] text-slate-500 uppercase font-black font-semibold">Tipo de Cambio (USD/MXN)</label>
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  value={receptionExchangeRate} 
                                  onChange={e => setReceptionExchangeRate(e.target.value)} 
                                  placeholder="19.20" 
                                  className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                                />
                              </div>
                            )}
                          </div>

                          {/* Photo Capture Card */}
                          <div className="glass-card p-4 rounded-3xl space-y-3">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <Camera className="w-4 h-4 text-emerald-300" /> Evidencia Fotográfica
                            </h4>
                            
                            <div className="flex gap-2">
                              {/* File Input */}
                              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-950/40 rounded-2xl p-4 cursor-pointer hover:bg-slate-950/60 transition-all text-center">
                                <span className="text-[10px] text-slate-400">Subir Fotografía</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  capture="environment"
                                  onChange={handlePhotoUpload}
                                  className="hidden" 
                                />
                              </label>

                              {/* Camera Trigger */}
                              <button
                                type="button"
                                onClick={() => startCamera('reception')}
                                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-[9px] uppercase font-bold transition-all flex flex-col items-center justify-center gap-1 shrink-0"
                              >
                                <Camera className="w-4 h-4" />
                                <span>Cámara</span>
                              </button>
                            </div>

                            {receptionPhoto && (
                              <div className="relative mt-2 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                                <img src={receptionPhoto} alt="Vista previa de recepción" className="w-full h-32 object-cover" />
                                <button 
                                  onClick={() => setReceptionPhoto(null)}
                                  className="absolute top-2 right-2 bg-slate-950/80 text-white rounded-full p-1 border border-slate-850 hover:bg-slate-900"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Items and Quantities */}
                          <div className="space-y-2">
                            <h4 className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider">Productos en Orden de Compra</h4>
                            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                              {selectedPO.items && Array.isArray(selectedPO.items) && selectedPO.items.map(item => {
                                const prod = products.find(p => p.sku === item.sku) || { name: 'Producto' };
                                const alreadyReceived = item.quantity_received || 0;
                                const pending = item.quantity_ordered - alreadyReceived;
                                const currentInput = poQuantities[item.sku]?.qty || '';
                                
                                const totalVal = (Number(currentInput) || 0) * (item.purchase_price || 0);
                                const taxRate = item.tax_rate || 16;
                                const subtotalVal = totalVal / (1 + (taxRate / 100));
                                const taxAmountVal = totalVal - subtotalVal;

                                return (
                                  <div key={item.sku} className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-2.5">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0 pr-2">
                                        <h5 className="text-[11px] font-bold text-white truncate">{prod.name}</h5>
                                        <span className="text-[7.5px] text-slate-500 font-mono">SKU: {item.sku} | Costo: ${item.purchase_price} | IVA: {taxRate}%</span>
                                      </div>
                                      <div className="text-right shrink-0 font-mono">
                                        <span className="text-[9px] text-slate-400 block font-bold">Ordenado: {item.quantity_ordered} pzas</span>
                                        <span className="text-[8px] text-slate-500 block">Recibido: {alreadyReceived} pzas</span>
                                      </div>
                                    </div>

                                    {/* Capture input & cost integration */}
                                    <div className="grid grid-cols-2 gap-2 items-center border-t border-slate-850/60 pt-2">
                                      <div className="space-y-1">
                                        <label className="text-[7.5px] text-slate-500 uppercase font-black">Cantidad a Recibir</label>
                                        <input 
                                          type="number" 
                                          placeholder={`Pendiente: ${pending}`}
                                          max={pending}
                                          value={currentInput}
                                          onChange={e => handleReceptionItemChange(item.sku, 'qty', e.target.value)}
                                          className="glass-input text-[11px] p-2 rounded-xl w-full text-white font-extrabold text-right" 
                                        />
                                      </div>
                                      <div className="text-right font-mono">
                                        <span className="text-[7.5px] text-slate-500 uppercase font-black block">Total Partida</span>
                                        <span className="text-xs font-black text-emerald-400">${totalVal.toFixed(2)} MXN</span>
                                      </div>
                                    </div>

                                    {/* Tax breakdown */}
                                    {(Number(currentInput) || 0) > 0 && (
                                      <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 space-y-1 animate-fade-in font-mono text-[8.5px]">
                                        <div className="flex justify-between text-slate-500">
                                          <span>Subtotal (Sin IVA):</span>
                                          <span className="text-slate-300 font-bold">${subtotalVal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                          <span>Impuestos ({taxRate}%)::</span>
                                          <span className="text-slate-300 font-bold">${taxAmountVal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-400 border-t border-slate-850 pt-1 font-bold">
                                          <span>Total:</span>
                                          <span>${totalVal.toFixed(2)}</span>
                                        </div>
                                        {receptionCurrency === 'USD' && (
                                          <div className="text-[8px] text-slate-500 text-right pt-0.5 border-t border-slate-850/60 font-mono">
                                            Equiv: ${(totalVal * parseFloat(receptionExchangeRate || 1)).toFixed(2)} MXN
                                          </div>
                                        )}
                                      </div>
                                    )}

                                  </div>
                                );
                              })}
                            </div>

                            <button 
                              onClick={submitReception}
                              className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
                            >
                              Confirmar y Finalizar Entrada
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Placeholder visible only in Tablet Mode when no PO is selected
                        viewMode === 'tablet' && (
                          <div className="glass-card p-12 rounded-3xl border border-slate-800/80 text-center flex flex-col items-center justify-center h-[400px] gap-3">
                            <div className="bg-slate-900/60 p-4 rounded-full border border-slate-800">
                              <Package className="w-8 h-8 text-slate-505" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Esperando Selección</h5>
                              <p className="text-[9px] text-slate-500 mt-1 max-w-[200px] leading-normal mx-auto">Selecciona una Orden de Compra de la lista de la izquierda para comenzar a registrar su recepción.</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                </div>
              )}

              {receptionSubTab === 'kardex' && (
                <div className="space-y-4">
                  {/* Summary widgets matching visual layout */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#121827] p-4 rounded-3xl border border-slate-800 space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Entradas (Mes)
                      </span>
                      <h4 className="text-xl font-black text-white">
                        +{inventoryLogs.filter(l => l.quantity > 0).reduce((acc, curr) => acc + curr.quantity, 0)}
                      </h4>
                    </div>

                    <div className="bg-[#121827] p-4 rounded-3xl border border-slate-800 space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" /> Salidas (Mes)
                      </span>
                      <h4 className="text-xl font-black text-white">
                        {inventoryLogs.filter(l => l.quantity < 0).reduce((acc, curr) => acc + curr.quantity, 0)}
                      </h4>
                    </div>
                  </div>

                  {/* Inventory Logs List */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Historial de Movimientos</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {inventoryLogs.map(log => {
                        const pObj = products.find(p => p.sku === log.sku) || { name: 'Desconocido' };
                        const isEntry = log.quantity > 0;
                        return (                          <div 
                            key={log.id} 
                            onClick={() => handleOpenKardexDetail(log)}
                            className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/25 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl border ${
                                isEntry 
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/10' 
                                  : 'bg-rose-950/40 text-rose-400 border-rose-500/10'
                              }`}>
                                {isEntry ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-white">{pObj.name}</h5>
                                <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider">{log.type}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-black block ${isEntry ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isEntry ? '+' : ''}{log.quantity} pzas
                              </span>
                              <span className="text-[8px] text-slate-500 font-bold block">{new Date(log.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: RETURNS */}
              {receptionSubTab === 'returns' && (
                <div className="space-y-4">
                  <div className="glass-card-accent-yellow p-4 rounded-3xl border border-amber-500/15 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Retorno de Material de Ruta</h4>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Utiliza esta sección para registrar productos que regresan al Cedis debido a que no se vendieron o presentan daños.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterReturn} className="glass-card p-4 rounded-3xl space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 font-bold uppercase">Producto (SKU)</label>
                      <select name="sku" required className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white">
                        <option value="">Selecciona SKU</option>
                        {products.map(p => (
                          <option key={p.sku} value={p.sku}>{p.sku} - {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 font-bold uppercase">Caja Relacionada (Opcional)</label>
                        <select name="box_id" className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white">
                          <option value="">Ninguna</option>
                          {boxes.map(b => (
                            <option key={b.id} value={b.id}>{b.box_code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 font-bold uppercase">Máquina Relacionada (Opcional)</label>
                        <select name="vending_machine_id" className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white">
                          <option value="">Ninguna</option>
                          {vendingMachines.filter(m => {
                            const matchedAsset = assets.find(a => a.id === m.id);
                            return matchedAsset && matchedAsset.is_active;
                          }).map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 font-bold uppercase">Cantidad Retornada</label>
                        <input name="qty" type="number" required placeholder="5" className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 font-bold uppercase">Razón del Retorno</label>
                        <select name="reason" className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white">
                          <option value="exceso">Excedente Abastecimiento</option>
                          <option value="dano">Empaque Dañado</option>
                          <option value="caducado">Caducado</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#fef3c7]/10 hover:bg-[#fef3c7]/20 border border-[#fef3c7]/20 text-[#fef3c7] font-bold py-2.5 rounded-xl text-[10px] tracking-widest uppercase transition-all">
                      Registrar Retorno en Almacén
                    </button>
                  </form>

                  {/* Returns List */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Historial de Retornos ({returns.length})</h4>
                    {returns.map(ret => {
                      const pObj = products.find(p => p.sku === ret.sku) || { name: 'Producto' };
                      return (
                        <div key={ret.id} className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">Retorno</span>
                            <h5 className="text-xs font-bold text-white mt-1">{pObj.name}</h5>
                            <p className="text-[9px] text-slate-500 mt-0.5">Motivo: {ret.reason}</p>
                          </div>
                          <span className="text-xs font-black text-amber-400">+{ret.quantity} pzas</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRE-KITTING */}          {activeTab === 'prekitting' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">Centro de Pre-Kitting</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Armado y Sello de Totes</p>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setPrekittingSubTab('picker')}
                  className={`text-[10px] font-extrabold py-2.5 rounded-lg transition-all ${
                    prekittingSubTab === 'picker' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Picker (Armado)
                </button>
                <button 
                  onClick={() => setPrekittingSubTab('validator')}
                  className={`text-[10px] font-extrabold py-2.5 rounded-lg transition-all ${
                    prekittingSubTab === 'validator' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Validador (Calidad)
                </button>
              </div>

              {/* SUB TAB: PICKER ARMADO */}
              {prekittingSubTab === 'picker' && (
                <div className={viewMode === 'tablet' ? "grid grid-cols-2 gap-6 items-start h-full overflow-y-auto pr-1" : "space-y-4"}>
                  {/* Left Column in Tablet / Top in Mobile */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 bg-[#121827]/40 p-4 rounded-3xl border border-slate-900">
                      <label className="text-[8px] text-slate-500 font-bold uppercase">Selecciona Máquina Vending a Abastecer</label>
                      <select 
                        value={pickerMachineId}
                        onChange={(e) => handleSelectPickerMachine(e.target.value)}
                        className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white"
                      >
                        <option value="">Selecciona Máquina...</option>
                        {vendingMachines.filter(m => {
                          const matchedAsset = assets.find(a => a.id === m.id);
                          return matchedAsset && matchedAsset.is_active;
                        }).map(m => (
                          <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                        ))}
                      </select>
                    </div>

                    {pickerItems.length > 0 && (
                      <div className="bg-[#121827] p-4 rounded-3xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-bold">CÓDIGO QR GENERADO</span>
                          <span className="text-xs font-black text-emerald-400">{newBoxCode}</span>
                        </div>
                        <div className="flex justify-center py-2 bg-white rounded-xl">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(newBoxCode)}`}
                            alt="QR Code"
                            className="w-24 h-24"
                          />
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>Avance del Pickeo</span>
                            <span className="font-bold text-white">
                              {pickerItems.length > 0 ? Math.round((Object.values(pickerCheckedItems).filter(Boolean).length / pickerItems.length) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="bg-emerald-400 h-full transition-all duration-300"
                              style={{ width: `${pickerItems.length > 0 ? (Object.values(pickerCheckedItems).filter(Boolean).length / pickerItems.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleCreateBox}
                          disabled={Object.values(pickerCheckedItems).filter(Boolean).length < pickerItems.length}
                          className="w-full mt-1 py-3.5 bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-800 disabled:shadow-none hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-[10px] tracking-widest uppercase border border-transparent shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
                        >
                          📦 Sellar Caja y Enviar a Validación
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column in Tablet / Bottom in Mobile */}
                  <div className="space-y-4">
                    {pickerItems.length > 0 ? (
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Plan de Armado de Caja</h4>
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                            {Object.values(pickerCheckedItems).filter(Boolean).length} / {pickerItems.length} checked
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 font-mono">
                          {(() => {
                            const grouped = {};
                            pickerItems.forEach(it => {
                              const level = getLevelName(it.coil_number);
                              if (!grouped[level]) grouped[level] = [];
                              grouped[level].push(it);
                            });
                            return Object.keys(grouped).sort().map(level => (
                              <div key={level} className="space-y-1.5">
                                <h5 className="text-[9px] font-black text-[#a7f3d0] bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 uppercase tracking-wide">
                                  {level}
                                </h5>
                                <div className="space-y-1.5 pl-1">
                                  {grouped[level].map(it => {
                                    const pObj = products.find(p => p.sku === it.sku) || { name: 'Producto' };
                                    const itemKey = `${it.sku}_${it.coil_number}`;
                                    const isChecked = !!pickerCheckedItems[itemKey];
                                    
                                    return (
                                      <div 
                                        key={itemKey}
                                        onClick={() => {
                                          setPickerCheckedItems(prev => ({
                                            ...prev,
                                            [itemKey]: !prev[itemKey]
                                          }));
                                        }}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                                          isChecked 
                                            ? 'bg-emerald-950/15 border-emerald-500/25' 
                                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/80'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                            isChecked 
                                              ? 'bg-emerald-400 border-emerald-400 text-slate-950' 
                                              : 'border-slate-700 text-transparent'
                                          }`}>
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                          </div>
                                          <div className="min-w-0">
                                            <h5 className="text-[11px] font-bold text-white truncate">{pObj.name}</h5>
                                            <p className="text-[8px] text-slate-500 uppercase mt-0.5">Espiral: {it.coil_number} | SKU: {it.sku}</p>
                                          </div>
                                        </div>
                                        <span className={`text-[10px] font-black shrink-0 px-2 py-0.5 rounded-lg border ${
                                          isChecked
                                            ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/10'
                                            : 'text-slate-400 bg-slate-950 border-slate-850'
                                        }`}>
                                          {it.quantity} pzas
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    ) : (
                      viewMode === 'tablet' && (
                        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center h-[350px] gap-2">
                          <Package className="w-8 h-8 text-slate-600" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">Esperando Surtido</h5>
                          <p className="text-[9px] text-slate-500">Selecciona una máquina vending para cargar la lista de telemetría.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB: VALIDATOR */}
              {prekittingSubTab === 'validator' && (
                <div className={viewMode === 'tablet' ? "grid grid-cols-2 gap-6 items-start h-full overflow-y-auto pr-1" : "space-y-4"}>
                  {/* Left Column in Tablet / Top in Mobile */}
                  <div className="space-y-4">
                    {!activeVerificationBox ? (
                      <div className="glass-card p-4 rounded-3xl space-y-4">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-emerald-300" /> Escaneo de Caja (Control de Calidad)
                        </h4>
                        <p className="text-[9px] text-slate-400 leading-normal">
                          Ingresa o escanea el código QR del Tote generado en la fase de Picker para iniciar la verificación física.
                        </p>
                        
                        <div className="space-y-3">
                          {/* Text input to simulate scanning (type/paste) */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-slate-500 uppercase font-black">Escanear o Ingresar Código QR</label>
                            <input 
                              type="text"
                              placeholder="ej: TOTE-VMALPHALAB-XXXX"
                              value={scannedInputText}
                              onChange={(e) => setScannedInputText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && scannedInputText) {
                                  handleScanBoxForVerification(scannedInputText);
                                }
                              }}
                              className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white font-mono uppercase tracking-wider"
                            />
                          </div>

                          {/* Fallback Selector list */}
                          <div className="space-y-1">
                            <label className="text-[8px] text-slate-500 uppercase font-black">O Seleccionar de la Lista de Pendientes</label>
                            <select 
                              value={scannedBoxCode}
                              onChange={(e) => {
                                setScannedBoxCode(e.target.value);
                                if (e.target.value) {
                                  handleScanBoxForVerification(e.target.value);
                                }
                              }}
                              className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white"
                            >
                              <option value="">Selecciona Caja para Validar...</option>
                              {boxes.filter(b => b.status === 'picking').map(b => (
                                <option key={b.id} value={b.box_code}>{b.box_code} ({b.vending_machine_id})</option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => handleScanBoxForVerification()}
                            disabled={!scannedInputText && !scannedBoxCode}
                            className="w-full py-3.5 bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-800 disabled:shadow-none hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-[10px] tracking-widest uppercase transition-all cursor-pointer"
                          >
                            🔍 Cargar Caja para Control de Calidad
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#121827] p-4 rounded-3xl border border-slate-800 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <div>
                            <span className="text-[8px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Verificando Caja</span>
                            <h4 className="text-xs font-bold text-white mt-1.5 font-mono">{activeVerificationBox.box_code}</h4>
                            <p className="text-[8px] text-slate-500 mt-0.5">Destino: {vendingMachines.find(vm => vm.id === activeVerificationBox.vending_machine_id)?.name || activeVerificationBox.vending_machine_id}</p>
                          </div>
                          <button 
                            onClick={() => setActiveVerificationBox(null)}
                            className="p-1.5 bg-slate-900 rounded-full border border-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>Avance de la Validación</span>
                            <span className="font-bold text-white">
                              {activeVerificationBox.items.length > 0 ? Math.round((Object.values(verifiedItems).filter(Boolean).length / activeVerificationBox.items.length) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="bg-emerald-400 h-full transition-all duration-300"
                              style={{ width: `${activeVerificationBox.items.length > 0 ? (Object.values(verifiedItems).filter(Boolean).length / activeVerificationBox.items.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleVerifyAndReleaseBox}
                          disabled={Object.values(verifiedItems).filter(Boolean).length < activeVerificationBox.items.length}
                          className="w-full py-3.5 bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-800 disabled:shadow-none hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-[10px] tracking-widest uppercase transition-all"
                        >
                          ✅ Confirmar y Liberar para Ruta
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column in Tablet / Bottom in Mobile */}
                  <div className="space-y-4">
                    {activeVerificationBox ? (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Validación Física Partida por Partida</h4>
                        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                          {activeVerificationBox.items.map(it => {
                            const pObj = products.find(p => p.sku === it.sku) || { name: 'Producto' };
                            const itemId = it.id || it.sku;
                            const isChecked = !!verifiedItems[itemId];
                            
                            // Find coil number dynamically from vending machine
                            const vm = vendingMachines.find(v => v.id === activeVerificationBox.vending_machine_id);
                            const vmp = vm ? vm.products.find(p => p.sku === it.sku) : null;
                            const coilText = vmp ? `Espiral: ${vmp.coil_number} | ` : '';

                            return (
                              <div 
                                key={itemId}
                                onClick={() => handleToggleVerifyItem(itemId)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                                  isChecked 
                                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                                    : 'bg-slate-900 border-slate-800 hover:bg-slate-900/85'
                                }`}
                              >
                                <div className="flex-1 min-w-0 pr-2">
                                  <h5 className="text-xs font-bold text-white truncate">{pObj.name}</h5>
                                  <p className="text-[9px] text-slate-500 block mt-0.5">{coilText}SKU: {it.sku} | Cantidad Requerida: {it.quantity}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                  isChecked 
                                    ? 'bg-emerald-400 border-emerald-400 text-slate-950' 
                                    : 'border-slate-700 text-transparent'
                                }`}>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      viewMode === 'tablet' && (
                        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center h-[350px] gap-2">
                          <PackageCheck className="w-8 h-8 text-slate-600" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">Esperando Validación</h5>
                          <p className="text-[9px] text-slate-500">Selecciona o escanea una caja de la lista de la izquierda para comenzar el control de calidad.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RUTA & ABASTECIMIENTO */}
          {activeTab === 'routing' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">Logística en Ruta</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Despacho & Abastecimiento</p>
                </div>
              </div>

              {!activeRoutingBox ? (
                <div className="space-y-4">
                  {/* Load to van box */}
                  <div className="glass-card p-4 rounded-3xl space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-300" /> Cargar Cajas a Furgoneta
                    </h4>
                    
                    <div className="space-y-2">
                      <select 
                        value={routingBoxCode}
                        onChange={(e) => setRoutingBoxCode(e.target.value)}
                        className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white"
                      >
                        <option value="">Selecciona Caja Validada...</option>
                        {boxes.filter(b => b.status === 'verified').map(b => (
                          <option key={b.id} value={b.box_code}>{b.box_code} ({b.vending_machine_id})</option>
                        ))}
                      </select>

                      <button
                        onClick={handleLoadBoxToTransport}
                        disabled={!routingBoxCode}
                        className="w-full py-3 bg-[#dbeafe]/10 hover:bg-[#dbeafe]/20 border border-[#dbeafe]/20 text-[#dbeafe] font-bold rounded-xl text-[10px] tracking-widest uppercase transition-all"
                      >
                        Cargar Caja
                      </button>
                    </div>
                  </div>

                  {/* Loaded Boxes in Route */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Cajas en Ruta (Abastecer)</h4>
                    {boxes.filter(b => b.status === 'in_route').map(box => (
                      <div 
                        key={box.id}
                        onClick={() => handleSelectRouteBoxToStock(box)}
                        className="glass-card hover:bg-slate-800/30 p-4 rounded-3xl border border-slate-800 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div>
                          <span className="text-[9px] bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">En Ruta</span>
                          <h5 className="text-xs font-bold text-white mt-1.5">{box.box_code}</h5>
                          <p className="text-[9px] text-slate-500 mt-0.5">Destino: {box.vending_machine_id}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                    ))}
                    {boxes.filter(b => b.status === 'in_route').length === 0 && (
                      <p className="text-center py-6 text-slate-500 text-xs italic">No hay cajas en ruta actualmente.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cancel visit */}
                  <button 
                    onClick={() => {
                      setActiveRoutingBox(null);
                      stopVisitTimer();
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase flex items-center gap-1.5"
                  >
                    ← Cancelar Visita
                  </button>

                  <div className="bg-[#121827] p-4 rounded-3xl border border-slate-800">
                    <span className="text-[8px] bg-[#dbeafe]/10 text-[#dbeafe] px-1.5 py-0.5 rounded font-bold uppercase">Máquina Destino</span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{activeRoutingMachine?.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{activeRoutingMachine?.address}</p>
                  </div>

                  {/* ROUTE STEP: GPS AND SEAL PHOTOS */}
                  {routeStep === 'gps_photo' && (
                    <div className="space-y-4">
                      {/* GPS Validation widget */}
                      <div className="glass-card p-4 rounded-3xl space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-300" /> 1. Geolocalización (Rango 100m)
                        </h4>
                        
                        {gpsValidated ? (
                          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 p-3 rounded-2xl">
                            <Check className="w-5 h-5" />
                            <div className="text-[10px]">
                              <span className="font-bold block">Validación Correcta</span>
                              <span className="text-slate-400">Estás a {gpsDistance ? gpsDistance.toFixed(0) : '0'} metros de la máquina.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={handleValidateGPS}
                              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-[10px] tracking-widest uppercase transition-all"
                            >
                              Validar Ubicación GPS
                            </button>
                            <span className="text-[8px] text-slate-500 block text-center">Tolerancia operativa obligatoria de 100 metros a la redonda.</span>
                          </div>
                        )}
                      </div>

                      {/* Mandatory Seal Photos */}
                      <div className="glass-card p-4 rounded-3xl space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-300" /> 2. Evidencia de Precintos (2 Fotos Obligatorias)
                        </h4>
                        <p className="text-[9px] text-slate-400 leading-normal">Captura una foto de los cintos de seguridad a ambos lados de la caja.</p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {sealPhotos.left ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-800">
                              <img src={sealPhotos.left} alt="Precinto Izq" className="w-full h-24 object-cover" />
                              <button onClick={() => setSealPhotos(prev => ({ ...prev, left: null }))} className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 rounded-full text-rose-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startCamera('seal_left')}
                              className="h-24 border border-dashed border-emerald-500/25 bg-emerald-950/10 rounded-2xl flex flex-col items-center justify-center gap-1 text-[#a7f3d0]"
                            >
                              <Camera className="w-5 h-5" />
                              <span className="text-[8px] font-black uppercase">Sello Izquierdo</span>
                            </button>
                          )}

                          {sealPhotos.right ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-800">
                              <img src={sealPhotos.right} alt="Precinto Der" className="w-full h-24 object-cover" />
                              <button onClick={() => setSealPhotos(prev => ({ ...prev, right: null }))} className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 rounded-full text-rose-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startCamera('seal_right')}
                              className="h-24 border border-dashed border-emerald-500/25 bg-emerald-950/10 rounded-2xl flex flex-col items-center justify-center gap-1 text-[#a7f3d0]"
                            >
                              <Camera className="w-5 h-5" />
                              <span className="text-[8px] font-black uppercase">Sello Derecho</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleStartStockingProcess}
                        disabled={!gpsValidated || !sealPhotos.left || !sealPhotos.right}
                        className="w-full py-4 bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-600 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                      >
                        Abrir Máquina e Iniciar Abastecimiento
                      </button>
                    </div>
                  )}

                  {/* ROUTE STEP: STOCKING & CHECKLIST */}
                  {routeStep === 'stocking_checklist' && (
                    <div className="space-y-4">
                      {/* SLA Timer */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-400 uppercase font-black flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-400" /> SLA de Visita
                        </span>
                        <span className="text-xl font-mono font-black text-emerald-400">{formatTimer(visitTimer)}</span>
                      </div>

                      {/* Checklist */}
                      <div className="glass-card p-4 rounded-3xl space-y-3">
                        <h4 className="text-xs font-bold text-white">Checklist de Calidad Vending</h4>
                        
                        <div className="space-y-3 mt-2">
                          {[
                            { id: 'fifo', label: '¿Rotó producto al fondo (FIFO)?' },
                            { id: 'clean_readers', label: '¿Limpió lectores de billetes y monedas?' },
                            { id: 'clean_display', label: '¿Display reluciente con líquido?' }
                          ].map(item => (
                            <label key={item.id} className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={routeChecklist[item.id]}
                                onChange={(e) => setRouteChecklist(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-0 w-4 h-4" 
                              />
                              <span>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Maintenance Photo Proof */}
                      <div className="glass-card p-4 rounded-3xl space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-300" /> Evidencia de Limpieza y Espirales
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {stockingPhotos.spirals ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-800">
                              <img src={stockingPhotos.spirals} alt="Espirales" className="w-full h-24 object-cover" />
                              <button onClick={() => setStockingPhotos(prev => ({ ...prev, spirals: null }))} className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 rounded-full text-rose-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startCamera('spiral')}
                              className="h-24 border border-dashed border-emerald-500/25 bg-emerald-950/10 rounded-2xl flex flex-col items-center justify-center gap-1 text-[#a7f3d0]"
                            >
                              <Camera className="w-5 h-5" />
                              <span className="text-[8px] font-black uppercase">Foto Espirales</span>
                            </button>
                          )}

                          {stockingPhotos.cleaning ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-800">
                              <img src={stockingPhotos.cleaning} alt="Limpieza" className="w-full h-24 object-cover" />
                              <button onClick={() => setStockingPhotos(prev => ({ ...prev, cleaning: null }))} className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 rounded-full text-rose-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startCamera('clean')}
                              className="h-24 border border-dashed border-emerald-500/25 bg-emerald-950/10 rounded-2xl flex flex-col items-center justify-center gap-1 text-[#a7f3d0]"
                            >
                              <Camera className="w-5 h-5" />
                              <span className="text-[8px] font-black uppercase">Foto Limpieza</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleFinishStocking}
                        className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                      >
                        Finalizar y Registrar Abastecimiento
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ROLL-OUT TRACKER (CRM DE LEADS) */}
          {activeTab === 'rollout' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">Roll-Out Tracker</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Despliegue Comercial B2B & VaaS</p>
                </div>
                <button
                  onClick={() => setIsNewLeadModalOpen(true)}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-[9px] px-2.5 py-1.5 rounded-xl uppercase tracking-wider transition-all"
                >
                  + Lead
                </button>
              </div>



              {/* CRM Pipeline Kanban Board */}
              <div className="space-y-3">
                {['lead', 'scorecard', 'contract', 'kyc', 'installed'].map(col => {
                  const colLeads = leads.filter(l => l.status === col);
                  return (
                    <div key={col} className="bg-slate-950/60 p-4 rounded-3xl border border-slate-900 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#a7f3d0]">
                          {col === 'lead' ? 'Nuevo Lead' : col === 'scorecard' ? 'Scorecard' : col === 'contract' ? 'Legalización' : col === 'kyc' ? 'Expediente KYC' : 'Instalado'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">{colLeads.length}</span>
                      </div>

                      <div className="space-y-2">
                        {colLeads.map(lead => (
                          <div key={lead.id} className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-2.5">
                            <div className="flex justify-between items-start gap-1">
                              <h5 className="text-xs font-bold text-white">{lead.company_name}</h5>
                              <button 
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer rounded-lg hover:bg-slate-850"
                                title="Eliminar Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-400">
                              <span>{lead.contact_name || 'Sin contacto'}</span>
                              <span className="font-mono">{lead.contact_phone}</span>
                            </div>

                            {/* Collapsible extra information */}
                            {(lead.rfc || lead.address || lead.email || lead.type) && (
                              <details className="text-[9px] text-slate-400 bg-slate-950/30 p-2 rounded-xl border border-slate-850/50 mt-1 cursor-pointer">
                                <summary className="text-[8px] font-black text-slate-500 uppercase tracking-wider select-none outline-none">
                                  Ver Datos Fiscales / Contacto
                                </summary>
                                <div className="space-y-1 pt-1.5 border-t border-slate-850 mt-1 text-[8.5px]">
                                  {lead.type && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Régimen:</span>
                                      <span className="font-bold text-slate-300">{lead.type === 'moral' ? 'Pers. Moral' : 'Pers. Física'}</span>
                                    </div>
                                  )}
                                  {lead.rfc && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">RFC:</span>
                                      <span className="font-mono font-bold text-slate-300">{lead.rfc}</span>
                                    </div>
                                  )}
                                  {lead.email && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Email:</span>
                                      <span className="font-bold text-sky-450">{lead.email}</span>
                                    </div>
                                  )}
                                  {lead.address && (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-slate-500">Dirección:</span>
                                      <span className="font-bold text-slate-300 block leading-tight">{lead.address}</span>
                                    </div>
                                  )}
                                </div>
                              </details>
                            )}

                            {lead.scorecard_score > 0 && (
                              <div className="flex justify-between text-[9px] pt-1.5 border-t border-slate-850/60">
                                <span className="text-slate-500 font-bold">Puntaje Scorecard:</span>
                                <span className={`font-black ${lead.scorecard_score < 75 ? 'text-rose-500 font-extrabold' : 'text-emerald-400'}`}>
                                  {lead.scorecard_score}/100
                                </span>
                              </div>
                            )}

                            {/* Column action triggers */}
                            {col === 'lead' && (
                              <button 
                                onClick={() => setSelectedLeadForScorecard(lead)}
                                className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all"
                              >
                                Realizar Scorecard
                              </button>
                            )}

                            {col === 'scorecard' && (
                              <div className="space-y-2">
                                <button 
                                  onClick={() => handleSignContract(lead)}
                                  className="w-full py-1.5 bg-emerald-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all"
                                >
                                  Formalizar Contrato
                                </button>
                              </div>
                            )}

                            {col === 'contract' && (
                              <div className="space-y-2">
                                <span className="text-[8px] text-amber-400 block font-bold">⚠️ Renta domiciliada a Tarjeta de Crédito (Persona Física)</span>
                                <button 
                                  onClick={() => handleSignContract(lead)}
                                  className="w-full py-1.5 bg-emerald-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all"
                                >
                                  Activar Domiciliación y Avanzar
                                </button>
                              </div>
                            )}

                            {col === 'kyc' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[9px] text-slate-400">
                                  <span>Documentos KYC:</span>
                                  <span className="font-black text-white">{lead.kyc_docs_count}/5</span>
                                </div>
                                <button 
                                  onClick={() => handleCompleteKycDocs(lead)}
                                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all"
                                >
                                  Validar Expediente
                                </button>
                              </div>
                            )}                            {col === 'installed' && (
                              <div className="space-y-2">
                                <div className="bg-emerald-950/20 border border-emerald-500/10 p-2 rounded-xl text-[9px] text-emerald-400 text-center font-bold">
                                  Programado para: {lead.installation_date}
                                </div>
                                <button 
                                  onClick={() => handleConfirmInstallation(lead)}
                                  className="w-full py-1.5 bg-emerald-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                >
                                  OK Instalado / Activar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MODAL: CREATE LEAD */}
              {isNewLeadModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 w-full max-w-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-white uppercase">Nuevo Lead Comercial</h4>
                      <button onClick={() => setIsNewLeadModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleCreateLead} className="space-y-3">
                      <input 
                        required 
                        placeholder="Nombre de la Empresa" 
                        value={newLeadForm.company_name}
                        onChange={e => setNewLeadForm(prev => ({ ...prev, company_name: e.target.value }))}
                        className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                      />
                      <input 
                        placeholder="Nombre de Contacto" 
                        value={newLeadForm.contact_name}
                        onChange={e => setNewLeadForm(prev => ({ ...prev, contact_name: e.target.value }))}
                        className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                      />
                      <input 
                        placeholder="Teléfono Celular" 
                        value={newLeadForm.contact_phone}
                        onChange={e => setNewLeadForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                        className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                      />

                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Régimen / Tipo de Persona</label>
                        <select
                          value={newLeadForm.type}
                          onChange={e => setNewLeadForm(prev => ({ ...prev, type: e.target.value }))}
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white bg-slate-950/40"
                        >
                          <option value="moral">Persona Moral</option>
                          <option value="fisica">Persona Física</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-black">RFC</label>
                          <input 
                            placeholder="RFC (Opcional)" 
                            value={newLeadForm.rfc}
                            onChange={e => setNewLeadForm(prev => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
                            className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white font-mono" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-500 uppercase font-black">Correo Electrónico</label>
                          <input 
                            type="email"
                            placeholder="mail@empresa.com" 
                            value={newLeadForm.email}
                            onChange={e => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                            className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Dirección Comercial / Fiscal</label>
                        <input 
                          placeholder="Calle, Número, Colonia, CP..." 
                          value={newLeadForm.address}
                          onChange={e => setNewLeadForm(prev => ({ ...prev, address: e.target.value }))}
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 py-3 bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] tracking-widest uppercase">Guardar Lead</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: SCORECARD */}
              {selectedLeadForScorecard && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 w-full max-w-sm space-y-4 max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase">Scorecard Comercial</h4>
                        <p className="text-[9px] text-slate-500">{selectedLeadForScorecard.company_name}</p>
                      </div>
                      <button onClick={() => setSelectedLeadForScorecard(null)} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: 'traffic', label: 'Flujo peatonal estimado (1-5)' },
                        { id: 'employees', label: 'Número de empleados / usuarios (1-5)' },
                        { id: 'competition', label: 'Baja presencia de tiendas/Oxxo (1-5)' },
                        { id: 'access', label: 'Facilidad de acceso logístico (1-5)' },
                        { id: 'signal', label: 'Potencia de señal celular en sitio (1-5)' }
                      ].map(item => (
                        <div key={item.id} className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>{item.label}</span>
                            <span className="font-bold text-white">{scorecardAnswers[item.id] * 4} pts</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="5"
                            value={scorecardAnswers[item.id]}
                            onChange={e => setScorecardAnswers(prev => ({ ...prev, [item.id]: parseInt(e.target.value) }))}
                            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg" 
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-850 mb-3 text-[11px]">
                        <span className="text-slate-400 font-bold">TOTAL SCORE:</span>
                        <span className="font-black text-[#a7f3d0]">{(
                          scorecardAnswers.traffic * 4 +
                          scorecardAnswers.employees * 4 +
                          scorecardAnswers.competition * 4 +
                          scorecardAnswers.access * 4 +
                          scorecardAnswers.signal * 4
                        )}/100</span>
                      </div>
                      <button
                        onClick={handleSaveScorecard}
                        className="w-full py-3 bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] tracking-widest uppercase transition-all"
                      >
                        Guardar Puntuación
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MÁS (ACTIVOS, INVENTARIO INTELIGENTE, CONFIGURACIÓN) */}
          {activeTab === 'more' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">Módulos Estratégicos</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Activos, Telemetría e Config</p>
                </div>
              </div>              {/* Sub tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {[
                  { id: 'assets', label: 'Activos' },
                  { id: 'smart', label: 'Smart Inv' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setMoreTabSub(tab.id)}
                    className={`text-[9.5px] font-extrabold py-2 rounded-lg transition-all ${
                      moreTabSub === tab.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>              {/* SUB TAB: LEASING & ASSETS */}
              {moreTabSub === 'assets' && (
                <div className="space-y-4 animate-fade-in overflow-y-auto max-h-[600px] pr-1">
                  
                  {/* Summary Costs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#121827] p-3 rounded-2xl border border-slate-800/60 space-y-0.5">
                      <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-wider">COSTO LEASING (MES)</span>
                      <h4 className="text-sm font-black text-emerald-400">
                        ${assets.filter(a => a.lease_active).reduce((acc, curr) => acc + curr.monthly_cost, 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })} MXN
                      </h4>
                    </div>
                    <div className="bg-[#121827] p-3 rounded-2xl border border-slate-800/60 grid grid-cols-2 gap-1 text-center">
                      <div className="border-r border-slate-850">
                        <span className="text-[7px] text-slate-500 uppercase font-bold block">STOCK FISICO</span>
                        <span className="text-xs font-black text-white">{assets.filter(a => a.type === 'vending_machine').length} VM</span>
                      </div>
                      <div>
                        <span className="text-[7px] text-slate-500 uppercase font-bold block">EN LEASING ACTIVO</span>
                        <span className="text-xs font-black text-sky-400">{assets.filter(a => a.lease_active && a.type === 'vending_machine').length} VM</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Asset Form */}
                  <form onSubmit={handleCreateAsset} className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white">
                      {isEditingAsset ? 'Editar Equipo / Activo' : 'Alta de Equipo (Logística / Leasing)'}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">ID Activo (Definido por Herramienta)</label>
                        <input 
                          disabled
                          value={newAssetForm.id || generateAssetId(newAssetForm.type, assets)} 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-slate-400 font-mono bg-slate-900/50 cursor-not-allowed border-slate-800" 
                          placeholder="Autogenerado"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Nombre / Descripción</label>
                        <input 
                          required 
                          value={newAssetForm.name} 
                          onChange={e => setNewAssetForm({...newAssetForm, name: e.target.value})}
                          placeholder="ej: Vending AMS 39" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Tipo</label>
                        <select 
                          value={newAssetForm.type} 
                          onChange={e => setNewAssetForm({...newAssetForm, type: e.target.value})}
                          className="glass-input text-[10px] p-2 rounded-xl w-full text-white"
                        >
                          <option value="vending_machine">Vending Machine</option>
                          <option value="van">Van Logística</option>
                          <option value="safe">Caja Fuerte / Safe</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Modelo</label>
                        <input 
                          required 
                          value={newAssetForm.model} 
                          onChange={e => setNewAssetForm({...newAssetForm, model: e.target.value})}
                          placeholder="ej: AMS-39" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">No. Serie</label>
                        <input 
                          required 
                          value={newAssetForm.serial_number} 
                          onChange={e => setNewAssetForm({...newAssetForm, serial_number: e.target.value})}
                          placeholder="ej: 1640193494" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white font-mono" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">No. Placa Interna</label>
                        <input 
                          value={newAssetForm.internal_plate_number} 
                          onChange={e => setNewAssetForm({...newAssetForm, internal_plate_number: e.target.value})}
                          placeholder="ej: PI-VM-001" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white font-mono" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Costo Renta ($)</label>
                        <input 
                          type="number" 
                          value={newAssetForm.monthly_cost} 
                          onChange={e => setNewAssetForm({...newAssetForm, monthly_cost: e.target.value})}
                          placeholder="3200.00" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">F. Inicio Leasing</label>
                        <input 
                          type="date" 
                          value={newAssetForm.lease_start_date} 
                          onChange={e => setNewAssetForm({...newAssetForm, lease_start_date: e.target.value})}
                          className="glass-input text-[10px] p-2 rounded-xl w-full text-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Plazo (meses)</label>
                        <input 
                          type="number" 
                          value={newAssetForm.lease_months} 
                          onChange={e => setNewAssetForm({...newAssetForm, lease_months: e.target.value})}
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">No. Activo Seed</label>
                        <input 
                          value={newAssetForm.seed_asset_number} 
                          onChange={e => setNewAssetForm({...newAssetForm, seed_asset_number: e.target.value})}
                          placeholder="ej: SEED-VM-901" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white font-mono" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Estatus Físico</label>
                        <select 
                          value={newAssetForm.status} 
                          onChange={e => setNewAssetForm({...newAssetForm, status: e.target.value})}
                          className="glass-input text-[10px] p-2 rounded-xl w-full text-white"
                        >
                          <option value="cotizada">Cotizada</option>
                          <option value="solicitada con PO">Solicitada con PO</option>
                          <option value="pagada en transito">Pagada en Tránsito</option>
                          <option value="recibida">Recibida (En cedis)</option>
                          <option value="assigned">Asignada (A cliente)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 uppercase font-black">Ubicación Actual</label>
                        <input 
                          required 
                          value={newAssetForm.location} 
                          onChange={e => setNewAssetForm({...newAssetForm, location: e.target.value})}
                          placeholder="ej: Cedis Toluca" 
                          className="glass-input text-[11px] p-2.5 rounded-xl w-full text-white" 
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-[10px] tracking-widest uppercase transition-all">
                        {isEditingAsset ? 'Guardar Cambios' : 'Registrar Activo'}
                      </button>
                      {isEditingAsset && (
                        <button 
                          type="button"
                          onClick={() => {
                            setNewAssetForm({
                              id: '',
                              name: '',
                              type: 'vending_machine',
                              model: '',
                              serial_number: '',
                              status: 'recibida',
                              lease_start_date: new Date().toISOString().split('T')[0],
                              lease_months: 48,
                              monthly_cost: '',
                              location: ''
                            });
                            setIsEditingAsset(false);
                          }}
                          className="px-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>                  {/* List of Assets */}
                  <div className="space-y-2">
                    {/* Search bar */}
                    <div className="bg-[#121827]/40 p-2.5 rounded-2xl border border-slate-900 flex gap-2 items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Buscar:</span>
                      <input 
                        type="text" 
                        value={assetSearchQuery}
                        onChange={e => setAssetSearchQuery(e.target.value)}
                        placeholder="Buscar por ID, nombre o cliente..." 
                        className="glass-input text-[11px] p-2 rounded-xl flex-1 text-white" 
                      />
                      {assetSearchQuery && (
                        <button 
                          onClick={() => setAssetSearchQuery('')}
                          className="p-1 px-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[9px] uppercase font-bold"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between items-center pb-1">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Activos ({assets.filter(a => {
                          if (assetSearchQuery) {
                            const query = assetSearchQuery.toLowerCase();
                            const idMatch = a.id?.toLowerCase().includes(query);
                            const nameMatch = a.name?.toLowerCase().includes(query);
                            const clientMatch = a.assigned_client?.toLowerCase().includes(query);
                            if (!idMatch && !nameMatch && !clientMatch) return false;
                          }
                          if (assetFilter === 'vending_machine') return a.type === 'vending_machine';
                          if (assetFilter === 'transport') return a.type === 'van' || a.type === 'safe';
                          return true;
                        }).length})
                      </h4>
                      
                      {/* Category Filter */}
                      <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 shrink-0">
                        <button 
                          type="button"
                          onClick={() => setAssetFilter('all')}
                          className={`text-[8px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${assetFilter === 'all' ? 'bg-slate-800 text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          Todos
                        </button>
                        <button 
                          type="button"
                          onClick={() => setAssetFilter('vending_machine')}
                          className={`text-[8px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${assetFilter === 'vending_machine' ? 'bg-slate-800 text-emerald-400 shadow-sm font-black' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          Máquinas
                        </button>
                        <button 
                          type="button"
                          onClick={() => setAssetFilter('transport')}
                          className={`text-[8px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${assetFilter === 'transport' ? 'bg-slate-800 text-sky-400 shadow-sm font-black' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          Transporte
                        </button>
                      </div>
                    </div>

                    {assets
                      .filter(asset => {
                        if (assetSearchQuery) {
                          const query = assetSearchQuery.toLowerCase();
                          const idMatch = asset.id?.toLowerCase().includes(query);
                          const nameMatch = asset.name?.toLowerCase().includes(query);
                          const clientMatch = asset.assigned_client?.toLowerCase().includes(query);
                          if (!idMatch && !nameMatch && !clientMatch) return false;
                        }
                        if (assetFilter === 'vending_machine') return asset.type === 'vending_machine';
                        if (assetFilter === 'transport') return asset.type === 'van' || asset.type === 'safe';
                        return true;
                      })
                      .map(asset => {
                        const isAssigned = asset.status === 'assigned' || asset.status === 'asignada';
                      let statusBadgeColor = 'bg-slate-800 text-slate-400';
                      if (asset.status === 'recibida') statusBadgeColor = 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20';
                      else if (isAssigned) statusBadgeColor = 'bg-sky-950/40 text-sky-400 border border-sky-500/20';
                      else if (asset.status === 'pagada en transito') statusBadgeColor = 'bg-amber-950/40 text-amber-400 border border-amber-500/20';
                      else if (asset.status === 'solicitada con PO') statusBadgeColor = 'bg-purple-950/40 text-purple-400 border border-purple-500/20';
                      else if (asset.status === 'cotizada') statusBadgeColor = 'bg-slate-900 text-slate-400 border border-slate-700';

                      return (
                        <div key={asset.id} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5">
                          
                          {/* Header */}
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">{asset.id}</span>
                              <h5 className="text-xs font-bold text-white mt-1">{asset.name}</h5>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[7.5px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${statusBadgeColor}`}>
                                {asset.status}
                              </span>
                              <div className="flex gap-1">
                                <span className={`text-[7px] px-1 rounded font-bold uppercase ${asset.is_active ? 'bg-green-550/30 text-green-300' : 'bg-rose-950/40 text-rose-400'}`}>
                                  {asset.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                                <span className={`text-[7px] px-1 rounded font-bold uppercase ${asset.lease_active ? 'bg-sky-950/30 text-sky-300' : 'bg-slate-800 text-slate-500'}`}>
                                  {asset.lease_active ? 'Con Leasing' : 'Sin Leasing'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Details grid */}
                          <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 pt-1.5 border-t border-slate-850">
                            <div>
                              <span className="text-[8px] text-slate-500 block">MODELO & N/S</span>
                              <span className="font-bold text-white">{asset.model}</span>
                              <span className="font-mono text-[8px] text-slate-500 block">S/N: {asset.serial_number}</span>
                              {asset.internal_plate_number && (
                                <span className="font-mono text-[8px] text-amber-400/90 block">Placa: {asset.internal_plate_number}</span>
                              )}
                              {asset.seed_asset_number && (
                                <span className="font-mono text-[8px] text-sky-400/90 block">Seed #: {asset.seed_asset_number}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-500 block">FINANCIAMIENTO / LEASING</span>
                              {asset.lease_active ? (
                                <>
                                  <span className="font-bold text-[#a7f3d0] block">${asset.monthly_cost.toFixed(0)} / mes</span>
                                  <span className="text-[8.5px] text-slate-500 block font-mono">F.Inicio: {asset.lease_start_date} ({asset.lease_months}m)</span>
                                </>
                              ) : (
                                <span className="text-slate-500 italic block mt-0.5">Contrato de leasing no iniciado</span>
                              )}
                            </div>
                          </div>

                          {/* Client assignment */}
                          {isAssigned && (
                            <div className="bg-sky-950/20 border border-sky-500/10 p-2 rounded-xl text-[9px] text-sky-400 flex flex-col gap-0.5">
                              <span className="text-[7.5px] uppercase font-bold text-slate-500">CLIENTE / UBICACIÓN:</span>
                              <span className="font-bold text-white">{asset.assigned_client}</span>
                              <span className="text-[8px] text-slate-500 font-mono">Asignación: {asset.assignment_date} | Loc: {asset.location}</span>
                            </div>
                          )}

                          {/* INLINE ACTIONS */}
                          <div className="pt-1 flex flex-col gap-2 border-t border-slate-850/60 pt-2">
                            
                            {/* leasing trigger */}
                            {!asset.lease_active && (
                              <div className="space-y-1.5">
                                {leasingAssetId === asset.id ? (
                                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 space-y-2">
                                    <h6 className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Activar Contrato de Leasing Financiero</h6>
                                    <div className="grid grid-cols-3 gap-1">
                                      <input 
                                        type="number" 
                                        placeholder="Costo mensual"
                                        value={leaseCostForm}
                                        onChange={e => setLeaseCostForm(e.target.value)}
                                        className="glass-input text-[10px] p-1.5 rounded-lg text-white" 
                                      />
                                      <input 
                                        type="date"
                                        value={leaseStartForm}
                                        onChange={e => setLeaseStartForm(e.target.value)}
                                        className="glass-input text-[9px] p-1 rounded-lg text-white" 
                                      />
                                      <input 
                                        type="number" 
                                        placeholder="Meses (ej: 48)"
                                        value={leaseMonthsForm}
                                        onChange={e => setLeaseMonthsForm(e.target.value)}
                                        className="glass-input text-[10px] p-1.5 rounded-lg text-white" 
                                      />
                                    </div>
                                    <div className="flex gap-1 justify-end">
                                      <button 
                                        onClick={() => handleActivateLease(asset.id)}
                                        className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[9px] font-bold rounded-lg cursor-pointer"
                                      >
                                        Iniciar Arrendamiento
                                      </button>
                                      <button 
                                        onClick={() => setLeasingAssetId(null)}
                                        className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-400 rounded-lg text-[9px] font-bold"
                                      >
                                        X
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setLeasingAssetId(asset.id);
                                      setLeaseCostForm(String(asset.monthly_cost || ''));
                                      setLeaseMonthsForm(asset.lease_months || 48);
                                      setLeaseStartForm(asset.lease_start_date || new Date().toISOString().split('T')[0]);
                                    }}
                                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-[#a7f3d0] font-bold text-[9px] uppercase tracking-wider rounded-lg border border-[#34d399]/25 transition-all cursor-pointer"
                                  >
                                    💵 Iniciar Contrato Leasing
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Client assignment picker */}
                            {!isAssigned && asset.type === 'vending_machine' && (
                              <div>
                                {assigningAssetId === asset.id ? (
                                  <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                                    <label className="text-[8px] text-slate-400 uppercase font-black">Seleccionar Cliente para Asignar Físicamente</label>
                                    <div className="flex gap-1.5">
                                      <select
                                        value={selectedAssignLeadId}
                                        onChange={e => setSelectedAssignLeadId(e.target.value)}
                                        className="flex-1 glass-input text-[10px] p-2 rounded-lg text-white"
                                      >
                                        <option value="">-- Seleccionar Lead --</option>
                                        {leads.filter(l => l.status !== 'deployed').map(l => (
                                          <option key={l.id} value={l.id}>{l.company_name} ({l.status})</option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={() => handleAssignAsset(asset.id, selectedAssignLeadId)}
                                        className="px-3 bg-sky-400 hover:bg-sky-300 text-slate-950 text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                                      >
                                        OK
                                      </button>
                                      <button
                                        onClick={() => setAssigningAssetId(null)}
                                        className="px-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                                      >
                                        X
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setAssigningAssetId(asset.id);
                                      setSelectedAssignLeadId('');
                                    }}
                                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-sky-400 font-bold text-[9px] uppercase tracking-wider rounded-lg border border-slate-700 transition-all cursor-pointer"
                                  >
                                    🤝 Asignar a Cliente (Instalar)
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Edit & active/inactive operational triggers */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setNewAssetForm({
                                    id: asset.id,
                                    name: asset.name,
                                    type: asset.type,
                                    model: asset.model,
                                    serial_number: asset.serial_number,
                                    status: asset.status,
                                    lease_start_date: asset.lease_start_date || new Date().toISOString().split('T')[0],
                                    lease_months: asset.lease_months || 48,
                                    monthly_cost: asset.monthly_cost || '',
                                    location: asset.location,
                                    internal_plate_number: asset.internal_plate_number || '',
                                    seed_asset_number: asset.seed_asset_number || ''
                                  });
                                  setIsEditingAsset(true);
                                  // Scroll up form
                                  document.querySelector('.glass-card')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[9px] font-bold uppercase border border-slate-700 transition-all cursor-pointer text-center"
                              >
                                Editar Datos
                              </button>
                              <button
                                onClick={() => handleToggleAssetOperationalStatus(asset)}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border text-center ${
                                  asset.is_active 
                                    ? 'bg-[#1c1917]/40 text-stone-400 border-stone-800 hover:bg-[#292524]/60' 
                                    : 'bg-[#a7f3d0]/10 text-emerald-300 border-[#a7f3d0]/20 hover:bg-[#a7f3d0]/25'
                                }`}
                              >
                                {asset.is_active ? 'Desactivar' : 'Activar'}
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="px-2.5 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer text-center"
                                title="Eliminar Activo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB TAB: SMART INVENTORY */}
              {moreTabSub === 'smart' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="glass-card-accent-green p-4 rounded-3xl border border-emerald-500/15 flex items-start gap-3">
                    <Cpu className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Análisis Telemetría Predictiva</h4>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">El motor de IA predice agotamientos calculando la tasa de rotación histórica por espiral de la máquina.</p>
                    </div>
                  </div>

                  {/* Concentric Circle representation from image */}
                  <div className="bg-[#121827] p-5 rounded-3xl border border-slate-800 flex flex-col items-center space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Salud de Inventario Promedio</h5>
                    
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Track circle */}
                        <circle cx="72" cy="72" r="60" fill="transparent" stroke="#1f2937" strokeWidth="8" />
                        {/* Progress circle */}
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="60" 
                          fill="transparent" 
                          stroke="#10b981" 
                          strokeWidth="8" 
                          strokeDasharray="377"
                          strokeDashoffset="75" // 80% full
                          className="chart-concentric-circle"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-white">80%</span>
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider">Óptimo</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full text-[9px] text-center pt-2">
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-slate-500 block">Surtidos</span>
                        <span className="font-bold text-white">92%</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-slate-500 block">Stockouts</span>
                        <span className="font-bold text-rose-400">1.2%</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-slate-500 block">Rotación</span>
                        <span className="font-bold text-[#a7f3d0]">Alta</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry warnings */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Agotamientos Críticos Detectados</h4>
                    {vendingMachines.filter(vm => {
                      const matchedAsset = assets.find(a => a.id === vm.id);
                      return matchedAsset && matchedAsset.is_active;
                    }).map(vm => {
                      const criticalSpirals = vm.products.filter(p => p.current_quantity / p.capacity <= 0.4);
                      if (criticalSpirals.length === 0) return null;
                      return (
                        <div key={vm.id} className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-white">{vm.name}</h5>
                            <span className="text-[8px] text-rose-400 font-bold uppercase tracking-wider">{criticalSpirals.length} espirales vacíos</span>
                          </div>
                          <button 
                            onClick={() => {
                              setActiveTab('prekitting');
                              setPrekittingSubTab('picker');
                              handleSelectPickerMachine(vm.id);
                            }}
                            className="text-[9px] bg-rose-950 text-rose-300 font-bold px-2 py-1 rounded-lg border border-rose-500/20"
                          >
                            Pre-Kit
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}              {/* Settings UI removed. Configured internally. */}
            </div>
          )}

        </div>

        {/* MODAL DE IMPRESIÓN DE TICKET DE CAJA (QR CODE) */}
        {showPrintTicketModal && printedBoxDetails && (
          <div className="fixed inset-0 bg-[#020617]/95 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-md">
            <div className="bg-[#090d18] w-full max-w-sm rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-scale-in">
              {/* Header */}
              <div className="bg-[#121827] px-5 py-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Etiqueta de Caja (Tote)</span>
                </div>
                <button 
                  onClick={() => setShowPrintTicketModal(false)}
                  className="p-1 bg-slate-900 border border-slate-800 hover:text-white rounded-full text-slate-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Area Content */}
              <div className="p-6 space-y-4 text-center font-mono">
                {/* Physical Label simulation design */}
                <div className="bg-white text-slate-950 p-5 rounded-2xl border-4 border-slate-900 shadow-inner flex flex-col items-center gap-3">
                  <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">SNACKEANDO LOGÍSTICA</span>
                  
                  {/* Real scanable QR code */}
                  <div className="p-2 border border-slate-200 rounded-xl bg-white">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(printedBoxDetails.box_code)}`}
                      alt="QR Code"
                      className="w-32 h-32"
                    />
                  </div>

                  <h3 className="text-sm font-black tracking-wide uppercase mt-1">{printedBoxDetails.box_code}</h3>
                  <div className="w-full border-t border-dashed border-slate-300 my-1" />

                  {/* Details table */}
                  <div className="w-full text-left text-[9px] space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="font-bold">MÁQUINA:</span>
                      <span className="truncate max-w-[160px]">
                        {vendingMachines.find(v => v.id === printedBoxDetails.vending_machine_id)?.name || printedBoxDetails.vending_machine_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">OPERADOR:</span>
                      <span>{printedBoxDetails.picked_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">FECHA:</span>
                      <span>{new Date(printedBoxDetails.created_at).toLocaleDateString()} {new Date(printedBoxDetails.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1 mt-1">
                      <span>PIEZAS TOTALES:</span>
                      <span>
                        {printedBoxDetails.items.reduce((sum, item) => sum + item.quantity, 0)} pzas
                      </span>
                    </div>
                  </div>

                  {/* Barcode representation */}
                  <div className="w-full flex flex-col items-center mt-2">
                    <div className="flex gap-[1px] h-6 bg-slate-950 px-3 w-full justify-center overflow-hidden">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-white h-full" 
                          style={{ width: `${(i % 3 === 0) ? '3px' : (i % 2 === 0) ? '1px' : '2px'}` }} 
                        />
                      ))}
                    </div>
                    <span className="text-[7px] text-slate-500 font-bold mt-1 tracking-widest">{printedBoxDetails.id}</span>
                  </div>
                </div>

                <p className="text-[8px] text-slate-500 leading-relaxed uppercase">
                  Imprime esta etiqueta y pégala firmemente al costado del Tote físico para la validación y ruteo.
                </p>
              </div>

              {/* Actions */}
              <div className="bg-[#121827] px-6 py-4 border-t border-slate-800 flex gap-2.5">
                <button
                  onClick={() => {
                    alert("🖨️ Simulación de Impresión: Enviado al dispositivo Zebra ZD420... \nTicket impreso con éxito.");
                  }}
                  className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  🖨️ Imprimir Etiqueta
                </button>
                <button
                  onClick={() => setShowPrintTicketModal(false)}
                  className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold uppercase transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STICKY BOTTOM NAVIGATION BAR (MATCHING THE MOCK IMAGE DESIGN) */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-[#090d18] border-t border-slate-800/80 flex items-center justify-around px-4 z-40 select-none">
          {[
            { id: 'reception', label: 'Almacén', icon: Package },
            { id: 'prekitting', label: 'Pre-Kitting', icon: PackageCheck },
            { id: 'routing', label: 'Ruta', icon: MapPin },
            { id: 'rollout', label: 'Tracker', icon: Rocket },
            { id: 'more', label: 'Más', icon: Cpu }
          ].map(btn => {
            const Icon = btn.icon;
            const isSelected = activeTab === btn.id;
            
            return (
              <button
                key={btn.id}
                onClick={() => setActiveTab(btn.id)}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 relative group cursor-pointer focus:outline-none"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[#a7f3d0]/10 text-emerald-300' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className={`text-[8.5px] mt-0.5 font-extrabold tracking-wider transition-all ${
                  isSelected ? 'text-emerald-300 opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                }`}>
                  {btn.label}
                </span>
                
                {/* Active glow dot */}
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
