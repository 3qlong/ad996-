import React, { useMemo } from 'react';
import { startOfWeek, endOfWeek, addDays, format, subWeeks, addWeeks, parseISO, isToday, getWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHolidays, Holiday } from '@/lib/holidayService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const regionColors: Record<string, string> = {
  '中国': 'bg-red-100 text-red-800 border-red-500',
  '美国': 'bg-blue-100 text-blue-800 border-blue-500',
  '欧洲': 'bg-indigo-100 text-indigo-800 border-indigo-500',
  '日本': 'bg-purple-100 text-purple-800 border-purple-500',
  '韩国': 'bg-pink-100 text-pink-800 border-pink-500',
  '东南亚': 'bg-green-100 text-green-800 border-green-500',
};

interface MarketingCalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const MarketingCalendarView = ({ currentDate, setCurrentDate }: MarketingCalendarViewProps) => {
    const currentYear = currentDate.getFullYear();

    const dynamicHolidays = useMemo(() => {
      const years = [currentYear - 1, currentYear, currentYear + 1];
      const allHolidays: Holiday[] = [];
      years.forEach(year => {
        allHolidays.push(...getHolidays(year));
      });
      return allHolidays;
    }, [currentYear]);
    
    const allHolidaysWithDateObjects = useMemo(() => {
        return dynamicHolidays.map(h => ({
            ...h,
            date: parseISO(h.date)
        }));
    }, [dynamicHolidays]);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleReturnToToday = () => setCurrentDate(new Date());

    const holidaysByDay = useMemo(() => {
        return days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            return allHolidaysWithDateObjects.filter(h => format(h.date, 'yyyy-MM-dd') === dayStr);
        });
    }, [days, allHolidaysWithDateObjects]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-1">
                     <Button variant="secondary" className="font-semibold">周</Button>
                     <Button variant="ghost">月</Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold w-auto text-center tabular-nums whitespace-nowrap">
                        {`${format(weekStart, 'yyyy年MM月dd日')} ~ ${format(weekEnd, 'yyyy年MM月dd日')} (第${getWeek(currentDate, { weekStartsOn: 1, locale: zhCN })}周)`}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
                <Button variant="outline" onClick={handleReturnToToday}>今天</Button>
            </div>
            
            {/* 日期与热点一排展示，移动端/iPad 100%宽度自适应 */}
            <div className="overflow-x-auto">
              <div className="flex flex-row border-y border-gray-200 bg-gray-50">
                  {days.map((day) => (
                      <div key={day.toString()} className={cn(
                        "flex-1 min-w-[115px] max-w-[160px] flex flex-col items-center py-2 px-1 border-l border-gray-200 first:border-l-0",
                        isToday(day) && "text-[#cda14c] font-bold"
                      )}>
                          <p className="font-semibold">{format(day, 'eee', { locale: zhCN })}</p>
                          <p className="text-sm text-gray-500">{format(day, 'MM/dd')}</p>
                      </div>
                  ))}
              </div>

              <div className="flex flex-row border-b border-gray-200 min-h-[58px]">
                  {days.map((day, i) => (
                      <div key={day.toString()} className="flex-1 min-w-[115px] max-w-[160px] p-2 border-l border-gray-200 first:border-l-0">
                          <div className="space-y-2">
                              {holidaysByDay[i].map((holiday, j) => (
                                  <div key={j} className={cn(
                                      "text-xs p-1.5 rounded border-l-4",
                                      regionColors[holiday.region] || 'bg-gray-100 text-gray-800 border-gray-300'
                                  )}>
                                      {holiday.name}
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
            </div>
        </div>
    );
};

export default MarketingCalendarView;
