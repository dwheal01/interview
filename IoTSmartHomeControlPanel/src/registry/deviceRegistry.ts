import { Lightbulb, Fan, Thermometer, Lock, Volume2 } from 'lucide-react';
import type { DeviceType, DeviceConfig, RoomDeviceType, GlobalDeviceType } from '../types/devices';
import type { LucideIcon } from 'lucide-react';

// Device metadata with UI information
export type DeviceMetadata = {
  label: string;
  icon: LucideIcon;
  color: string; // Tailwind color class (e.g., 'yellow', 'violet')
  isGlobal: boolean;
  controlType: 'slider' | 'buttons' | 'toggle' | 'input' | 'custom';
  // Control-specific config
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: any; label: string }>;
};

// Device handler for state updates - using specific types for each device
export type DeviceHandler<T extends DeviceType> = {
  // Initialize device state with defaults
  initialize: (defaults?: Partial<DeviceConfig[T]>) => DeviceConfig[T];
  // Update device state
  update: (currentState: DeviceConfig[T], newValue: any) => DeviceConfig[T];
  // Validate value before updating
  validate?: (value: any) => boolean;
  // Format state for display
  format: (state: DeviceConfig[T]) => string;
  // Get status summary (for cards/dashboards)
  getStatus: (state: DeviceConfig[T]) => string;
};

// Device registry entry
export type DeviceRegistryEntry<T extends DeviceType> = {
  type: T;
  metadata: DeviceMetadata;
  handler: DeviceHandler<T>;
};

// Device registry
export const DEVICE_REGISTRY: Record<DeviceType, DeviceRegistryEntry<DeviceType>> = {
  light: {
    type: 'light',
    metadata: {
      label: 'Light',
      icon: Lightbulb,
      color: 'yellow',
      isGlobal: false,
      controlType: 'slider',
      min: 0,
      max: 100,
      step: 1,
    },
    handler: {
      initialize: (defaults) => {
        const lightDefaults = defaults as Partial<DeviceConfig['light']> | undefined;
        return {
          brightness: lightDefaults?.brightness ?? 0,
          lastBrightness: lightDefaults?.lastBrightness ?? 100,
          isOn: lightDefaults?.isOn ?? false,
        };
      },
      update: (currentState, brightness) => {
        const lightState = currentState as DeviceConfig['light'];
        const newBrightness = Math.max(0, Math.min(100, Number(brightness) || 0));
        return {
          brightness: newBrightness,
          // Preserve lastBrightness, or update it if brightness is not zero
          lastBrightness: newBrightness > 0 ? newBrightness : (lightState?.lastBrightness ?? 100),
          isOn: lightState?.isOn ?? false,
        };
      },
      validate: (value) => {
        const num = Number(value);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      format: (state) => {
        const lightState = state as DeviceConfig['light'];
        return `${lightState.brightness}%`;
      },
      getStatus: (state) => {
        const lightState = state as DeviceConfig['light'];
        return !lightState.isOn ? 'Off' : `${lightState.brightness}%`;
      },
    },
  },
  speaker: {
    type: 'speaker',
    metadata: {
      label: 'Speaker',
      icon: Volume2,
      color: 'blue',
      isGlobal: false,
      controlType: 'slider',
      min: 0,
      max: 100,
      step: 1,
    },
    handler: {
      initialize: (defaults) => {
        const speakerDefaults = defaults as Partial<DeviceConfig['speaker']> | undefined;
        return {
          volume: speakerDefaults?.volume ?? 0,
          lastVolume: speakerDefaults?.lastVolume ?? 100,
          isOn: speakerDefaults?.isOn ?? false,
        };
      },
      update: (currentState, volume) => {
        const speakerState = currentState as DeviceConfig['speaker'];
        const newVolume = Math.max(0, Math.min(100, Number(volume) || 0));
        return {
          volume: newVolume,
          // Preserve lastVolume, or update it if volume is not zero
          lastVolume: newVolume > 0 ? newVolume : (speakerState?.lastVolume ?? 100),
          isOn: speakerState?.isOn ?? false,
        };
      },
      validate: (value) => {
        const num = Number(value);
        return !isNaN(num) && num >= 0 && num <= 100;
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
  fan: {
    type: 'fan',
    metadata: {
      label: 'Fan',
      icon: Fan,
      color: 'violet',
      isGlobal: false,
      controlType: 'buttons',
      options: [
        { value: 0, label: 'Off' },
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
      ],
    },
    handler: {
      initialize: (defaults) => {
        const fanDefaults = defaults as Partial<DeviceConfig['fan']> | undefined;
        return {
          speed: fanDefaults?.speed ?? 0,
        };
      },
      update: (_currentState, speed) => ({
        speed: [0, 1, 2, 3].includes(speed) ? speed : 0,
      }),
      validate: (value) => [0, 1, 2, 3].includes(value),
      format: (state) => {
        const fanState = state as DeviceConfig['fan'];
        return fanState.speed === 0 ? 'Off' : `Speed ${fanState.speed}`;
      },
      getStatus: (state) => {
        const fanState = state as DeviceConfig['fan'];
        return fanState.speed === 0 ? 'Off' : `Speed ${fanState.speed}`;
      },
    },
  },
  thermostat: {
    type: 'thermostat',
    metadata: {
      label: 'Thermostat',
      icon: Thermometer,
      color: 'sky',
      isGlobal: true,
      controlType: 'input',
      min: 60,
      max: 85,
    },
    handler: {
      initialize: (defaults) => {
        const thermoDefaults = defaults as Partial<DeviceConfig['thermostat']> | undefined;
        return {
          temp: thermoDefaults?.temp ?? 72,
          unit: thermoDefaults?.unit ?? 'F',
          isOn: thermoDefaults?.isOn ?? true,
        };
      },
      update: (currentState, updates) => {
        const state = currentState as DeviceConfig['thermostat'];
        return {
          ...state,
          ...(updates as Partial<DeviceConfig['thermostat']>),
        };
      },
      format: (state) => {
        const thermoState = state as DeviceConfig['thermostat'];
        return thermoState.isOn 
          ? `${thermoState.temp}°${thermoState.unit} • On`
          : 'Off';
      },
      getStatus: (state) => {
        const thermoState = state as DeviceConfig['thermostat'];
        return thermoState.isOn 
          ? `${thermoState.temp}°${thermoState.unit} • On`
          : 'Off';
      },
    },
  },
  lock: {
    type: 'lock',
    metadata: {
      label: 'Lock',
      icon: Lock,
      color: 'emerald',
      isGlobal: true,
      controlType: 'toggle',
    },
    handler: {
      initialize: (defaults) => {
        const lockDefaults = defaults as Partial<DeviceConfig['lock']> | undefined;
        return {
          locked: lockDefaults?.locked ?? true,
        };
      },
      update: (currentState, locked) => {
        const state = currentState as DeviceConfig['lock'];
        return {
          locked: typeof locked === 'boolean' ? locked : !state.locked,
        };
      },
      format: (state) => {
        const lockState = state as DeviceConfig['lock'];
        return lockState.locked ? 'Locked' : 'Unlocked';
      },
      getStatus: (state) => {
        const lockState = state as DeviceConfig['lock'];
        return lockState.locked ? 'Locked' : 'Unlocked';
      },
    },
  },
};

// Helper functions
export const getDeviceMetadata = (deviceType: DeviceType): DeviceMetadata => {
  return DEVICE_REGISTRY[deviceType].metadata;
};

export const getDeviceHandler = <T extends DeviceType>(deviceType: T): DeviceHandler<T> => {
  return DEVICE_REGISTRY[deviceType].handler as unknown as DeviceHandler<T>;
};

export const isRoomDevice = (deviceType: DeviceType): deviceType is RoomDeviceType => {
  return !DEVICE_REGISTRY[deviceType].metadata.isGlobal;
};

export const isGlobalDevice = (deviceType: DeviceType): deviceType is GlobalDeviceType => {
  return DEVICE_REGISTRY[deviceType].metadata.isGlobal;
};

