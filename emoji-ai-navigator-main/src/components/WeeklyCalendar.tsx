
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO, eachDayOfInterval, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getHolidays, getAllHolidays, Holiday } from '@/lib/holidayService';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 颜色方案
const COLORS = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9F9F9',
    border: 'rgba(0, 0, 0, 0.1)',
    text: '#000000',
    textSecondary: '#606060',
    textTertiary: '#999999',
    button: '#007AFF',
    buttonHover: '#0056b3',
    buttonText: '#FFFFFF',
    link: '#007AFF',
  },
  dark: {
    background: '#1E1E1E',
    backgroundSecondary: '#2C2C2C',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textSecondary: '#606060',
    textTertiary: '#999999',
    button: '#1E88E5',
    buttonHover: '#1565C0',
    buttonText: '#FFFFFF',
    link: '#1E88E5',
  }
};

interface WeeklyCalendarProps {
  isDarkMode?: boolean;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ isDarkMode = false }) => {
  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = React.useState<'week' | 'month'>('week');
  const navigate = useNavigate();

  const currentYear = currentDate.getFullYear();

  const [dynamicHolidays, setDynamicHolidays] = React.useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadHolidays = async () => {
      setIsLoading(true);
      try {
        const years = [currentYear - 1, currentYear, currentYear + 1];
        const allHolidays: Holiday[] = [];

        const holidayPromises = years.map(year => getAllHolidays(year));
        const holidayResults = await Promise.all(holidayPromises);

        holidayResults.forEach(holidays => {
          allHolidays.push(...holidays);
        });

        setDynamicHolidays(allHolidays);
      } catch (error) {
        console.error('Failed to load holidays:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHolidays();
  }, [currentYear]);

  const holidaysByDate: Record<string, { name: string; region: string }[]> = React.useMemo(() => {
    const map: Record<string, { name: string; region: string }[]> = {};
    dynamicHolidays.forEach((holiday) => {
      if (!map[holiday.date]) {
        map[holiday.date] = [];
      }
      map[holiday.date].push({ name: holiday.name, region: holiday.region });
    });
    return map;
  }, [dynamicHolidays]);

  const holidayDates = React.useMemo(() => Object.keys(holidaysByDate).map((dateStr) => parseISO(dateStr)), [holidaysByDate]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const handleReturnToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const regions: Holiday['region'][] = ['欧洲', '美国', '中国', '东南亚', '日本', '韩国'];

  // Week holidays
  const holidaysThisWeek = React.useMemo(() => {
    return dynamicHolidays
      .map(h => ({ ...h, date: parseISO(h.date) }))
      .filter(holiday => holiday.date >= weekStart && holiday.date <= weekEnd)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [dynamicHolidays, weekStart, weekEnd]);

  const weekHolidaysByRegion = React.useMemo(() => {
    return regions.reduce((acc, region) => {
      const regionHolidays = holidaysThisWeek.filter(h => h.region === region);
      if (regionHolidays.length > 0) {
        acc[region] = regionHolidays;
      }
      return acc;
    }, {} as Record<Holiday['region'], (typeof holidaysThisWeek)>);
  }, [holidaysThisWeek]);

  // Month holidays
  const holidaysThisMonth = React.useMemo(() => {
    return dynamicHolidays
      .map(h => ({ ...h, date: parseISO(h.date) }))
      .filter(holiday => holiday.date >= monthStart && holiday.date <= monthEnd)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [dynamicHolidays, monthStart, monthEnd]);

  const monthHolidaysByRegion = React.useMemo(() => {
    return regions.reduce((acc, region) => {
      const regionHolidays = holidaysThisMonth.filter(h => h.region === region);
      if (regionHolidays.length > 0) {
        acc[region] = regionHolidays;
      }
      return acc;
    }, {} as Record<Holiday['region'], (typeof holidaysThisMonth)>);
  }, [holidaysThisMonth]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const holidaysOnSelectedDate = selectedDateStr ? holidaysByDate[selectedDateStr] : null;

  const activeHolidaysByRegion = viewMode === 'week' ? weekHolidaysByRegion : monthHolidaysByRegion;
  const rangeLabel = viewMode === 'week'
    ? `${format(weekStart, 'M月d日')} - ${format(weekEnd, 'M月d日')} 每周热点`
    : `${format(monthStart, 'M月')} 每月热点`;

  return (
    <div className="rounded-lg shadow-sm p-6 sticky top-14" style={{ backgroundColor: currentColors.backgroundSecondary, border: `1px solid ${currentColors.border}` }}>
      <style>{`
        .holiday-date {
          position: relative;
          color: #00a7f4 !important;
        }
        .holiday-date[aria-selected="true"],
        .holiday-date.today-marker {
          color: white !important;
        }
        .holiday-date::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #00a7f4;
        }
        .holiday-date[aria-selected="true"]::after,
        .holiday-date.today-marker::after {
          background-color: white;
        }
      `}</style>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold" style={{ color: currentColors.text }}>出海营销日历</h3>
        <Button
          variant="outline"
          onClick={handleReturnToToday}
          className="h-8 px-3 text-xs text-white border-green-700"
          style={{
            backgroundColor: '#00a7f4',
            borderColor: '#00a7f4',
            color: '#FFFFFF',
          }}
        >
          返回今日
        </Button>
      </div>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentDate}
          onMonthChange={setCurrentDate}
          className="p-0"
          locale={zhCN}
          modifiers={{
            holiday: holidayDates,
          }}
          modifiersClassNames={{
            holiday: 'holiday-date',
          }}
          classNames={{
            day_selected: 'bg-[#00a7f4] text-white hover:bg-[#16a34a] focus:bg-[#00a7f4] focus:text-white',
            day_today: 'bg-[#00a7f4] text-white today-marker',
          }}
          footer={
            selectedDate && holidaysOnSelectedDate ? (
              <div className="text-sm mt-2 pt-2 border-t text-center">
                <p className="font-bold mb-1">{format(selectedDate, 'M月d日', { locale: zhCN })}:</p>
                <ul className="space-y-1">
                  {holidaysOnSelectedDate.map((h, index) => (
                    <li key={`${h.name}-${index}`} className="font-medium">
                      {h.name} <span className="text-xs text-gray-500 font-normal">({h.region})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm mt-2 pt-2 border-t text-center text-gray-400">选择一个日期查看节日。</p>
            )
          }
        />
      </div>

      {/* Holiday list */}
      <div className="mt-4 border-t pt-4" style={{ borderColor: currentColors.border }}>
        <h4 className="font-semibold mb-2 text-sm" style={{ color: currentColors.text }}>
          {rangeLabel}
        </h4>

        {Object.keys(activeHolidaysByRegion).length > 0 ? (
          <div
            className="space-y-4 overflow-y-auto"
            style={{ maxHeight: '240px' }}
          >
            {Object.entries(activeHolidaysByRegion).map(([region, holidays]) => (
              <div key={region}>
                <h5 className="font-semibold text-sm mb-2" style={{ color: currentColors.text }}>{region}</h5>
                <ul className="space-y-2 text-sm pl-1">
                  {holidays.slice(0, 5).map((holiday, index) => (
                    <li key={`${holiday.name}-${index}`} className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#00a7f4] mr-3 shrink-0"></span>
                      <span
                        className="truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: currentColors.textSecondary }}
                        onClick={() => navigate(`/marketing-calendar?view=week`)}
                      >
                        <span className="font-medium" style={{ color: currentColors.text }}>
                          {format(holiday.date, 'M月d日 (E)', { locale: zhCN })}:
                        </span>{' '}
                        <span style={{ color: '#00a7f4' }}>{holiday.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: currentColors.textSecondary }}>
            本周没有特别的节日。
          </p>
        )}

        {/* 查看更多 - 底部 */}
        <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: currentColors.border }}>
          <button
            onClick={() => navigate('/marketing-calendar?view=week')}
            className="flex items-center justify-center gap-1 text-xs font-medium transition-colors mx-auto hover:opacity-80"
            style={{ color: '#00a7f4' }}
          >
            查看更多
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
