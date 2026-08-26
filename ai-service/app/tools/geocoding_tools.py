from typing import Dict, Any, Optional, Tuple
import httpx

# Pre-indexed high-precision coordinates for Indian cities, agricultural hubs, and major centers
INDIAN_CITIES_GEOCODE = {
    "mumbai": (19.0760, 72.8777, "Mumbai, Maharashtra"),
    "delhi": (28.6139, 77.2090, "New Delhi, Delhi"),
    "new delhi": (28.6139, 77.2090, "New Delhi, Delhi"),
    "kolkata": (22.5726, 88.3639, "Kolkata, West Bengal"),
    "chennai": (13.0827, 80.2707, "Chennai, Tamil Nadu"),
    "bengaluru": (12.9716, 77.5946, "Bengaluru, Karnataka"),
    "bangalore": (12.9716, 77.5946, "Bengaluru, Karnataka"),
    "hyderabad": (17.3850, 78.4867, "Hyderabad, Telangana"),
    "ahmedabad": (23.0225, 72.5714, "Ahmedabad, Gujarat"),
    "pune": (18.5204, 73.8567, "Pune, Maharashtra"),
    "jaipur": (26.9124, 75.7873, "Jaipur, Rajasthan"),
    "lucknow": (26.8467, 80.9462, "Lucknow, Uttar Pradesh"),
    "kanpur": (26.4499, 80.3319, "Kanpur, Uttar Pradesh"),
    "patna": (25.5941, 85.1376, "Patna, Bihar"),
    "bhubaneswar": (20.2961, 85.8245, "Bhubaneswar, Odisha"),
    "puri": (19.8135, 85.8312, "Puri, Odisha"),
    "cuttack": (20.4625, 85.8830, "Cuttack, Odisha"),
    "ranchi": (23.3441, 85.3096, "Ranchi, Jharkhand"),
    "guwahati": (26.1445, 91.7362, "Guwahati, Assam"),
    "chandigarh": (30.7333, 76.7794, "Chandigarh, Punjab & Haryana"),
    "amritsar": (31.6340, 74.8723, "Amritsar, Punjab"),
    "ludhiana": (30.9010, 75.8573, "Ludhiana, Punjab"),
    "bhopal": (23.2599, 77.4126, "Bhopal, Madhya Pradesh"),
    "indore": (22.7196, 75.8577, "Indore, Madhya Pradesh"),
    "nagpur": (21.1458, 79.0882, "Nagpur, Maharashtra"),
    "visakhapatnam": (17.6868, 83.2185, "Visakhapatnam, Andhra Pradesh"),
    "vizag": (17.6868, 83.2185, "Visakhapatnam, Andhra Pradesh"),
    "vijayawada": (16.5062, 80.6480, "Vijayawada, Andhra Pradesh"),
    "kochi": (9.9312, 76.2673, "Kochi, Kerala"),
    "thiruvananthapuram": (8.5241, 76.9366, "Thiruvananthapuram, Kerala"),
    "trivandrum": (8.5241, 76.9366, "Thiruvananthapuram, Kerala"),
    "coimbatore": (11.0168, 76.9558, "Coimbatore, Tamil Nadu"),
    "madurai": (9.9252, 78.1198, "Madurai, Tamil Nadu"),
    "surat": (21.1702, 72.8311, "Surat, Gujarat"),
    "vadodara": (22.3072, 73.1812, "Vadodara, Gujarat"),
    "rajkot": (22.3039, 70.8022, "Rajkot, Gujarat"),
    "shimla": (31.1048, 77.1734, "Shimla, Himachal Pradesh"),
    "dehradun": (30.3165, 78.0322, "Dehradun, Uttarakhand"),
    "srinagar": (34.0837, 74.7973, "Srinagar, Jammu and Kashmir"),
    "jammu": (32.7266, 74.8570, "Jammu, Jammu and Kashmir"),
    "goa": (15.2993, 74.1240, "Panaji, Goa"),
    "panaji": (15.4909, 73.8278, "Panaji, Goa")
}

async def geocode_location(location_name: str) -> Tuple[float, float, str]:
    """
    Resolve location name to (lat, lon, formatted_name)
    """
    if not location_name or not location_name.strip():
        # Default to Kolkata/India centroid
        return (22.5726, 88.3639, "Kolkata, West Bengal")

    clean_name = location_name.strip().lower()
    
    # 1. Direct registry lookup
    for key, (lat, lon, full_name) in INDIAN_CITIES_GEOCODE.items():
        if key in clean_name or clean_name in key:
            return (lat, lon, full_name)

    # 2. Open-Meteo Geocoding API lookup
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                params={"name": location_name, "count": 1, "language": "en", "format": "json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                if "results" in data and len(data["results"]) > 0:
                    r = data["results"][0]
                    name = f"{r.get('name')}, {r.get('admin1', '')} {r.get('country', '')}".strip()
                    return (float(r["latitude"]), float(r["longitude"]), name)
    except Exception:
        pass

    # Fallback to default
    return (22.5726, 88.3639, location_name.title())
