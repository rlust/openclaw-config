"""Constants for RV-C Bridge integration."""

DOMAIN = "rv_c_bridge"

# Config entry keys
CONF_MQTT_HOST = "mqtt_host"
CONF_MQTT_PORT = "mqtt_port"
CONF_MQTT_USER = "mqtt_user"
CONF_MQTT_PASS = "mqtt_password"

# Default values
DEFAULT_MQTT_HOST = "localhost"
DEFAULT_MQTT_PORT = 1883

# Entity attributes
ATTR_ENTITY_ID = "entity_id"
ATTR_SENSOR_TYPE = "sensor_type"
ATTR_CATEGORY = "category"
ATTR_INSTANCE = "instance"

# MQTT settings
MQTT_TOPIC_PREFIX = "rvcbridge"
MQTT_TOPIC_PATTERN = "rvcbridge/+/+"

# Platforms
PLATFORMS = ["sensor"]

# Service actions
SERVICE_LOG_UNKNOWN_PGNS = "log_unknown_pgns"
