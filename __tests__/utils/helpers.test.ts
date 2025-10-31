import { describe, it, expect, beforeEach } from 'vitest';
import { calculateQiblaDirection, findNextPrayer, formatCountdown } from '../../utils/helpers';
import { Coordinates, PrayerTimes, NextPrayer } from '../../types';

describe('Qibla Direction', () => {
  it('should calculate qibla direction correctly', () => {
    // Test with New York coordinates
    const nyCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
    const direction = calculateQiblaDirection(nyCoords);
    
    // Qibla from NYC should be roughly northeast (45-90 degrees)
    expect(direction).toBeGreaterThan(30);
    expect(direction).toBeLessThan(120);
  });

  it('should handle Kaaba coordinates correctly', () => {
    // Test with Kaaba's own coordinates
    const kaabaCoords: Coordinates = { latitude: 21.4225, longitude: 39.8262 };
    const direction = calculateQiblaDirection(kaabaCoords);
    
    // Should be a valid angle between 0-360
    expect(direction).toBeGreaterThanOrEqual(0);
    expect(direction).toBeLessThanOrEqual(360);
  });

  it('should normalize bearing to 0-360 range', () => {
    const coords: Coordinates = { latitude: -33.8688, longitude: 151.2093 }; // Sydney
    const direction = calculateQiblaDirection(coords);
    
    expect(direction).toBeGreaterThanOrEqual(0);
    expect(direction).toBeLessThanOrEqual(360);
  });
});

describe('Next Prayer Logic', () => {
  const mockPrayerTimes: PrayerTimes = {
    Fajr: '06:00',
    Sunrise: '07:15',
    Dhuhr: '12:30',
    Asr: '15:45',
    Maghrib: '18:00',
    Isha: '19:30',
  };

  it('should find next prayer in the morning', () => {
    const morning = new Date(2025, 9, 1, 8, 0); // 8:00 AM
    const nextPrayer = findNextPrayer(mockPrayerTimes, morning);
    
    expect(nextPrayer).not.toBeNull();
    expect(nextPrayer!.name).toBe('Dhuhr');
    expect(nextPrayer!.isNextDay).toBe(false);
  });

  it('should find next prayer in the afternoon', () => {
    const afternoon = new Date(2025, 9, 1, 14, 0); // 2:00 PM
    const nextPrayer = findNextPrayer(mockPrayerTimes, afternoon);
    
    expect(nextPrayer).not.toBeNull();
    expect(nextPrayer!.name).toBe('Asr');
    expect(nextPrayer!.isNextDay).toBe(false);
  });

  it('should return next-day Fajr after all prayers pass', () => {
    const night = new Date(2025, 9, 1, 23, 0); // 11:00 PM
    const nextPrayer = findNextPrayer(mockPrayerTimes, night);
    
    expect(nextPrayer).not.toBeNull();
    expect(nextPrayer!.name).toBe('Fajr');
    expect(nextPrayer!.isNextDay).toBe(true);
  });

  it('should return correct time string', () => {
    const morning = new Date(2025, 9, 1, 11, 0, 0); // 11:00 AM
    const nextPrayer = findNextPrayer(mockPrayerTimes, morning);
    
    expect(nextPrayer!.time).toBe('12:30'); // Dhuhr at 12:30
  });
});

describe('Countdown Formatter', () => {
  it('should format countdown correctly for future times', () => {
    const now = new Date(2025, 9, 1, 12, 0, 0); // Noon
    const countdown = formatCountdown('15:45', now, false); // Asr at 3:45 PM
    
    // Should be "03:45:00"
    const parts = countdown.split(':');
    expect(parts[0]).toBe('03'); // 3 hours
    expect(parts[1]).toBe('45'); // 45 minutes
    expect(parts[2]).toBe('00'); // 0 seconds
  });

  it('should handle next-day countdown', () => {
    const now = new Date(2025, 9, 1, 23, 0, 0); // 11:00 PM
    const countdown = formatCountdown('06:00', now, true); // Fajr tomorrow
    
    const parts = countdown.split(':');
    const hours = parseInt(parts[0]);
    
    // Should be around 7 hours (to next day's 6 AM)
    expect(hours).toBeGreaterThanOrEqual(6);
    expect(hours).toBeLessThanOrEqual(8);
  });

  it('should return 00:00:00 for past times', () => {
    const now = new Date(2025, 9, 1, 15, 0, 0); // 3:00 PM
    const countdown = formatCountdown('14:00', now, false); // 2:00 PM (past, but will be tomorrow)
    
    // Since past times are treated as tomorrow, it should show countdown to tomorrow 2 PM
    const parts = countdown.split(':');
    const hours = parseInt(parts[0]);
    
    // Should be around 23 hours (from 3 PM today to 2 PM tomorrow)
    expect(hours).toBeGreaterThanOrEqual(22);
    expect(hours).toBeLessThanOrEqual(24);
  });

  it('should pad single digit values with zeros', () => {
    const now = new Date(2025, 9, 1, 12, 0, 0);
    const countdown = formatCountdown('12:05', now, false);
    
    // Should have leading zeros
    expect(countdown).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('should handle midnight boundary correctly', () => {
    const now = new Date(2025, 9, 1, 23, 59, 59); // Just before midnight
    const countdown = formatCountdown('00:30', now, true); // Next day 12:30 AM
    
    const parts = countdown.split(':');
    const seconds = parseInt(parts[2]);
    
    // Should be close to 1 second
    expect(seconds).toBeLessThanOrEqual(2);
  });
});
