
import Holidays from 'date-holidays';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  region: '中国' | '美国' | '欧洲' | '日本' | '韩国' | '东南亚';
}

// 从CSV文件读取的节日数据接口
interface CsvHoliday {
  title: string;
  date: string;
  category: string;
  url: string;
}

// CSV解析函数
const parseCSV = (csvText: string): CsvHoliday[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const holidays: CsvHoliday[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    
    const values = lines[i].split(',');
    const holiday: CsvHoliday = {
      title: values[0] || '',
      date: values[1] || '',
      category: values[2] || '',
      url: values[3] || ''
    };
    
    holidays.push(holiday);
  }

  return holidays;
};

// 加载CSV数据
const loadCsvHolidays = async (): Promise<Holiday[]> => {
  try {
    const response = await fetch('/data/calendar_database.csv');
    const csvText = await response.text();
    const csvHolidays = parseCSV(csvText);
    
    // 将CSV数据转换为Holiday对象，默认将所有节日分类为'中国'
    return csvHolidays.map(holiday => ({
      date: holiday.date,
      name: holiday.title,
      region: '中国' as const
    }));
  } catch (error) {
    console.error('Failed to load CSV holidays:', error);
    return [];
  }
};

// CSV数据缓存
let csvHolidaysCache: Holiday[] | null = null;

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

// 获取所有节日数据（包括CSV数据）
export const getAllHolidays = async (year: number): Promise<Holiday[]> => {
  // 加载传统节日数据
  const traditionalHolidays = getHolidays(year);
  
  // 加载CSV数据
  if (!csvHolidaysCache) {
    csvHolidaysCache = await loadCsvHolidays();
  }
  
  // 筛选出指定年份的CSV节日
  const csvHolidaysForYear = csvHolidaysCache.filter(holiday => 
    holiday.date.startsWith(year.toString())
  );
  
  // 合并并去重节日数据
  const allHolidays = [...traditionalHolidays, ...csvHolidaysForYear];
  
  // 去重
  const uniqueHolidays = allHolidays.filter((holiday, index, self) =>
    index === self.findIndex(t => t.date === holiday.date && t.name === holiday.name && t.region === holiday.region)
  );
  
  return uniqueHolidays;
};
