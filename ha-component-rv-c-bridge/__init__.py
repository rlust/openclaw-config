"""RV-C Bridge Home Assistant Integration.

MQTT-native component that subscribes to rvcbridge/* topics
and creates sensor entities dynamically.

Requires: MQTT integration configured in HA.
Bridge publishes to: rvcbridge/category/instance (JSON payloads)
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from homeassistant.const import CONF_ENABLED, Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, ATTR_ENTITY_ID, ATTR_SENSOR_TYPE

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR, Platform.CLIMATE]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the RV-C Bridge integration."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry) -> bool:
    """Set up RV-C Bridge from a config entry (MQTT-native)."""
    _LOGGER.info("Setting up RV-C Bridge integration (MQTT mode)")

    hass.data[DOMAIN][entry.entry_id] = {
        "sensor_registry": {},  # Track sensors we've created
        "pgn_log": [],  # Log unknown PGNs for discovery
    }

    # Forward setup to sensor platform
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry) -> bool:
    """Unload RV-C Bridge integration."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(hass: HomeAssistant, entry) -> bool:
    """Reload RV-C Bridge integration."""
    await async_unload_entry(hass, entry)
    return await async_setup_entry(hass, entry)
