# Proactive Monitoring

# Proactive Monitoring

## Rate Limit Monitoring
**Context:** Credit added to OpenRouter (Feb 6). Dual LLM support verified.
**Goal:** Keep responses flowing with Claude + Gemini dual LLM support
**Watch for:** Any 429 errors or slow responses
**Status:** ACTIVE - Credit confirmed, models responding

## Checks to run on heartbeat:
1. **Rate limit check** - Look for 429 errors in logs
2. **Aspire RV Home Assistant** - Check for updates & alerts
3. **Newark Home Assistant (Security & Temp)**
   - **Temp Alert:** Notify if internal temp < 40°F (Check: `sensor.family_room_temperature`, `sensor.h5075_cb13_temperature`)
   - **Security Alert:** Notify if alarm triggered or doors open (Check: `binary_sensor.doors_hai`, `alarm_control_panel.omnilink_area_1`)
   - **Motion Alert:** Notify if indoor motion detected (Check: `binary_sensor.motion_kitchen`, `binary_sensor.hai_motion_shop`)
4. OpenClaw news/updates on web
5. Important system alerts
6. Verify both Claude + Gemini accessible

## Actions when found:
- **429 error detected** → Alert Randy immediately in Telegram
- **Newark Temp/Security Alert** → Notify immediately in Telegram
- Update alerts to HAL calendar
