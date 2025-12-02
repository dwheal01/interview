# IoT Smart Home Control Panel

A mobile-first smart home dashboard built with React, TypeScript, Vite, and TailwindCSS. Control lights, speakers, fans, thermostat, and locks across multiple rooms with a clean, intuitive interface.

## Features

- **Multi-Room Support**: Manage devices across multiple rooms (Living Room, Bedroom, Office, etc.)
- **Device Types**:
  - **Lights**: Brightness control (0-100%) with on/off toggle
  - **Speakers**: Volume control (0-100%) with on/off toggle
  - **Fans**: Speed control (0-3) with visual feedback
  - **Thermostat**: Temperature control (60-85°F or 15-29°C) with unit conversion
  - **Lock**: Simple lock/unlock toggle
- **Two View Modes**:
  - **Devices View**: See all devices aggregated across rooms
  - **Rooms View**: See devices organized by room
- **Away Mode**: One-click button to turn off all devices, lock the house, and set thermostat to away settings
- **State Persistence**: All device states are saved and persist across page refreshes
- **Extensible Architecture**: Easy to add new device types using the device registry system

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router v6** for navigation
- **Lucide React** for icons
- **localStorage** for state persistence (ready for API integration)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AwayModeFooter.tsx
│   ├── BackButton.tsx
│   ├── DeviceCard.tsx
│   └── SliderDevicePage.tsx
├── context/             # React context providers
│   ├── DeviceContext.tsx
│   └── SchedulerContext.tsx
├── hooks/               # Custom React hooks
│   └── useDevices.ts
├── pages/               # Page components
│   ├── HomePage.tsx
│   ├── DevicesDashboard.tsx
│   ├── RoomsDashboard.tsx
│   ├── LightPage.tsx
│   ├── SpeakerPage.tsx
│   ├── FanPage.tsx
│   ├── ThermostatPage.tsx
│   ├── LockPage.tsx
│   └── RoomDetailPage.tsx
├── registry/            # Device registry system
│   └── deviceRegistry.ts
├── services/            # Utility services
│   └── stateStorage.ts
└── types/               # TypeScript type definitions
    ├── devices.ts
    └── scheduler.ts
```

## Configuration

### Room Configuration

Rooms and default device values are configured in `public/rooms.json`:

```json
{
  "rooms": [
    {
      "id": "living-room",
      "name": "Living Room",
      "devices": ["light", "fan", "speaker"]
    }
  ],
  "defaults": {
    "light": {
      "brightness": 100,
      "isOn": false
    },
    "speaker": {
      "volume": 50,
      "isOn": false
    }
  },
  "away": {
    "light": { "isOn": false },
    "speaker": { "isOn": false },
    "fan": { "speed": 0 },
    "thermostat": { "isOn": false },
    "lock": { "locked": true }
  }
}
```

## Device Behavior

### Lights & Speakers

- **On/Off Toggle**: Use the "On" and "Off" buttons to toggle device state
- **Brightness/Volume**: Adjustable via slider (0-100%)
- **State Preservation**: When turned off, the last brightness/volume is saved and restored when turned back on
- **Slider While Off**: You can adjust the slider while the device is off to preset the value for when you turn it back on

### Thermostat

- **Temperature Range**: 60-85°F or 15-29°C
- **Unit Conversion**: Automatic conversion when switching between Fahrenheit and Celsius
- **Power Toggle**: When off, controls are disabled and dimmed

### Fans

- **Speed Levels**: 0 (Off), 1, 2, 3
- **Visual Feedback**: Icon size increases with speed

### Lock

- **Simple Toggle**: Tap the icon to lock/unlock

## Away Mode

The "Away Mode" button (available in the footer on all pages) will:

- Turn off all lights (`isOn: false`)
- Turn off all speakers (`isOn: false`)
- Turn off all fans (`speed: 0`)
- Turn off thermostat (`isOn: false`)
- Lock the house (`locked: true`)

Away mode settings are configured in `public/rooms.json` under the `"away"` key.

## State Persistence

All device states are automatically saved to `localStorage` and persist across page refreshes. The system:

1. Loads default values from `public/rooms.json`
2. Merges with any persisted state from `localStorage`
3. Saves state automatically on every change

See [STATE_PERSISTENCE.md](./STATE_PERSISTENCE.md) for more details.

## Adding New Devices

The system uses a device registry pattern that makes adding new devices straightforward. See [ADDING_NEW_DEVICES.md](./ADDING_NEW_DEVICES.md) for a complete guide.

## Development Notes

- The app is mobile-first but works on all screen sizes
- State persistence uses `localStorage` but is structured to easily swap for API calls
- The device registry system allows adding new devices without modifying core code
- All device types support the scheduler system for automation

## License

MIT
