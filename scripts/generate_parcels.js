import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseLat = 16.43482;
const baseLng = 80.56621;
const count = 500;

// Create 500 parcels around Mangalagiri
const features = [];
const cols = 25;
const rows = 20; // 25 * 20 = 500 parcels

const firstNames = ['Ravi', 'Venkatesh', 'Srinivasa', 'Lakshmi', 'Satyanarayana', 'Subba', 'Appa', 'Narayana', 'Koteswara', 'Radha', 'Sujatha', 'Ramana', 'Govind', 'Krishna', 'Mohan'];
const lastNames = ['Kumar', 'Rao', 'Reddy', 'Devi', 'Raju', 'Chowdary', 'Sharma', 'Naidu', 'Murthy', 'Varma', 'Babu', 'Prasad'];
const villages = ['Mangalagiri', 'Atchampet', 'Navuluru', 'Nidamarru', 'Kuragallu', 'Yerrabalem'];

let index = 0;
const dLat = 0.0018; // approx 200m
const dLng = 0.0022; // approx 230m

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    index++;
    const surveyMajor = 100 + r * 5 + Math.floor(c / 5);
    const surveySub = (c % 5) + 1;
    let surveyNo = `${surveyMajor}/${surveySub}`;
    let isTarget = false;

    // Center target parcel 124/3
    if (r === 10 && c === 12) {
      surveyNo = '124/3';
      isTarget = true;
    } else if (surveyNo === '124/3') {
      surveyNo = `${surveyMajor}/9`;
    }

    const cLat = baseLat + (r - rows / 2) * dLat;
    const cLng = baseLng + (c - cols / 2) * dLng;

    // Add slight irregular jitter to polygon vertices to simulate cadastral land plots
    const jitter = () => (Math.random() - 0.5) * 0.00035;
    const p1 = [Number((cLng - dLng * 0.48 + jitter()).toFixed(6)), Number((cLat - dLat * 0.48 + jitter()).toFixed(6))];
    const p2 = [Number((cLng + dLng * 0.48 + jitter()).toFixed(6)), Number((cLat - dLat * 0.46 + jitter()).toFixed(6))];
    const p3 = [Number((cLng + dLng * 0.46 + jitter()).toFixed(6)), Number((cLat + dLat * 0.48 + jitter()).toFixed(6))];
    const p4 = [Number((cLng - dLng * 0.48 + jitter()).toFixed(6)), Number((cLat + dLat * 0.46 + jitter()).toFixed(6))];

    const owner = isTarget ? 'Ravi Kumar' : `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;
    const khata = isTarget ? 'KH-2048' : `KH-${1000 + (index * 7) % 4000}`;
    const docArea = isTarget ? 2.45 : Number((0.85 + ((index * 37) % 400) / 100).toFixed(2));
    const gisArea = isTarget ? 2.31 : docArea;
    const status = isTarget ? 'GIS Conflict' : (index % 17 === 0 ? 'Review Required' : 'Synchronized');
    const classification = (index % 4 === 0) ? 'Agricultural (Dry)' : 'Agricultural (Wet / Jirayati)';
    const village = isTarget ? 'Mangalagiri' : villages[index % villages.length];

    features.push({
      type: 'Feature',
      id: `PARCEL_${index}`,
      properties: {
        parcel_id: `AP-GNT-${index.toString().padStart(4, '0')}`,
        survey_no: surveyNo,
        khata_no: khata,
        pattadar_name: owner,
        district: 'Guntur',
        mandal: 'Mangalagiri',
        village: village,
        doc_area_acres: docArea,
        gis_area_acres: gisArea,
        area_delta_acres: Number((gisArea - docArea).toFixed(2)),
        status: status,
        classification: classification,
        is_demo_data: true,
        discrepancy_note: isTarget ? 'Road expansion easement encroachment (-0.14 Acres along North boundary)' : null
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[p1, p2, p3, p4, p1]]
      }
    });
  }
}

const geojson = {
  type: 'FeatureCollection',
  name: 'Mangalagiri_Cadastral_Parcels_500',
  crs: {
    type: 'name',
    properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
  },
  metadata: {
    total_parcels: count,
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    generator: 'LAND•AI Synthetic Cadastral Engine',
    classification: 'DEMO DATA'
  },
  features: features
};

const outputDir = path.resolve(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'parcels_500.geojson'), JSON.stringify(geojson, null, 2));
console.log(`Generated ${count} parcels in public/data/parcels_500.geojson`);
