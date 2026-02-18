"""
RV-C Zone Instance → Name Mappings

Discovered through CAN log analysis on Entegra Aspire 2017+.
Maps instance numbers to human-readable zone names.

Instance mapping (by PGN type):
- Zone temperature (actual sensors): instances 0-5, 19
- Thermostat setpoints: instances 0-6
"""

# Zone instance → friendly name
# These are constants that can be shared across decoders
ZONE_NAMES = {
    0: "front",
    1: "mid",
    2: "rear",
    3: "bay_or_floor",  # Or "zone4" in setpoint context
    4: "zone5",
    5: "zone5_alt",  # Alternative mapping for redundant zone5
    6: "floor",  # From thermostat setpoint PGN
    19: "outdoor",  # Exterior sensor
}

# Thermostat instance → zone (for setpoint/mode data)
THERMOSTAT_ZONES = {
    0: "front",
    1: "mid",
    2: "rear",
    3: "zone4",
    4: "zone5",
    5: "bay",  # Bay has a separate thermostat
    6: "floor",
}

def get_zone_name(instance, context="temperature"):
    """Get friendly name for an instance number.
    
    Args:
        instance: The RV-C instance number
        context: 'temperature' or 'thermostat' to disambiguate overlapping instances
    
    Returns:
        Friendly zone name (e.g., 'front', 'mid', 'rear', 'bay', 'floor', 'outdoor')
    """
    if context == "thermostat":
        return THERMOSTAT_ZONES.get(instance, f"zone_{instance}")
    else:
        return ZONE_NAMES.get(instance, f"zone_{instance}")
