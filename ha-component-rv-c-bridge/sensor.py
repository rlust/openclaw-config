"""RV-C Bridge MQTT Sensor Platform.

Subscribes to rvcbridge/category/instance topics.
Dynamically creates sensor entities from MQTT payloads.

Expected MQTT message format:
{
  "value": 72.5,
  "unit": "°F",
  "device_class": "temperature",
  "state_class": "measurement",
  "timestamp": 1708003215.123
}

Or simplified:
{
  "soc_pct": 100,
  "voltage_v": 13.5,
  "current_a": 5.2
}
"""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from homeassistant.components import mqtt
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME, Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Topic structure: rvcbridge/{category}/{instance}
# Examples:
#   rvcbridge/battery_status/1
#   rvcbridge/tank_status/0
#   rvcbridge/thermostat_setpoint/3
#   rvcbridge/zone_temperature/1
#   rvcbridge/slide_status/1

SENSOR_MAPPINGS = {
    "battery_status": {
        "soc_pct": ("SOC", "battery", "mdi:battery", "%"),
        "voltage_v": ("Voltage", "voltage", "mdi:flash", "V"),
        "current_a": ("Current", "current", "mdi:current-dc", "A"),
        "temp_c": ("Temperature", "temperature", "mdi:thermometer", "°C"),
    },
    "tank_status": {
        "level_pct": ("Level", None, "mdi:water", "%"),
    },
    "zone_temperature": {
        "temp_f": ("Temperature", "temperature", "mdi:thermometer", "°F"),
    },
    "thermostat_setpoint": {
        "temp_f": ("Setpoint", "temperature", "mdi:thermostat", "°F"),
    },
    "slide_status": {
        "position_pct": ("Position", None, "mdi:arrow-expand-horizontal", "%"),
        "state": ("State", None, "mdi:arrow-expand-horizontal", None),
    },
    "awning_status": {
        "motion": ("Motion", None, "mdi:home-roof", None),
    },
    "firefly_battery_v": {
        "voltage_v": ("Voltage", "voltage", "mdi:flash", "V"),
    },
    "thermostat_status": {
        "mode": ("Mode", None, "mdi:thermostat", None),
        "fan_mode": ("Fan", None, "mdi:fan", None),
    },
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up RV-C Bridge sensors from MQTT."""
    _LOGGER.info("Setting up RV-C Bridge MQTT sensors")

    registry = hass.data[DOMAIN][entry.entry_id]["sensor_registry"]

    @callback
    def async_handle_mqtt_message(msg: mqtt.ReceiveMessage) -> None:
        """Handle incoming MQTT message from rvcbridge/*."""
        topic = msg.topic
        payload = msg.payload

        # Parse topic: rvcbridge/category/instance
        parts = topic.split("/")
        if len(parts) != 3 or parts[0] != "rvcbridge":
            _LOGGER.debug(f"Ignoring non-RV-C topic: {topic}")
            return

        category = parts[1]
        instance = parts[2]

        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            _LOGGER.warning(f"Failed to decode JSON from {topic}: {payload}")
            return

        _LOGGER.debug(f"MQTT {topic}: {data}")

        # Check if we have a mapping for this category
        if category not in SENSOR_MAPPINGS:
            _LOGGER.debug(f"No mapping for category: {category}")
            return

        # For each field in the data, create a sensor entity
        for field_key, (field_name, device_class, icon, unit) in SENSOR_MAPPINGS[
            category
        ].items():
            if field_key not in data:
                continue

            entity_id = f"{category}_{instance}_{field_key}"

            if entity_id not in registry:
                sensor = RVCBridgeSensor(
                    entry_id=entry.entry_id,
                    topic=topic,
                    entity_id=entity_id,
                    name=f"RV {category.replace('_', ' ').title()} {field_name} ({instance})",
                    field_key=field_key,
                    device_class=device_class,
                    unit=unit,
                    icon=icon,
                )
                registry[entity_id] = sensor
                async_add_entities([sensor], update_before_add=False)
                _LOGGER.info(f"Created sensor: {entity_id}")

            # Update the sensor with new value
            sensor = registry[entity_id]
            sensor.async_update_state(data[field_key])

    # Subscribe to rvcbridge/# and handle all messages
    await mqtt.async_subscribe(hass, "rvcbridge/#", async_handle_mqtt_message, 0)
    _LOGGER.info("Subscribed to rvcbridge/# MQTT topic")


class RVCBridgeSensor(SensorEntity):
    """Represents a single RV-C Bridge sensor entity."""

    def __init__(
        self,
        entry_id: str,
        topic: str,
        entity_id: str,
        name: str,
        field_key: str,
        device_class: Optional[str],
        unit: Optional[str],
        icon: str,
    ):
        """Initialize the sensor."""
        self.entry_id = entry_id
        self.topic = topic
        self._attr_unique_id = f"{entry_id}_{entity_id}"
        self._attr_name = name
        self._attr_icon = icon
        self._attr_unit_of_measurement = unit
        self._attr_device_class = device_class
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_native_unit_of_measurement = unit
        self._current_state: StateType = None

    @property
    def native_value(self) -> StateType:
        """Return the current state."""
        return self._current_state

    @callback
    def async_update_state(self, value: Any) -> None:
        """Update sensor state from MQTT message."""
        self._current_state = value
        self.async_write_ha_state()

    @property
    def available(self) -> bool:
        """Sensor is available if we have a state."""
        return self._current_state is not None

    @property
    def should_poll(self) -> bool:
        """No polling; updated via MQTT messages."""
        return False
