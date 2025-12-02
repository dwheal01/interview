import type { DeviceType } from './devices';
import type { RoomId } from './devices';

// Schedule trigger types
export type ScheduleTrigger = 
  | { type: 'time'; time: string } // "22:00" format
  | { type: 'condition'; condition: string } // Future: temperature, etc.
  | { type: 'recurring'; cron: string }; // Future: cron expressions

// Schedule action types
export type ScheduleAction = 
  | { type: 'set'; value: any } // Set device to specific value
  | { type: 'toggle' } // Toggle device state
  | { type: 'increment'; amount: number } // Increment by amount
  | { type: 'decrement'; amount: number }; // Decrement by amount

// Schedule rule
export type ScheduleRule = {
  id: string;
  name: string;
  deviceType: DeviceType;
  deviceId?: RoomId; // For room devices, undefined for global devices
  trigger: ScheduleTrigger;
  action: ScheduleAction;
  enabled: boolean;
  lastExecuted?: string; // ISO timestamp
};

// Scheduler state
export type SchedulerState = {
  rules: Record<string, ScheduleRule>;
};

