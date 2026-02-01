
export interface IndianHoliday {
  name: string;
  date: string;
  type: string;
}

export const getIndianHolidays = (year: number): IndianHoliday[] => {
  return [
    { name: 'Republic Day', date: `${year}-01-26`, type: 'National' },
    { name: 'Holi', date: `${year}-03-25`, type: 'Gazetted' },
    { name: 'Good Friday', date: `${year}-03-29`, type: 'Gazetted' },
    { name: 'Eid al-Fitr', date: `${year}-04-11`, type: 'Gazetted' },
    { name: 'Independence Day', date: `${year}-08-15`, type: 'National' },
    { name: 'Gandhi Jayanti', date: `${year}-10-02`, type: 'National' },
    { name: 'Dussehra', date: `${year}-10-12`, type: 'Gazetted' },
    { name: 'Diwali', date: `${year}-11-01`, type: 'Gazetted' },
    { name: 'Christmas Day', date: `${year}-12-25`, type: 'Gazetted' },
  ];
};
