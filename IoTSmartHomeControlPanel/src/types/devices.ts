// Device type definitions
export type DeviceType = 'light' | 'fan' | 'thermostat' | 'lock' | 'speaker';
export type RoomId = string;

// Room-specific device types (can be assigned to rooms)
export type RoomDeviceType = 'light' | 'fan' | 'speaker';

// Global device types (cannot be assigned to rooms)
export type GlobalDeviceType = 'thermostat' | 'lock';

// Device configuration for each device type
export type DeviceConfig = {
  light: {
    brightness: number; // 0–100
    lastBrightness?: number; // Last brightness before turning off (0–100)
    isOn: boolean;
  };
  speaker: {
    volume: number; // 0–100
    lastVolume?: number; // Last volume before turning off (0–100)
    isOn: boolean;
  };
  fan: {
    speed: 0 | 1 | 2 | 3; // 0 = off
  };
  thermostat: {
    temp: number;       // 60–85 F or 15–29 C (clamped)
    unit: 'F' | 'C';
    isOn: boolean;
  };
  lock: {
    locked: boolean;
  };
};

// Default values for each device type
export const DEVICE_DEFAULTS: DeviceConfig = {
  light: {
    brightness: 0,
    isOn: false,
  },
  speaker: {
    volume: 0,
    isOn: false,
  },
  fan: {
    speed: 0,
  },
  thermostat: {
    temp: 72,
    unit: 'F',
    isOn: true,
  },
  lock: {
    locked: true,
  },
};

// Device metadata (for future extensibility - icons, labels, etc.)
export const DEVICE_METADATA: Record<DeviceType, { label: string; icon?: string; isGlobal?: boolean }> = {
  light: {
    label: 'Light',
    isGlobal: false,
  },
  speaker: {
    label: 'Speaker',
    isGlobal: false,
  },
  fan: {
    label: 'Fan',
    isGlobal: false,
  },
  thermostat: {
    label: 'Thermostat',
    isGlobal: true,
  },
  lock: {
    label: 'Lock',
    isGlobal: true,
  },
};

// Helper to validate device type (now uses registry)
export const isValidDeviceType = (device: string): device is DeviceType => {
  // This will be updated to check against registry
  return device === 'light' || device === 'fan' || device === 'thermostat' || device === 'lock' || device === 'speaker';
};

// Helper to check if device type is a room device (now uses registry)
export const isRoomDeviceType = (device: DeviceType): device is RoomDeviceType => {
  return device === 'light' || device === 'fan' || device === 'speaker';
};

// Helper to check if device type is a global device (now uses registry)
export const isGlobalDeviceType = (device: DeviceType): device is GlobalDeviceType => {
  return device === 'thermostat' || device === 'lock';
};

