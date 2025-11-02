"use client";

import { useState, useEffect } from 'react';

export function useFormattedDate(dateToFormat?: Date) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const date = dateToFormat || new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
    
    // A little trick to get the "th", "st", "nd", "rd" suffix
    const day = date.getDate();
    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) {
      suffix = 'st';
    } else if (day % 10 === 2 && day !== 12) {
      suffix = 'nd';
    } else if (day % 10 === 3 && day !== 13) {
      suffix = 'rd';
    }
    
    const dayWithSuffix = `${day}${suffix}`;
    const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    
    setFormattedDate(formatted.replace(new RegExp(`\\b${day}\\b`), dayWithSuffix));

  }, [dateToFormat]);

  return formattedDate;
}
