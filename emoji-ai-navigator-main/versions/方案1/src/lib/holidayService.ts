
import Holidays from 'date-holidays';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  region: '中国' | '美国' | '欧洲' | '日本' | '韩国' | '东南亚';
}

const hd = new Holidays();

// Mapping from our custom regions to country codes used by date-holidays
const regionCountryCodes: Record<Holiday['region'], string[]> = {
  '中国': ['CN'],
  '美国': ['US'],
  '日本': ['JP'],
  '韩国': ['KR'],
  '欧洲': ['DE', 'FR', 'GB', 'ES', 'IT'],
  '东南亚': ['SG', 'MY', 'ID', 'PH', 'TH', 'VN']
};

const getHolidaysForYear = (year: number): Holiday[] => {
  const allHolidays: Holiday[] = [];
  
  (Object.keys(regionCountryCodes) as Array<keyof typeof regionCountryCodes>).forEach(region => {
    const countryCodes = regionCountryCodes[region];
    const holidaysForRegion: Holiday[] = [];

    countryCodes.forEach(code => {
      hd.init(code);
      const holidaysFromLib: any[] = hd.getHolidays(year);
      holidaysFromLib
        .filter(h => h.type === 'public')
        .forEach(h => {
          holidaysForRegion.push({
            date: h.date.split(' ')[0], // Format is 'YYYY-MM-DD HH:mm:ss', we need 'YYYY-MM-DD'
            name: h.name,
            region: region
          });
        });
    });

    // Remove duplicates within a region (e.g. New Year's Day in multiple European countries)
    const uniqueHolidaysForRegion = holidaysForRegion.filter((holiday, index, self) =>
        index === self.findIndex(t => t.date === holiday.date && t.name === holiday.name)
    );
    
    allHolidays.push(...uniqueHolidaysForRegion);
  });
  
  return allHolidays;
};

const holidayCache: Record<number, Holiday[]> = {};

export const getHolidays = (year: number): Holiday[] => {
  if (holidayCache[year]) {
    return holidayCache[year];
  }
  const holidays = getHolidaysForYear(year);
  holidayCache[year] = holidays;
  return holidays;
};
