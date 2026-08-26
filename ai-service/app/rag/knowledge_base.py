"""
Curated Domain Knowledge Base for Indian & Global Meteorology, Agro-Advisories, and Disaster Response
"""

METEOROLOGICAL_KNOWLEDGE_BASE = [
    # 1. IMD Alert & Warning System
    {
        "id": "imd_color_codes",
        "title": "IMD 4-Color Warning Code System",
        "category": "disaster_alerts",
        "keywords": ["color code", "green", "yellow", "orange", "red", "alert level", "imd warning", "meaning"],
        "source": "India Meteorological Department (IMD) Standard Operating Procedure",
        "content": (
            "IMD issues weather warnings in 4 standardized color codes:\n"
            "1. GREEN (No Warning): Weather conditions are normal. No action is required.\n"
            "2. YELLOW (Watch / Be Updated): Weather condition is likely to deteriorate. Keep track of local weather updates.\n"
            "3. ORANGE (Alert / Be Prepared): High likelihood of severe weather causing disruptions in transport, power, or waterlogging. Be prepared for emergencies.\n"
            "4. RED (Warning / Take Action): Extreme and hazardous weather imminent (e.g., extremely heavy rain > 204.4mm, violent cyclone, severe heatwave). Immediate protective actions, evacuation from vulnerable zones, and following NDMA directives are required."
        )
    },
    {
        "id": "imd_cyclone_stages",
        "title": "IMD 4-Stage Cyclone Warning Protocol",
        "category": "disaster_alerts",
        "keywords": ["cyclone", "4 stage", "pre-cyclone watch", "cyclone alert", "cyclone warning", "post-landfall outlook", "bay of bengal", "arabian sea"],
        "source": "IMD National Cyclone Warning Centre (NCWC)",
        "content": (
            "IMD operates a specialized 4-stage cyclone warning dissemination mechanism:\n"
            "Stage 1: Pre-Cyclone Watch (issued 72 hours in advance of development of cyclonic disturbance).\n"
            "Stage 2: Cyclone Alert / Yellow Message (issued at least 48 hours prior to expected commencement of adverse weather in coastal areas).\n"
            "Stage 3: Cyclone Warning / Orange Message (issued at least 24 hours in advance specifying landfall location and estimated storm surge height).\n"
            "Stage 4: Post-Landfall Outlook / Red Message (issued 12 hours prior to landfall giving inland degradation, high winds, and flash flooding risks)."
        )
    },
    {
        "id": "imd_cyclone_intensity_scale",
        "title": "IMD Cyclone Wind Intensity Classification",
        "category": "meteorological_standards",
        "keywords": ["cyclone classification", "depression", "deep depression", "cyclonic storm", "severe cyclonic storm", "super cyclone", "wind speed"],
        "source": "IMD World Meteorological Organization (WMO) Regional Centre",
        "content": (
            "Classification of Cyclonic Disturbances over North Indian Ocean by 3-minute sustained wind speed:\n"
            "- Low Pressure Area: Wind speed < 31 km/h (< 17 knots)\n"
            "- Depression: 31 - 49 km/h (17 - 27 knots)\n"
            "- Deep Depression: 50 - 61 km/h (28 - 33 knots)\n"
            "- Cyclonic Storm (CS): 62 - 88 km/h (34 - 47 knots)\n"
            "- Severe Cyclonic Storm (SCS): 89 - 117 km/h (48 - 63 knots)\n"
            "- Very Severe Cyclonic Storm (VSCS): 118 - 166 km/h (64 - 89 knots)\n"
            "- Extremely Severe Cyclonic Storm (ESCS): 167 - 221 km/h (90 - 119 knots)\n"
            "- Super Cyclonic Storm (SuCS): >= 222 km/h (>= 120 knots)"
        )
    },

    # 2. Monsoon Mechanisms & Climate Anomalies
    {
        "id": "indian_monsoon_dynamics",
        "title": "Indian Monsoon Dynamics & Branches",
        "category": "monsoon_climate",
        "keywords": ["monsoon", "southwest monsoon", "arabian sea branch", "bay of bengal branch", "onset", "kerala", "withdrawal", "northeast monsoon"],
        "source": "IMD Climate Diagnostics",
        "content": (
            "The Southwest (SW) Monsoon delivers ~75% of India's annual precipitation between June and September. It operates via two primary branches:\n"
            "1. Arabian Sea Branch: Hits the Western Ghats causing heavy orographic precipitation along coastal Maharashtra, Goa, Karnataka, and Kerala.\n"
            "2. Bay of Bengal Branch: Moves up through the Bay of Bengal, deflected by the Himalayas across West Bengal, Odisha, Gangetic Plains, and North-East India.\n"
            "The Northeast (NE) Monsoon (October-December) brings crucial winter rainfall to coastal Andhra Pradesh, Rayalaseema, and Tamil Nadu."
        )
    },
    {
        "id": "el_nino_lanina_iod",
        "title": "Impact of El Niño, La Niña & Indian Ocean Dipole (IOD) on Indian Weather",
        "category": "monsoon_climate",
        "keywords": ["el nino", "la nina", "enso", "iod", "indian ocean dipole", "pacific", "monsoon deficit", "drought", "excess rain"],
        "source": "Ministry of Earth Sciences (MoES) Climate Report",
        "content": (
            "Global teleconnections significantly alter Indian monsoon behavior:\n"
            "- El Niño: Anomalous warming of central & eastern equatorial Pacific, historically associated with ~60% probability of below-normal monsoon rainfall in India.\n"
            "- La Niña: Anomalous cooling of central/eastern equatorial Pacific, typically correlates with normal or above-normal monsoon rainfall and heightened post-monsoon cyclone activity.\n"
            "- Positive IOD: Warmer western Indian Ocean relative to eastern, acts as a beneficial buffer compensating for El Niño and enhancing rainfall.\n"
            "- Negative IOD: Impedes monsoon flow and reduces central Indian rainfall."
        )
    },
    {
        "id": "western_disturbances",
        "title": "Western Disturbances in North India",
        "category": "monsoon_climate",
        "keywords": ["western disturbance", "wd", "winter rain", "snowfall", "himalayas", "rabi crop", "fog", "cold wave"],
        "source": "IMD Meteorological Monograph",
        "content": (
            "Western Disturbances (WDs) are extra-tropical weather systems originating over the Mediterranean and Caspian Seas that travel eastward embedded in subtropical westerly jet streams.\n"
            "- Occurrence: Active from November to April across Jammu & Kashmir, Himachal Pradesh, Uttarakhand, Punjab, Haryana, and Rajasthan.\n"
            "- Benefits: Vital winter rainfall and snowfall, extremely beneficial for the Rabi wheat and apple orchards.\n"
            "- Hazards: Can trigger severe hailstorms, dense fog, and post-passage cold waves in the Indo-Gangetic plains."
        )
    },

    # 3. NDMA Disaster & Safety Protocols
    {
        "id": "ndma_heatwave_safety",
        "title": "NDMA Heatwave Guidelines & Thresholds",
        "category": "disaster_safety",
        "keywords": ["heatwave", "heat wave", "loo", "ndma", "sunstroke", "hydration", "temperature threshold", "plains", "hills", "coastal"],
        "source": "National Disaster Management Authority (NDMA) Heat Wave Action Plan",
        "content": (
            "IMD Heatwave Criteria:\n"
            "- Plains: Maximum temperature reaches >= 40°C\n"
            "- Coastal Areas: Maximum temperature reaches >= 37°C\n"
            "- Hills: Maximum temperature reaches >= 30°C\n"
            "Severe Heatwave: Departure from normal >= +6.4°C or actual temperature >= 45°C.\n"
            "NDMA Safety Protocols:\n"
            "1. Avoid going out in direct sun between 11:00 AM and 3:30 PM.\n"
            "2. Drink ORS, lemon water, buttermilk (chaas), or coconut water regularly even if not feeling thirsty.\n"
            "3. Wear lightweight, loose, light-colored cotton clothes with head protection (hat, towel, umbrella).\n"
            "4. Never leave children or pets locked in closed parked vehicles."
        )
    },
    {
        "id": "ndma_lightning_safety",
        "title": "NDMA Lightning & Thunderstorm Safety Protocols (30-30 Rule)",
        "category": "disaster_safety",
        "keywords": ["lightning", "thunderstorm", "damini", "30-30 rule", "ndma safety", "tree", "open ground", "electric shock"],
        "source": "NDMA Lightning Hazard Guidelines & Damini Protocol",
        "content": (
            "Lightning is the leading meteorological cause of accidental fatalities in India.\n"
            "The 30-30 Rule: If the time between flash and thunder is less than 30 seconds, lightning is within striking distance (< 10 km). Stay indoors for 30 minutes after the last thunder.\n"
            "Critical Safety Rules:\n"
            "1. DO NOT take shelter under isolated trees, metal sheds, or open bus stops.\n"
            "2. If caught in an open field, crouch down into the 'Lightning Position' on the balls of your feet with hands over ears and head between knees. Do NOT lie flat on the ground.\n"
            "3. Disconnect sensitive electrical appliances and avoid plumbing or wired landline phones during active strikes.\n"
            "4. Track live strikes via the IMD Damini mobile app."
        )
    },

    # 4. Agro-Meteorological Advisory Standards
    {
        "id": "agri_spray_guidelines",
        "title": "Optimal Weather Conditions for Agricultural Spraying & Fertilization",
        "category": "agro_meteorology",
        "keywords": ["pesticide spray", "fertilizer application", "wind speed", "rainfall", "rain probability", "kisan advisory", "spray window"],
        "source": "IMD Agrometeorological Advisory Services Division (AAS)",
        "content": (
            "Standard Weather Thresholds for Agrochemical Spraying:\n"
            "1. Wind Speed: Must be below 15 km/h (ideally 5-10 km/h). Wind > 15 km/h causes chemical drift, wasting inputs and contaminating neighboring fields.\n"
            "2. Rainfall Probability: Avoid spraying if rain probability > 30-40% or rain is expected within 12-24 hours ('wash-off effect').\n"
            "3. Temperature: Avoid spraying during peak afternoon heat (> 35°C) to prevent rapid evaporation and chemical leaf burn (phytotoxicity). Ideal window is early morning (7-10 AM) or late evening (4-6 PM).\n"
            "4. Relative Humidity: 50% - 75% is optimal. Low humidity (< 40%) leads to rapid droplet evaporation."
        )
    },
    {
        "id": "agri_crop_weather_calendar",
        "title": "Indian Crop Seasons & Weather Vulnerabilities",
        "category": "agro_meteorology",
        "keywords": ["kharif", "rabi", "zaid", "paddy", "rice", "wheat", "mustard", "cotton", "frost", "terminal heat", "irrigation"],
        "source": "ICAR - Central Research Institute for Dryland Agriculture (CRIDA)",
        "content": (
            "Key Crop Weather Sensitivities in India:\n"
            "1. Kharif Crops (Paddy, Maize, Cotton, Soybean - Sown June/July, Harvested Oct/Nov):\n"
            "   - Paddy needs standing water during tillering/panicle initiation. High humidity (> 85%) with cloudiness triggers Blast disease and Brown Plant Hopper (BPH).\n"
            "   - Cotton is vulnerable to waterlogging and whitefly infestation during prolonged dry spells.\n"
            "2. Rabi Crops (Wheat, Mustard, Gram - Sown Oct/Dec, Harvested Mar/Apr):\n"
            "   - Wheat requires cool temperatures (15-20°C) during grain filling. Sudden temperature spikes (> 30°C in Feb/March) cause 'Terminal Heat Stress', shriveling grains.\n"
            "   - Mustard requires protection from ground frost (temperatures < 4°C). Apply light evening irrigation to protect against frost."
        )
    },

    # 5. Biometeorological & Health Indices
    {
        "id": "heat_index_wbgt",
        "title": "Heat Index & Wet-Bulb Temperature Interpretation",
        "category": "biometeorology",
        "keywords": ["heat index", "feels like", "wet bulb", "wbgt", "relative humidity", "heat exhaustion", "heat stroke", "sports safety"],
        "source": "NOAA / IMD Biometeorology Standards",
        "content": (
            "Heat Index ('Feels Like' Temperature) combines air temperature and relative humidity to measure perceived thermal stress:\n"
            "- 27°C - 32°C (Caution): Fatigue possible with prolonged exposure and activity.\n"
            "- 32°C - 41°C (Extreme Caution): Heat cramps and heat exhaustion possible. Continue hydration.\n"
            "- 41°C - 54°C (Danger): Heat cramps or heat exhaustion likely; heat stroke possible with continued activity.\n"
            "- >= 54°C (Extreme Danger): Heat stroke / sunstroke imminent.\n"
            "Wet-Bulb Temperature (Tw): The theoretical limit of human evaporative cooling via sweat. Tw exceeding 35°C is universally fatal for uncooled human physiology even in shade."
        )
    }
]
