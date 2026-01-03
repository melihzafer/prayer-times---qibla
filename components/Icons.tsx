import React from 'react';
import { 
    HiMagnifyingGlass, 
    HiMapPin, 
    HiSun, 
    HiMoon, 
    HiClock, 
    HiGlobeAlt, 
    HiChevronLeft, 
    HiChevronRight, 
    HiUser, 
    HiHome, 
    HiCalendar, 
    HiCog6Tooth, 
    HiBell, 
    HiBellSlash, 
    HiCalendarDays, 
    HiSparkles, 
    HiBookOpen, 
    HiStar, 
    HiCamera,
    HiXMark,
    HiCheck,
    HiExclamationTriangle,
    HiArrowRight,
    HiInformationCircle
} from "react-icons/hi2";
import { FaMosque } from "react-icons/fa6";
import { LuTarget, LuCompass } from "react-icons/lu";

type IconProps = {
    className?: string;
    strokeWidth?: number;
};

// Wrapper function to maintain existing interface
const wrapIcon = (IconComponent: any, defaultClassName: string = "h-6 w-6") => {
    return ({ className = defaultClassName, strokeWidth = 0.8 }: IconProps) => (
        <IconComponent className={className} strokeWidth={strokeWidth} />
    );
};

export const MagnifyingGlassIcon = wrapIcon(HiMagnifyingGlass, "h-5 w-5");
export const MapPinIcon = wrapIcon(HiMapPin);
export const SunIcon = wrapIcon(HiSun);
export const MoonIcon = wrapIcon(HiMoon);
export const ClockIcon = wrapIcon(HiClock);
export const GlobeIcon = wrapIcon(HiGlobeAlt);
export const ChevronLeftIcon = wrapIcon(HiChevronLeft);
export const ChevronRightIcon = wrapIcon(HiChevronRight);
export const UserIcon = wrapIcon(HiUser);
export const HomeIcon = wrapIcon(HiHome);
export const CompassIcon = wrapIcon(LuCompass);
export const CalendarIcon = wrapIcon(HiCalendar);
export const CogIcon = wrapIcon(HiCog6Tooth);
export const BellIcon = wrapIcon(HiBell);
export const BellSlashIcon = wrapIcon(HiBellSlash);
export const CalendarDaysIcon = wrapIcon(HiCalendarDays);
export const SparklesIcon = wrapIcon(HiSparkles, "h-5 w-5");
export const BookOpenIcon = wrapIcon(HiBookOpen);
export const StarIcon = wrapIcon(HiStar);
export const CameraIcon = wrapIcon(HiCamera);
export const XIcon = wrapIcon(HiXMark);
export const CheckIcon = wrapIcon(HiCheck);
export const AlertTriangleIcon = wrapIcon(HiExclamationTriangle);
export const ArrowRightIcon = wrapIcon(HiArrowRight);
export const InformationCircleIcon = wrapIcon(HiInformationCircle, "h-4 w-4");
export const TargetIcon = wrapIcon(LuTarget); 

// Mosque is from Fa6 - doesn't support strokeWidth in the same way but consistency is key
export const MosqueIcon = ({ className = "h-6 w-6" }: IconProps) => (
    <FaMosque className={className} />
);