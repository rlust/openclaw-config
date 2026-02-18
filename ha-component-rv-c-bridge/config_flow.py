"""Config flow for RV-C Bridge integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_MQTT_HOST,
    CONF_MQTT_PASS,
    CONF_MQTT_PORT,
    CONF_MQTT_USER,
    DEFAULT_MQTT_HOST,
    DEFAULT_MQTT_PORT,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class RVCBridgeConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for RV-C Bridge."""

    VERSION = 1
    MINOR_VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle user-initiated config flow."""
        errors = {}

        if user_input is not None:
            return self.async_create_entry(
                title="RV-C Bridge",
                data=user_input,
            )

        # Default schema for MQTT connection
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_MQTT_HOST, default=DEFAULT_MQTT_HOST
                ): cv.string,
                vol.Optional(
                    CONF_MQTT_PORT, default=DEFAULT_MQTT_PORT
                ): cv.port,
                vol.Optional(CONF_MQTT_USER, default=""): cv.string,
                vol.Optional(CONF_MQTT_PASS, default=""): cv.string,
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "mqtt_info": "Mosquitto broker should be running. "
                "Topics: rvcbridge/category/instance with JSON payloads."
            },
        )

    async def async_step_import(
        self, import_data: dict[str, Any]
    ) -> FlowResult:
        """Handle import from configuration.yaml."""
        return await self.async_step_user(import_data)
