
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getHolidays, Holiday } from '@/lib/holidayService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const WeeklyCalendar = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const currentYear = currentDate.getFullYear();

  const dynamicHolidays = React.useMemo(() => {
    const years = [currentYear - 1, currentYear, currentYear + 1];
    const allHolidays: Holiday[] = [];
    years.forEach(year => {
      allHolidays.push(...getHolidays(year));
    });
    return allHolidays;
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

  const handleReturnToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const holidaysThisWeek = React.useMemo(() => {
    return dynamicHolidays
      .map(h => ({ ...h, date: parseISO(h.date) }))
      .filter(holiday => holiday.date >= weekStart && holiday.date <= weekEnd)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [dynamicHolidays, weekStart, weekEnd]);

  const regions: Holiday['region'][] = ['欧洲', '美国', '中国', '东南亚', '日本', '韩国'];

  const holidaysByRegion = React.useMemo(() => {
    return regions.reduce((acc, region) => {
      const regionHolidays = holidaysThisWeek.filter(h => h.region === region);
      if (regionHolidays.length > 0) {
        acc[region] = regionHolidays;
      }
      return acc;
    }, {} as Record<Holiday['region'], (typeof holidaysThisWeek)>);
  }, [holidaysThisWeek]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const holidaysOnSelectedDate = selectedDateStr ? holidaysByDate[selectedDateStr] : null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <style>{`
        .holiday-date {
          position: relative;
          color: #cda14c !important;
        }
        .holiday-date[aria-selected="true"] {
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
          background-color: #cda14c;
        }
        .holiday-date[aria-selected="true"]::after {
          background-color: white;
        }
      `}</style>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">出海营销日历</h3>
        <Button variant="outline" onClick={handleReturnToToday} className="h-8 px-3 text-xs hover:bg-[#cda14c]/20">
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
            day_selected:
              'bg-[#cda14c] text-white hover:bg-[#cda14c]/90 focus:bg-[#cda14c] focus:text-white',
            day_today: 'bg-[#cda14c]/20 text-[#cda14c]',
          }}
          footer={
            selectedDate && holidaysOnSelectedDate ? (
              <div className="text-sm mt-2 pt-2 border-t text-center">
                <p className="font-bold mb-1 text-[#cda14c]">{format(selectedDate, 'M月d日', { locale: zhCN })}:</p>
                <ul className="space-y-1">
                  {holidaysOnSelectedDate.map((h, index) => (
                    <li key={`${h.name}-${index}`} className="text-[#cda14c] font-medium">
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
      <div className="mt-4 border-t pt-4">
        <h4 className="font-semibold mb-2">{format(weekStart, 'M月d日')} - {format(weekEnd, 'M月d日')} 每周热点</h4>
        {Object.keys(holidaysByRegion).length > 0 ? (
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {Object.entries(holidaysByRegion).map(([region, holidays]) => (
              <div key={region}>
                <h5 className="font-semibold text-sm mb-2 text-gray-700">{region}</h5>
                <ul className="space-y-2 text-sm pl-1">
                  {holidays.slice(0, 10).map((holiday, index) => (
                    <li key={`${holiday.name}-${index}`} className="text-[#cda14c] flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#cda14c] mr-3 shrink-0"></span>
                      <span className="truncate">
                        <span className="font-medium">{format(holiday.date, 'M月d日 (E)', { locale: zhCN })}:</span> {holiday.name}
                      </span>
                    </li>
                  ))}
                </ul>
                {holidays.length > 10 && (
                  <div className="mt-2 pl-5">
                    <Link to="/marketing-calendar">
                      <Button variant="link" className="text-xs p-0 h-auto text-[#cda14c] hover:underline">
                        查看更多...
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">本周没有特别的节日。</p>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
