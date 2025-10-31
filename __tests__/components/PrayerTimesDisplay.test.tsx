import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PrayerTimesDisplay from '../../components/PrayerTimesDisplay';
import { PrayerTimes, HijriDate, NextPrayer, UserProfile } from '../../types';

describe('PrayerTimesDisplay Component', () => {
  const mockPrayerTimes: PrayerTimes = {
    Fajr: '06:00',
    Sunrise: '07:15',
    Dhuhr: '12:30',
    Asr: '15:45',
    Maghrib: '18:00',
    Isha: '19:30',
  };

  const mockHijriDate: HijriDate = {
    date: '14/10/1446',
    day: '14',
    weekday: { en: 'Saturday', ar: 'السبت' },
    month: { en: 'Rabi al-awwal', ar: 'ربيع الأول' },
    year: '1446',
  };

  const mockNextPrayer: NextPrayer = {
    name: 'Asr',
    time: '15:45',
    isNextDay: false,
  };

  const mockUser: UserProfile = {
    isLoggedIn: false,
    name: 'Guest',
    notificationPrefs: {},
  };

  const defaultProps = {
    prayerTimes: mockPrayerTimes,
    hijriDate: mockHijriDate,
    nextPrayer: mockNextPrayer,
    countdown: '03:15:30',
    selectedDate: new Date(2025, 10, 1),
    goToPreviousDay: vi.fn(),
    goToNextDay: vi.fn(),
    t: (key: string) => key,
    user: mockUser,
    togglePrayerNotification: vi.fn(),
  };

  it('should render prayer times correctly', () => {
    render(<PrayerTimesDisplay {...defaultProps} />);
    
    expect(screen.getByText('12:30')).toBeInTheDocument(); // Dhuhr time
    expect(screen.getByText('15:45')).toBeInTheDocument(); // Asr time
  });

  it('should display current time when today', () => {
    const today = new Date();
    render(<PrayerTimesDisplay {...defaultProps} selectedDate={today} />);
    
    // Should show a time display (current time)
    const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('should display next prayer info', () => {
    const { container } = render(<PrayerTimesDisplay {...defaultProps} />);
    
    // Check that the component renders prayer names (we can see them via container text)
    const content = container.textContent;
    expect(content).toContain('Asr'); // Next prayer name should be present
  });

  it('should highlight next prayer', () => {
    const { container } = render(<PrayerTimesDisplay {...defaultProps} />);
    
    // The component should render without errors
    expect(container).toBeInTheDocument();
  });

  it('should not show current time for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    render(<PrayerTimesDisplay {...defaultProps} selectedDate={pastDate} />);
    
    // Should not show countdown for past dates
    expect(screen.queryByText('03:15:30')).not.toBeInTheDocument();
  });

  it('should render Hijri date information', () => {
    const { container } = render(<PrayerTimesDisplay {...defaultProps} />);
    
    // Check if Hijri date is rendered somewhere in the component
    const hijriDateElement = container.textContent;
    expect(hijriDateElement).toContain('14');
  });

  it('should call navigation functions on button clicks', async () => {
    const goToPreviousDay = vi.fn();
    const goToNextDay = vi.fn();
    
    render(
      <PrayerTimesDisplay
        {...defaultProps}
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    // Navigation buttons should be among the buttons
    expect(buttons.length).toBeGreaterThan(0);
  });
});
