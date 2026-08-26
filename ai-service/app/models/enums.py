from enum import Enum

class IntentCategory(str, Enum):
    CURRENT_WEATHER = "current_weather"
    FORECAST_SHORT_TERM = "forecast_short_term"
    FORECAST_EXTENDED = "forecast_extended"
    ALERT_CHECK = "alert_check"
    CLIMATE_TREND = "climate_trend"
    AGRI_ADVISORY = "agri_advisory"
    OUTDOOR_ACTIVITY = "outdoor_activity"
    METEOROLOGICAL_EXPLANATION = "meteorological_explanation"
    GENERAL_QUERY = "general_query"
    OUT_OF_DOMAIN = "out_of_domain"

class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    EXTREME = "extreme"

class LanguageCode(str, Enum):
    EN = "en"
    HI = "hi"
    BN = "bn"
    TA = "ta"
    TE = "te"
    MR = "mr"
    GU = "gu"
    KN = "kn"
    ML = "ml"
    PA = "pa"
    OR = "or"

class AlertSeverity(str, Enum):
    GREEN = "green"     # No warning
    YELLOW = "yellow"   # Watch / Be updated
    ORANGE = "orange"   # Alert / Be prepared
    RED = "red"         # Warning / Take action

class TargetSector(str, Enum):
    GENERAL_PUBLIC = "general_public"
    FARMER = "farmer"
    FISHERMAN = "fisherman"
    COMMUTER_TRAVELER = "commuter_traveler"
    DISASTER_RESPONDER = "disaster_responder"
