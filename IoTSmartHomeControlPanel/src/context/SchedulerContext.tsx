import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ScheduleRule, SchedulerState } from '../types/scheduler';
import { getDeviceHandler } from '../registry/deviceRegistry';

type SchedulerContextType = {
  scheduler: SchedulerState;
  setScheduler: React.Dispatch<React.SetStateAction<SchedulerState>>;
  addRule: (rule: Omit<ScheduleRule, 'id' | 'lastExecuted'>) => string;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  executeRule: (rule: ScheduleRule, devices: any, setDevices: any) => void;
};

const SchedulerContext = createContext<SchedulerContextType | undefined>(undefined);

export const SchedulerContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheduler, setScheduler] = useState<SchedulerState>({
    rules: {},
  });

  // Add a new schedule rule
  const addRule = (rule: Omit<ScheduleRule, 'id' | 'lastExecuted'>): string => {
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRule: ScheduleRule = {
      ...rule,
      id,
      lastExecuted: undefined,
    };
    setScheduler(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [id]: newRule,
      },
    }));
    return id;
  };

  // Remove a schedule rule
  const removeRule = (id: string) => {
    setScheduler(prev => {
      const { [id]: _, ...rest } = prev.rules;
      return { ...prev, rules: rest };
    });
  };

  // Toggle rule enabled state
  const toggleRule = (id: string) => {
    setScheduler(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [id]: {
          ...prev.rules[id],
          enabled: !prev.rules[id].enabled,
        },
      },
    }));
  };

  // Execute a schedule rule
  const executeRule = (rule: ScheduleRule, devices: any, setDevices: any) => {
    if (!rule.enabled) return;

    const handler = getDeviceHandler(rule.deviceType);
    
    if (rule.deviceId) {
      // Room device
      const room = devices.rooms[rule.deviceId];
      if (!room) return;

      const currentState = room[rule.deviceType];
      if (!currentState) return;

      let newState;
      switch (rule.action.type) {
        case 'set':
          newState = handler.update(currentState, rule.action.value);
          break;
        case 'toggle':
          newState = handler.update(currentState, undefined);
          break;
        case 'increment':
          // Device-specific increment logic would go here
          newState = currentState;
          break;
        case 'decrement':
          // Device-specific decrement logic would go here
          newState = currentState;
          break;
        default:
          return;
      }

      setDevices((prev: any) => ({
        ...prev,
        rooms: {
          ...prev.rooms,
          [rule.deviceId!]: {
            ...prev.rooms[rule.deviceId!],
            [rule.deviceType]: newState,
          },
        },
      }));
    } else {
      // Global device
      const currentState = devices[rule.deviceType];
      if (!currentState) return;

      let newState;
      switch (rule.action.type) {
        case 'set':
          newState = handler.update(currentState, rule.action.value);
          break;
        case 'toggle':
          newState = handler.update(currentState, undefined);
          break;
        default:
          return;
      }

      setDevices((prev: any) => ({
        ...prev,
        [rule.deviceType]: newState,
      }));
    }

    // Update last executed timestamp
    setScheduler(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [rule.id]: {
          ...prev.rules[rule.id],
          lastExecuted: new Date().toISOString(),
        },
      },
    }));
  };

  // Check and execute time-based rules
  useEffect(() => {
    const checkSchedules = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      Object.values(scheduler.rules).forEach(rule => {
        if (!rule.enabled || rule.trigger.type !== 'time') return;
        
        if (rule.trigger.time === currentTime) {
          // Execute rule (would need access to devices context)
          // This is a simplified version - in production, you'd want to
          // combine this with DeviceContext or use a different pattern
          console.log(`Executing schedule: ${rule.name}`);
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkSchedules, 60000);
    checkSchedules(); // Initial check

    return () => clearInterval(interval);
  }, [scheduler.rules]);

  return (
    <SchedulerContext.Provider value={{ scheduler, setScheduler, addRule, removeRule, toggleRule, executeRule }}>
      {children}
    </SchedulerContext.Provider>
  );
};

export const useScheduler = (): SchedulerContextType => {
  const ctx = useContext(SchedulerContext);
  if (!ctx) throw new Error('useScheduler must be used within SchedulerContextProvider');
  return ctx;
};

