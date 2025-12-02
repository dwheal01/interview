import React, { useState, useEffect, useCallback } from 'react';
import { DEVICE_DEFAULTS, isValidDeviceType, isRoomDeviceType, type DeviceConfig, type RoomDeviceType, type RoomId } from '../types/devices';
import { getDeviceHandler, isRoomDevice } from '../registry/deviceRegistry';
import { loadPersistedState, savePersistedState, loadRoomsConfig } from '../services/stateStorage';
import { DeviceContext } from '../hooks/useDevices';

export type RoomState = {
  id: RoomId;
  name: string; // "Living Room", "Bedroom", etc.
  light?: {
    brightness: number; // 0–100
    lastBrightness?: number; // Last brightness before turning off (0–100)
    isOn: boolean;
  };
  speaker?: {
    volume: number; // 0–100
    lastVolume?: number; // Last volume before turning off (0–100)
    isOn: boolean;
  };
  fan?: {
    speed: 0 | 1 | 2 | 3; // 0 = off
  };
};

export type DevicesState = {
  rooms: Record<RoomId, RoomState>;
  thermostat: {
    temp: number;       // 60–85 F or 15–29 C (clamped)
    unit: 'F' | 'C';
    isOn: boolean;
  };
  lock: {
    locked: boolean;
  };
};

type RoomConfig = {
  id: string;
  name: string;
  devices: RoomDeviceType[]; // Only room devices can be assigned to rooms
};

type RoomsData = {
  rooms: RoomConfig[];
  defaults?: Partial<DeviceConfig>; // Optional - falls back to DEVICE_DEFAULTS
};

export const DeviceContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializeRoomsFromData = (roomsData: RoomsData): Record<RoomId, RoomState> => {
    const rooms: Record<RoomId, RoomState> = {};
    const defaults = roomsData.defaults || {};
    
    roomsData.rooms.forEach(roomConfig => {
      const roomState: RoomState = {
        id: roomConfig.id,
        name: roomConfig.name,
      };
      
      // Validate and add devices that are specified for this room
      roomConfig.devices.forEach(deviceType => {
        if (!isValidDeviceType(deviceType)) {
          console.warn(`Invalid device type "${deviceType}" in room ${roomConfig.name}. Skipping.`);
          return;
        }
        
        // Only room devices can be assigned to rooms
        if (!isRoomDevice(deviceType)) {
          console.warn(`Device type "${deviceType}" is a global device and cannot be assigned to rooms. Skipping in room ${roomConfig.name}.`);
          return;
        }
        
        // Use registry handler to initialize device
        const handler = getDeviceHandler(deviceType);
        const deviceDefaults = defaults[deviceType];
        const initializedState = handler.initialize(deviceDefaults);
        
        // Assign to room state (maintaining current structure for backward compatibility)
        if (deviceType === 'light') {
          roomState.light = initializedState as DeviceConfig['light'];
        } else if (deviceType === 'speaker') {
          roomState.speaker = initializedState as DeviceConfig['speaker'];
        } else if (deviceType === 'fan') {
          roomState.fan = initializedState as DeviceConfig['fan'];
        }
      });
      
      rooms[roomConfig.id] = roomState;
    });
    
    return rooms;
  };
  // Initialize global devices using registry
  const initializeGlobalDevices = () => {
    const thermostatHandler = getDeviceHandler('thermostat');
    const lockHandler = getDeviceHandler('lock');
    
    return {
      thermostat: thermostatHandler.initialize(DEVICE_DEFAULTS.thermostat) as DeviceConfig['thermostat'],
      lock: lockHandler.initialize(DEVICE_DEFAULTS.lock) as DeviceConfig['lock'],
    };
  };

  // Merge persisted state with defaults (persisted takes precedence)
  const mergeWithPersistedState = useCallback((defaultState: DevicesState): DevicesState => {
    const persisted = loadPersistedState();
    if (!persisted) {
      return defaultState;
    }

    // Merge persisted state with defaults, ensuring all rooms and devices exist
    const merged: DevicesState = {
      rooms: { ...defaultState.rooms },
      thermostat: persisted.thermostat || defaultState.thermostat,
      lock: persisted.lock || defaultState.lock,
    };

    // Merge room states - use persisted if exists, otherwise use default
    Object.keys(defaultState.rooms).forEach(roomId => {
      const defaultRoom = defaultState.rooms[roomId];
      const persistedRoom = persisted.rooms?.[roomId];
      
      if (persistedRoom) {
        // Merge persisted room with default (persisted values take precedence)
        merged.rooms[roomId] = {
          ...defaultRoom,
          ...persistedRoom,
          // Merge device states
          light: persistedRoom.light || defaultRoom.light,
          speaker: persistedRoom.speaker || defaultRoom.speaker,
          fan: persistedRoom.fan || defaultRoom.fan,
        };
      } else {
        merged.rooms[roomId] = defaultRoom;
      }
    });

    return merged;
  }, []);

  const [devices, setDevices] = useState<DevicesState>({
    rooms: {},
    ...initializeGlobalDevices(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Wrapper for setDevices that also persists state
  const setDevicesWithPersistence = useCallback((updater: React.SetStateAction<DevicesState>) => {
    setDevices(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      // Save to localStorage (simulating database save)
      savePersistedState(newState);
      return newState;
    });
  }, []);

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      try {
        // Load rooms configuration from JSON
        const rawData = await loadRoomsConfig();
        
        // Validate and transform the data
        const roomsData: RoomsData = {
          rooms: rawData.rooms.map((room) => ({
            id: room.id,
            name: room.name,
            // Filter and validate device types (only room devices allowed)
            devices: (room.devices || []).filter((device: string) => {
              if (!isValidDeviceType(device)) {
                console.warn(`Invalid device type "${device}" in room ${room.name}. Skipping.`);
                return false;
              }
              if (!isRoomDeviceType(device)) {
                console.warn(`Device type "${device}" is a global device and cannot be assigned to rooms. Skipping in room ${room.name}.`);
                return false;
              }
              return true;
            }) as RoomDeviceType[],
          })),
          defaults: rawData.defaults,
        };
        
        // Initialize rooms with defaults
        const initializedRooms = initializeRoomsFromData(roomsData);
        const globalDevices = initializeGlobalDevices();
        
        const defaultState: DevicesState = {
          rooms: initializedRooms,
          ...globalDevices,
        };

        // Merge with persisted state (persisted values take precedence)
        const finalState = mergeWithPersistedState(defaultState);
        
        setDevices(finalState);
        // Save the merged state to ensure it's persisted
        savePersistedState(finalState);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading initial state:', error);
        // Try to load persisted state as fallback
        const persisted = loadPersistedState();
        if (persisted) {
          setDevices(persisted);
        }
        setIsLoading(false);
      }
    };

    loadInitialState();
  }, [mergeWithPersistedState]);

  return (
    <DeviceContext.Provider value={{ devices, setDevices: setDevicesWithPersistence, isLoading }}>
      {children}
    </DeviceContext.Provider>
  );
};


