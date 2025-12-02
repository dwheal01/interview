# Adding New Devices Guide

This guide explains how to add new device types to the smart home system.

## Architecture Overview

The system uses a **device registry pattern** that makes adding new devices straightforward:

1. **Device Types** (`src/types/devices.ts`) - Define the device type
2. **Device Registry** (`src/registry/deviceRegistry.ts`) - Register device handlers and metadata
3. **Device Context** (`src/context/DeviceContext.tsx`) - Manages device state
4. **UI Components** - Render device controls

## Step-by-Step: Adding a New Device

### Example: Adding a "Smart Speaker" Device

#### 1. Add Device Type

In `src/types/devices.ts`:

```typescript
export type DeviceType = "light" | "fan" | "thermostat" | "lock" | "speaker";

export type DeviceConfig = {
  // ... existing devices
  speaker: {
    volume: number; // 0-100
    lastVolume?: number; // Last volume before turning off (0-100)
    isOn: boolean; // On/off state
  };
};

export const DEVICE_DEFAULTS: DeviceConfig = {
  // ... existing defaults
  speaker: {
    volume: 50,
    isOn: false,
  },
};
```

**Note**: For devices that need on/off functionality (like lights and speakers), include:

- `isOn: boolean` - Controls whether the device is on or off
- `lastValue?: number` - Preserves the last value when turned off (e.g., `lastBrightness`, `lastVolume`)

#### 2. Register Device in Registry

In `src/registry/deviceRegistry.ts`:

```typescript
import { Volume2 } from 'lucide-react'; // Add icon import

// Add to DEVICE_REGISTRY:
speaker: {
  type: 'speaker',
  metadata: {
    label: 'Speaker',
    icon: Volume2,
    color: 'blue',
    isGlobal: false, // Can be assigned to rooms
    controlType: 'slider',
    min: 0,
    max: 100,
  },
  handler: {
    initialize: (defaults) => {
      const speakerDefaults = defaults as Partial<DeviceConfig['speaker']> | undefined;
      return {
        volume: speakerDefaults?.volume ?? 50,
        lastVolume: speakerDefaults?.lastVolume ?? 100,
        isOn: speakerDefaults?.isOn ?? false,
      };
    },
    update: (currentState, volume) => {
      const speakerState = currentState as DeviceConfig['speaker'];
      const newVolume = Math.max(0, Math.min(100, Number(volume) || 0));
      return {
        volume: newVolume,
        lastVolume: newVolume > 0 ? newVolume : (speakerState?.lastVolume ?? 100),
        isOn: speakerState?.isOn ?? false,
      };
    },
    format: (state) => {
      const speakerState = state as DeviceConfig['speaker'];
      return `${speakerState.volume}%`;
    },
    getStatus: (state) => {
      const speakerState = state as DeviceConfig['speaker'];
      return !speakerState.isOn ? 'Off' : `${speakerState.volume}%`;
    },
  },
},
```

#### 3. Update Room State (if room device)

In `src/context/DeviceContext.tsx`, add to `RoomState`:

```typescript
export type RoomState = {
  id: RoomId;
  name: string;
  light?: DeviceConfig["light"];
  fan?: DeviceConfig["fan"];
  speaker?: DeviceConfig["speaker"]; // Add this
};
```

#### 4. Update Initialization Logic

The registry system automatically handles initialization, but you may need to update the switch statement in `initializeRoomsFromData` if you're maintaining backward compatibility:

```typescript
if (deviceType === "speaker") {
  roomState.speaker = initializedState as DeviceConfig["speaker"];
}
```

#### 5. Create UI Component (Optional)

Create a dedicated control component in `src/components/devices/` or use the generic device control system.

#### 6. Add to JSON Configuration

In `public/rooms.json`, add the device to rooms:

```json
{
  "id": "living-room",
  "name": "Living Room",
  "devices": ["light", "fan", "speaker"]
}
```

## Adding Scheduler Support

To enable scheduling for your device:

1. The scheduler system automatically works with any device in the registry
2. Create a schedule rule:

```typescript
const { addRule } = useScheduler();

addRule({
  name: "Lower temperature at night",
  deviceType: "thermostat",
  trigger: { type: "time", time: "22:00" },
  action: { type: "set", value: { temp: 65, unit: "F", isOn: true } },
  enabled: true,
});
```

## Device Types

### Room Devices

- Can be assigned to multiple rooms
- Examples: `light`, `fan`, `speaker`
- Set `isGlobal: false` in metadata
- Each room can have its own instance of the device

### Global Devices

- Single instance, not assigned to rooms
- Examples: `thermostat`, `lock`
- Set `isGlobal: true` in metadata
- Shared across all rooms

## Device State Properties

### Devices with On/Off State

For devices like lights and speakers that have an `isOn` property:

- **`isOn: boolean`** - Controls whether the device is on or off
- **`lastValue?: number`** - Preserves the last value when turned off (e.g., `lastBrightness`, `lastVolume`)
- When `isOn: false`, the device displays as "Off" and controls are greyed out
- The slider can still be adjusted while off to preset the value for when turned back on
- When turned back on, the device restores to `lastValue` if available

## Control Types

- `slider` - Range input (e.g., light brightness, volume)
- `buttons` - Button group (e.g., fan speeds)
- `toggle` - On/off switch (e.g., lock)
- `input` - Text/number input (e.g., temperature)
- `custom` - Custom component

## Benefits of This Architecture

1. **Type Safety** - TypeScript ensures device configurations are correct
2. **Centralized Logic** - All device behavior in one registry
3. **Easy Extension** - Add devices without modifying core code
4. **Automatic Validation** - Registry validates device types
5. **Scheduler Ready** - Works automatically with scheduler system
