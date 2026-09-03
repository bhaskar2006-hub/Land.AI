import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.gis import Parcel
from backend.app.models.land_record import LandRecord

class GISService:
    """
    Cadastral Geospatial & Parcel Query Service:
    - GeoJSON cadastral boundary overlays
    - Survey Number polygon matching
    - Centroid and area calculation
    """
    def __init__(self):
        pass

    def get_parcels_geojson(self, db: Session, district_code: Optional[str] = None) -> Dict[str, Any]:
        query = db.query(Parcel)
        if district_code:
            query = query.filter(Parcel.district_code == district_code)

        parcels = query.all()
        features = []

        for p in parcels:
            try:
                geom = json.loads(p.geojson_geometry)
            except Exception:
                geom = {"type": "Polygon", "coordinates": []}

            props = {}
            if p.geojson_properties:
                try:
                    props = json.loads(p.geojson_properties)
                except Exception:
                    pass

            props.update({
                "parcel_id": p.parcel_id,
                "survey_no": p.survey_no,
                "area_hectares": p.area_hectares,
                "centroid_lat": p.centroid_lat,
                "centroid_lng": p.centroid_lng,
                "district_code": p.district_code,
                "village_code": p.village_code
            })

            # Check if linked to validated land record
            if p.record_id:
                rec = db.query(LandRecord).filter(LandRecord.record_id == p.record_id).first()
                if rec:
                    props["owner_name"] = rec.owner_name
                    props["land_class"] = rec.land_class
                    props["status"] = "VALIDATED"
                    props["plot_area_raw"] = rec.plot_area_raw
                    props["is_disputed"] = rec.is_disputed

            features.append({
                "type": "Feature",
                "id": p.parcel_id,
                "geometry": geom,
                "properties": props
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }

    def get_parcel_by_survey(self, db: Session, survey_no: str) -> Optional[Parcel]:
        return db.query(Parcel).filter(Parcel.survey_no == survey_no).first()

gis_service = GISService()
