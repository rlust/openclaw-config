# RV‑C Bridge — Hardware v0.1 (Dual CAN + Ethernet)

## Goals (v0.1)
- **Dual CAN (Classic CAN 2.0B)** to support:
  - **CAN1:** RV‑C house/coach network (primary)
  - **CAN2:** chassis/aux network (future expansion)
- **Ethernet-first** networking (reliable in RV bays)
- **Read/Write capable** but safe by default:
  - default **monitor-only** at boot
  - explicit enable for TX with **hardware + firmware gating**
- **Rugged power input** for RV electrical noise (9–36V tolerant)
- Field-friendly installation (Deutsch connectors, switchable termination)

## Top-level block diagram

```
     9–36V RV Power In
          │
          ▼
  [Input Protection]
  - fuse/polyfuse
  - reverse polarity (ideal diode/MOSFET)
  - TVS surge clamp
          │
          ▼
  [Automotive Buck]
   12V→5V (2A)
          │
          ├─────────────► 5V rail (Ethernet magnetics/PHY as needed)
          ▼
    [LDO/Buck]
      5V→3.3V
          │
          ▼
   3.3V rail (MCU, PHY IO, logic)

                      ┌───────────────────────────────────────┐
                      │           Main MCU (Ethernet)          │
                      │   STM32H7 class (MAC + Dual CAN)       │
                      │  - CAN1 (classic)                       │
                      │  - CAN2 (classic)                       │
                      │  - RMII to Ethernet PHY                 │
                      │  - SPI/QSPI for flash                   │
                      │  - SDIO optional microSD                │
                      └───────┬───────────────┬───────────────┘
                              │               │
                              │               │
                     CAN1_TX/RX        CAN2_TX/RX
                              │               │
                              ▼               ▼
                     ┌────────────────┐ ┌────────────────┐
                     │ Isolated CAN   │ │ Isolated CAN   │
                     │ Transceiver    │ │ Transceiver    │
                     │ (ISO CAN)      │ │ (ISO CAN)      │
                     └───┬─────────┬──┘ └───┬─────────┬──┘
                         │         │        │         │
                     CAN_H/L   Term SW  CAN_H/L   Term SW
                         │         │        │         │
                         ▼         ▼        ▼         ▼
                    Coach CAN1           Chassis CAN2

                              RMII
                               │
                               ▼
                     ┌────────────────┐
                     │ Ethernet PHY   │
                     │ (10/100)       │
                     └──────┬─────────┘
                            ▼
                       MagJack/RJ45

   Debug/Service:
   - USB-C (power optional) + UART
   - LEDs: PWR, ETH, CAN1 RX/TX, CAN2 RX/TX, FAULT
   - Button: SAFE MODE / TX ENABLE (optional)
```

## Interfaces & Connectors
### Power
- **Input:** 9–36V DC (nominal 12–14.4V)
- Connector: **Deutsch DT 2-pin** (recommended) or locking screw terminal
- Protection:
  - TVS diode (automotive rated)
  - reverse polarity MOSFET/ideal diode
  - fuse/polyfuse

### Ethernet
- **10/100 Ethernet** is sufficient.
- Connector options:
  - RJ45 MagJack (cheapest)
  - M12 X-coded (premium, rugged)

### CAN ports (2x)
- **CAN1 (RV‑C)** and **CAN2 (aux/chassis)**
- Connector options:
  - **Deutsch DT 4-pin** per CAN (CAN_H, CAN_L, GND/shield, +V optional)
  - or DB9 (service-friendly, less rugged)

### Termination strategy
- Do **not** hard-terminate by default.
- Provide **internal jumper / DIP** to enable 120Ω termination for each bus:
  - TERM_CAN1 (120Ω)
  - TERM_CAN2 (120Ω)

## Read/Write safety model
### Hardware gating
- CAN transceivers support **standby** or **TX disable** controlled by MCU GPIO.
- Boot behavior:
  - **TX disabled** until firmware enables after config + authentication.
- Optional physical switch:
  - MONITOR ONLY / CONTROL ENABLE

### Firmware gating
- Whitelist:
  - Only known PGNs/addresses allowed for transmit (v0.1)
- Rate limits:
  - e.g., <= 10 frames/sec per bus
- Audit log:
  - every TX is logged locally and via MQTT

## Recommended silicon (v0.1)
### MCU
- **STM32H743/H753** (Ethernet MAC + CAN)
  - Enough flash/RAM for protocol stack + MQTT/REST
  - Mature tooling

### CAN isolation/transceivers
- Preferred: **isolated CAN transceiver** per channel (CAN1/CAN2)
  - ex: TI ISO1042-class (or equivalent)
- Add **TVS** on CAN lines + common-mode choke optional

### Ethernet
- PHY: DP83825 / LAN8720-class
- Magnetics: integrated MagJack preferred

### Storage
- QSPI flash for firmware + config
- Optional microSD for raw CAN capture

## Bring-up / test points
- Test pads for:
  - 3.3V, 5V, GND
  - CAN1_TX/RX, CAN2_TX/RX
  - RMII pins
  - UART debug

## v0.1 Deliverables
- Schematic (KiCad)
- PCB layout guidelines (creepage/clearance if isolation)
- BOM with alternates
- Firmware skeleton:
  - CAN RX interrupt → parse → state cache → MQTT publish
  - TX gate + config
