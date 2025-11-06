/**
 * Formatters - Data formatting utilities
 * Centralized formatting logic for consistent data display
 */

/**
 * Date Formatter
 */
export class DateFormatter {
  /**
   * Format date to locale string
   */
  static format(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', options);
  }
  
  /**
   * Format date and time
   */
  static formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  /**
   * Format date only
   */
  static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  /**
   * Format time only
   */
  static formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  /**
   * Format relative time (e.g., "2 hours ago")
   */
  static formatRelative(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  }
  
  /**
   * Format ISO string
   */
  static formatISO(date: Date): string {
    return date.toISOString();
  }
  
  /**
   * Format duration (milliseconds to human-readable)
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

/**
 * Number Formatter
 */
export class NumberFormatter {
  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
  
  /**
   * Format number with decimals
   */
  static formatNumber(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }
  
  /**
   * Format percentage
   */
  static formatPercent(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num / 100);
  }
  
  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);
    
    return `${size.toFixed(2)} ${units[i]}`;
  }
  
  /**
   * Format compact number (e.g., 1.2K, 3.5M)
   */
  static formatCompact(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  
  /**
   * Format with thousands separator
   */
  static formatWithSeparator(num: number): string {
    return num.toLocaleString('en-US');
  }
  
  /**
   * Format ordinal number (1st, 2nd, 3rd, etc.)
   */
  static formatOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
}

/**
 * String Formatter
 */
export class StringFormatter {
  /**
   * Truncate string
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }
  
  /**
   * Capitalize first letter
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * Capitalize all words
   */
  static capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }
  
  /**
   * Convert to slug
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  /**
   * Convert camelCase to Title Case
   */
  static camelToTitle(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }
  
  /**
   * Convert snake_case to Title Case
   */
  static snakeToTitle(str: string): string {
    return str
      .split('_')
      .map(word => this.capitalize(word))
      .join(' ');
  }
  
  /**
   * Pluralize word
   */
  static pluralize(word: string, count: number): string {
    if (count === 1) return word;
    
    // Simple pluralization rules
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    }
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
        word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es';
    }
    return word + 's';
  }
  
  /**
   * Format phone number
   */
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return as-is if doesn't match expected format
  }
  
  /**
   * Mask sensitive data
   */
  static mask(str: string, visibleStart: number = 4, visibleEnd: number = 4): string {
    if (str.length <= visibleStart + visibleEnd) {
      return str;
    }
    
    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const masked = '*'.repeat(str.length - visibleStart - visibleEnd);
    
    return `${start}${masked}${end}`;
  }
  
  /**
   * Format credit card number
   */
  static formatCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  }
  
  /**
   * Extract initials
   */
  static getInitials(name: string, maxLength: number = 2): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, maxLength);
  }
  
  /**
   * Highlight search term
   */
  static highlight(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

/**
 * Utility exports for convenient access
 */
export const formatDate = DateFormatter.formatDate;
export const formatDateTime = DateFormatter.formatDateTime;
export const formatTime = DateFormatter.formatTime;
export const formatRelative = DateFormatter.formatRelative;
export const formatDuration = DateFormatter.formatDuration;

export const formatCurrency = NumberFormatter.formatCurrency;
export const formatNumber = NumberFormatter.formatNumber;
export const formatPercent = NumberFormatter.formatPercent;
export const formatFileSize = NumberFormatter.formatFileSize;
export const formatCompact = NumberFormatter.formatCompact;

export const truncate = StringFormatter.truncate;
export const capitalize = StringFormatter.capitalize;
export const slugify = StringFormatter.slugify;
export const pluralize = StringFormatter.pluralize;
export const formatPhone = StringFormatter.formatPhone;
export const mask = StringFormatter.mask;
