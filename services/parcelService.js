/**
 * Parcel Service (GIS)
 * Manages spatial queries, GeoJSON cadastral layers, parcel centroids, and area calculations.
 * Structure ready for future API: GET /api/parcels/survey/:surveyNumber, GET /api/parcels/:parcelId
 */

class ParcelService {
  constructor() {
    this.geojsonData = null;
    this.loadPromise = null;
  }

  async loadParcels() {
    if (this.geojsonData) return this.geojsonData;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = fetch('/data/parcels_500.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} loading parcels`);
        return res.json();
      })
      .then(data => {
        this.geojsonData = data;
        return data;
      })
      .catch(err => {
        console.warn('Could not fetch via HTTP, falling back to local memory if available:', err);
        return null;
      });

    return this.loadPromise;
  }

  async findBySurveyNumber(surveyNo) {
    const data = await this.loadParcels();
    if (!data || !data.features) return null;
    const cleanQuery = surveyNo.trim().toLowerCase();
    const match = data.features.find(f => 
      f.properties.survey_no.toLowerCase() === cleanQuery ||
      f.properties.survey_no.replace(/\s+/g, '') === cleanQuery.replace(/\s+/g, '')
    );
    return match ? { ...match } : null;
  }

  async findByKhataNumber(khataNo) {
    const data = await this.loadParcels();
    if (!data || !data.features) return null;
    const clean = khataNo.trim().toLowerCase();
    const match = data.features.find(f => f.properties.khata_no.toLowerCase() === clean);
    return match ? { ...match } : null;
  }

  async searchParcels(query) {
    const data = await this.loadParcels();
    if (!data || !data.features) return [];
    if (!query) return data.features.slice(0, 20);
    const q = query.trim().toLowerCase();
    return data.features.filter(f => 
      f.properties.survey_no.toLowerCase().includes(q) ||
      f.properties.pattadar_name.toLowerCase().includes(q) ||
      f.properties.khata_no.toLowerCase().includes(q) ||
      f.properties.village.toLowerCase().includes(q)
    ).slice(0, 30);
  }

  getSurvey124_3Data() {
    return {
      surveyNo: '124/3',
      parcelId: 'AP-GNT-0263',
      owner: 'Ravi Kumar',
      khata: 'KH-2048',
      village: 'Mangalagiri',
      mandal: 'Mangalagiri',
      district: 'Guntur',
      gisArea: '2.31 Acres',
      docArea: '2.45 Acres',
      status: 'GIS Conflict',
      discrepancy: '-0.14 Acres (-6,098.4 sq.ft)',
      centroid: [16.43482, 80.56621],
      isDemoData: true
    };
  }
}

export const parcelService = new ParcelService();
