# State Persistence Architecture

## Overview

The smart home system now persists device states across page refreshes, simulating a database-like behavior. This sets up the foundation for future multi-account support.

## How It Works

### 1. **State Storage Service** (`src/services/stateStorage.ts`)

The `stateStorage` service provides an abstraction layer for persisting device states:

- **`loadPersistedState()`** - Loads saved device states from localStorage
- **`savePersistedState(state)`** - Saves device states to localStorage
- **`loadRoomsConfig()`** - Loads room configuration from JSON (with caching)

**Future API Integration**: The service is structured so localStorage calls can easily be replaced with API calls:

```typescript
// Current (localStorage):
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

// Future (API):
await fetch("/api/devices/state", {
  method: "POST",
  body: JSON.stringify(state),
});
```

### 2. **State Loading Flow**

1. **Load JSON defaults** - Initial device values from `public/rooms.json`
2. **Load persisted state** - Saved values from localStorage (if exists)
3. **Merge states** - Persisted values take precedence over defaults
4. **Initialize** - Set up all devices with merged values

### 3. **State Saving Flow**

Every time `setDevices` is called:

1. **Update state** - React state is updated
2. **Auto-save** - State is automatically saved to localStorage
3. **Persist** - Values survive page refreshes

## JSON Structure

The `public/rooms.json` file contains:

- **Rooms configuration** - Which rooms exist and what devices they have
- **Default values** - Initial values for all devices (room and global)

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
    "light": { "brightness": 100, "isOn": false },
    "speaker": { "volume": 50, "isOn": false },
    "fan": { "speed": 0 },
    "thermostat": { "temp": 72, "unit": "F", "isOn": true },
    "lock": { "locked": true }
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

## State Merging Logic

When loading:

- **Persisted state exists**: Use saved values, fall back to defaults for missing devices
- **No persisted state**: Use JSON defaults
- **New rooms added**: New rooms get default values, existing rooms keep saved values

## Multi-Account Support (Future)

The architecture is ready for multi-account support:

1. **Add user context** - Store current user ID
2. **Update storage keys** - Use user-specific keys: `smart-home-devices-state-${userId}`
3. **API integration** - Replace localStorage with API calls:
   ```typescript
   // Future implementation
   export const savePersistedState = async (
     state: DevicesState,
     userId: string
   ) => {
     await fetch(`/api/users/${userId}/devices/state`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(state),
     });
   };
   ```

## Away Mode

The system includes an "Away Mode" feature that applies predefined settings to all devices. Away mode settings are configured in the `"away"` section of `public/rooms.json`.

When away mode is activated:

- All lights: `isOn: false` (brightness preserved)
- All speakers: `isOn: false` (volume preserved)
- All fans: `speed: 0`
- Thermostat: `isOn: false` (temperature preserved)
- Lock: `locked: true`

**Important**: Away mode preserves current brightness/volume values and only changes the `isOn` state. This means:

- If a device is on, its current value is saved to `lastBrightness`/`lastVolume` before turning off
- If a device is already off, the existing `lastBrightness`/`lastVolume` is preserved (including any slider adjustments made while off)

## Benefits

1. **Persistent State** - Device values survive page refreshes
2. **Default Values** - JSON provides initial configuration
3. **Away Mode** - One-click button to set all devices to away state
4. **State Preservation** - Last values are preserved when devices are turned off
5. **Flexible** - Easy to swap localStorage for API calls
6. **Multi-Account Ready** - Architecture supports user-specific state
7. **Backward Compatible** - Works with existing code

## Testing

To test state persistence:

1. Change device values (light brightness, fan speed, etc.)
2. Refresh the page
3. Values should persist (not reset to defaults)

To reset state:

```javascript
// In browser console
localStorage.removeItem("smart-home-devices-state");
location.reload();
```
