"""RV-C Bridge Climate (Thermostat) Platform.

Provides climate control entities that integrate with thermostat_status
and thermostat_setpoint MQTT sensors from the RV-C Bridge.

Publishes commands to rvcbridge/thermostat_control/{instance} to control
the RV's HVAC system.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from homeassistant.components import mqtt
from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityDescription,
    HVACAction,
    HVACMode,
    FAN_AUTO,
    FAN_OFF,
    FAN_ON,
)
from homeassistant.const import ATTR_TEMPERATURE, PRECISION_WHOLE, UnitOfTemperature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .zone_mappings import get_zone_name

_LOGGER = logging.getLogger(__name__)

# Map RV-C thermostat mode enums to HA HVACMode
RVC_MODE_TO_HA = {
    0: HVACMode.OFF,
    1: HVACMode.HEAT,
    2: HVACMode.COOL,
    3: HVACMode.HEAT_COOL,  # Auto
    4: HVACMode.FAN_ONLY,
}

HA_MODE_TO_RVC = {v: k for k, v in RVC_MODE_TO_HA.items()}

# Map RV-C fan mode enums to HA FAN mode
RVC_FAN_TO_HA = {
    0: FAN_OFF,
    1: FAN_AUTO,
    2: FAN_ON,
}

HA_FAN_TO_RVC = {v: k for k, v in RVC_FAN_TO_HA.items()}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up RV-C Bridge climate entities from MQTT."""
    _LOGGER.info("Setting up RV-C Bridge climate platform")

    registry = hass.data[DOMAIN][entry.entry_id]
    climate_registry = registry.setdefault("climate_registry", {})

    @callback
    def async_handle_thermostat_status(msg: mqtt.ReceiveMessage) -> None:
        """Handle thermostat_status MQTT updates."""
        topic = msg.topic
        payload = msg.payload

        # Parse: rvcbridge/thermostat_status/{instance}
        parts = topic.split("/")
        if len(parts) != 3 or parts[1] != "thermostat_status":
            return

        instance = parts[2]
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            _LOGGER.warning(f"Failed to decode JSON from {topic}: {payload}")
            return

        entity_id = f"climate_thermostat_{instance}"

        # Create climate entity if not exists
        if entity_id not in climate_registry:
            zone_name = get_zone_name(int(instance), context="thermostat")
            climate = RVCThermostat(
                entry_id=entry.entry_id,
                instance=instance,
                zone_name=zone_name,
                hass=hass,
            )
            climate_registry[entity_id] = climate
            async_add_entities([climate], update_before_add=False)
            _LOGGER.info(f"Created climate entity: {entity_id} ({zone_name})")

        # Update the climate entity
        climate = climate_registry[entity_id]
        if "mode" in data:
            climate._attr_hvac_mode = RVC_MODE_TO_HA.get(data["mode"], HVACMode.OFF)
        if "fan_mode" in data:
            climate._attr_fan_mode = RVC_FAN_TO_HA.get(data["fan_mode"], FAN_AUTO)
        climate.async_write_ha_state()

    @callback
    def async_handle_thermostat_setpoint(msg: mqtt.ReceiveMessage) -> None:
        """Handle thermostat_setpoint MQTT updates."""
        topic = msg.topic
        payload = msg.payload

        # Parse: rvcbridge/thermostat_setpoint/{instance}
        parts = topic.split("/")
        if len(parts) != 3 or parts[1] != "thermostat_setpoint":
            return

        instance = parts[2]
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            _LOGGER.warning(f"Failed to decode JSON from {topic}: {payload}")
            return

        entity_id = f"climate_thermostat_{instance}"

        # Create climate entity if not exists
        if entity_id not in climate_registry:
            zone_name = get_zone_name(int(instance), context="thermostat")
            climate = RVCThermostat(
                entry_id=entry.entry_id,
                instance=instance,
                zone_name=zone_name,
                hass=hass,
            )
            climate_registry[entity_id] = climate
            async_add_entities([climate], update_before_add=False)
            _LOGGER.info(f"Created climate entity: {entity_id} ({zone_name})")

        # Update setpoint
        climate = climate_registry[entity_id]
        if "temp_f" in data:
            climate._attr_current_temperature = data["temp_f"]
            climate._attr_target_temperature = data["temp_f"]
        climate.async_write_ha_state()

    # Subscribe to both thermostat topics
    await mqtt.async_subscribe(
        hass, "rvcbridge/thermostat_status/+", async_handle_thermostat_status, 0
    )
    await mqtt.async_subscribe(
        hass, "rvcbridge/thermostat_setpoint/+", async_handle_thermostat_setpoint, 0
    )
    _LOGGER.info("Subscribed to thermostat MQTT topics")


class RVCThermostat(ClimateEntity):
    """Represents an RV-C thermostat zone."""

    def __init__(
        self,
        entry_id: str,
        instance: str,
        zone_name: str,
        hass: HomeAssistant,
    ):
        """Initialize the thermostat."""
        self.entry_id = entry_id
        self.instance = instance
        self.zone_name = zone_name
        self.hass = hass

        self._attr_unique_id = f"{entry_id}_thermostat_{instance}"
        self._attr_name = f"RV {zone_name.title()} Thermostat"
        self._attr_hvac_modes = list(HA_MODE_TO_RVC.keys())
        self._attr_fan_modes = list(HA_FAN_TO_RVC.keys())
        self._attr_temperature_unit = UnitOfTemperature.FAHRENHEIT
        self._attr_target_temperature_step = PRECISION_WHOLE
        self._attr_min_temp = 50
        self._attr_max_temp = 95

        # Default state
        self._attr_hvac_mode = HVACMode.OFF
        self._attr_fan_mode = FAN_AUTO
        self._attr_current_temperature = 72.0
        self._attr_target_temperature = 72.0

    @property
    def should_poll(self) -> bool:
        """No polling; updated via MQTT."""
        return False

    @property
    def supported_features(self) -> int:
        """Return the list of supported features."""
        from homeassistant.components.climate import ClimateEntityFeature
        return (
            ClimateEntityFeature.TARGET_TEMPERATURE
            | ClimateEntityFeature.FAN_MODE
        )

    async def async_set_temperature(self, **kwargs) -> None:
        """Set new target temperature."""
        temperature = kwargs.get(ATTR_TEMPERATURE)
        if temperature is None:
            return

        # Clamp to min/max
        temperature = max(self._attr_min_temp, min(self._attr_max_temp, temperature))
        self._attr_target_temperature = temperature

        # Publish command to bridge
        await self._publish_command({"setpoint_f": temperature})

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Set HVAC mode."""
        if hvac_mode not in HA_MODE_TO_RVC:
            _LOGGER.warning(f"Unsupported HVAC mode: {hvac_mode}")
            return

        self._attr_hvac_mode = hvac_mode

        # Publish command to bridge
        mode_code = HA_MODE_TO_RVC[hvac_mode]
        await self._publish_command({"mode": mode_code})

    async def async_set_fan_mode(self, fan_mode: str) -> None:
        """Set fan mode."""
        if fan_mode not in HA_FAN_TO_RVC:
            _LOGGER.warning(f"Unsupported fan mode: {fan_mode}")
            return

        self._attr_fan_mode = fan_mode

        # Publish command to bridge
        fan_code = HA_FAN_TO_RVC[fan_mode]
        await self._publish_command({"fan_mode": fan_code})

    async def _publish_command(self, command: dict) -> None:
        """Publish a thermostat control command to the bridge."""
        topic = f"rvcbridge/thermostat_control/{self.instance}"
        payload = json.dumps(command)

        try:
            await mqtt.async_publish(self.hass, topic, payload, qos=1, retain=False)
            _LOGGER.debug(f"Published thermostat command to {topic}: {payload}")
        except Exception as e:
            _LOGGER.error(f"Failed to publish command to {topic}: {e}")
