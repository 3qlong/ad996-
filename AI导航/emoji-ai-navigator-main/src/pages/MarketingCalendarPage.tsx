
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { Calendar } from '@/components/ui/calendar';
import { zhCN } from 'date-fns/locale';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addDays, addWeeks, subWeeks, addMonths, subMonths,
  format, parseISO, isToday, getWeek, isSameMonth, isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { getAllHolidays, Holiday } from '@/lib/holidayService';
import RecommendedToolsCard from '@/components/RecommendedToolsCard';

// English to Chinese holiday name translations
const holidayTranslations: Record<string, string> = {
  // US
  "New Year's Day": "元旦",
  "Martin Luther King Jr. Day": "马丁·路德·金纪念日",
  "Washington's Birthday": "华盛顿诞辰日",
  "Presidents' Day": "总统日",
  "Memorial Day": "阵亡将士纪念日",
  "Juneteenth": "六月节",
  "Independence Day": "独立日",
  "Independence Day (substitute day)": "独立日(补休)",
  "Labor Day": "劳动节",
  "Columbus Day": "哥伦布日",
  "Veterans Day": "退伍军人节",
  "Thanksgiving Day": "感恩节",
  "Christmas Day": "圣诞节",
  "Christmas Eve": "平安夜",
  "New Year's Eve": "除夕",
  // Europe - German
  "Neujahr": "元旦",
  "Karfreitag": "耶稣受难日",
  "Ostermontag": "复活节星期一",
  "Ostersonntag": "复活节",
  "Tag der Arbeit": "劳动节",
  "Christi Himmelfahrt": "耶稣升天节",
  "Pfingstmontag": "圣灵降临节星期一",
  "Pfingstsonntag": "圣灵降临节",
  "Tag der Deutschen Einheit": "德国统一日",
  "Reformationstag": "宗教改革纪念日",
  "Weihnachten": "圣诞节",
  "2. Weihnachtsfeiertag": "圣诞节次日",
  "1. Weihnachtsfeiertag": "圣诞节",
  "Heiligabend": "平安夜",
  "Silvester": "除夕",
  // Europe - French
  "Jour de l'an": "元旦",
  "Lundi de Pâques": "复活节星期一",
  "Fête du Travail": "劳动节",
  "Victoire 1945": "二战胜利纪念日",
  "Ascension": "耶稣升天节",
  "Lundi de Pentecôte": "圣灵降临节星期一",
  "Fête Nationale de la France": "法国国庆日",
  "Assomption": "圣母升天节",
  "Toussaint": "万圣节",
  "Armistice 1918": "一战停战纪念日",
  "Noël": "圣诞节",
  // Europe - UK
  "Good Friday": "耶稣受难日",
  "Easter Monday": "复活节星期一",
  "Early May Bank Holiday": "五月初银行假日",
  "Spring Bank Holiday": "春季银行假日",
  "Summer Bank Holiday": "夏季银行假日",
  "Boxing Day": "节礼日",
  // Europe - Spanish
  "Año Nuevo": "元旦",
  "Viernes Santo": "耶稣受难日",
  "Día del Trabajador": "劳动节",
  "Fiesta Nacional de España": "西班牙国庆日",
  "Día de la Constitución": "宪法日",
  "Inmaculada Concepción": "圣母无染原罪节",
  "Navidad": "圣诞节",
  "Asunción de la Virgen": "圣母升天节",
  "Día de Todos los Santos": "万圣节",
  // Europe - Italian
  "Capodanno": "元旦",
  "Epifania": "主显节",
  "Lunedì dell'Angelo": "复活节星期一",
  "Festa della Liberazione": "解放日",
  "Festa del Lavoro": "劳动节",
  "Festa della Repubblica": "共和国日",
  "Ferragosto": "八月节",
  "Ognissanti": "万圣节",
  "Immacolata Concezione": "圣母无染原罪节",
  "Natale di Gesù": "圣诞节",
  "Santo Stefano": "圣斯蒂芬节",
  "Domenica di Pasqua": "复活节",
  // Japan
  "元日": "元旦",
  "成人の日": "成人节",
  "建国記念の日": "建国纪念日",
  "天皇誕生日": "天皇生日",
  "春分の日": "春分",
  "昭和の日": "昭和日",
  "憲法記念日": "宪法纪念日",
  "みどりの日": "绿之日",
  "こどもの日": "儿童节",
  "海の日": "海洋节",
  "山の日": "山之日",
  "敬老の日": "敬老节",
  "秋分の日": "秋分",
  "スポーツの日": "体育节",
  "文化の日": "文化节",
  "勤労感謝の日": "劳动感恩节",
  // Korea
  "신정": "新年",
  "삼일절": "三一节",
  "어린이날": "儿童节",
  "현충일": "显忠日",
  "광복절": "光复节",
  "개천절": "开天节",
  "한글날": "韩文日",
  "크리스마스": "圣诞节",
  // Southeast Asia
  "Hari Raya Aidilfitri": "开斋节",
  "Hari Raya Haji": "哈芝节",
  "Deepavali": "屠妖节",
  "Vesak Day": "卫塞节",
  "Chinese New Year": "春节",
  "Thaipusam": "大宝森节",
  "Hari Kebangsaan": "国庆日",
  "Hari Malaysia": "马来西亚日",
  "Songkran": "泼水节",
  "Chakri Memorial Day": "查克里王朝纪念日",
  "Coronation Day": "加冕纪念日",
  "National Day": "国庆日",
  "Day of Valor": "勇气日",
  "Easter Sunday": "复活节",
  "Maundy Thursday": "濯足节",
  "Jueves Santo": "圣周四",
  "Viernes Santo": "圣周五",
  "Wafat Yesus Kristus": "耶稣受难日",
  "Anniversario della Liberazione": "解放纪念日",
};

const translateHoliday = (name: string): string | null => {
  if (holidayTranslations[name]) return holidayTranslations[name];
  // Check partial matches
  for (const [key, val] of Object.entries(holidayTranslations)) {
    if (name.includes(key)) return val;
  }
  return null;
};

const COLORS = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9F9F9',
    border: 'rgba(0, 0, 0, 0.1)',
    text: '#000000',
    textSecondary: '#606060',
    textTertiary: '#999999',
  },
  dark: {
    background: '#1E1E1E',
    backgroundSecondary: '#2C2C2C',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textTertiary: '#666666',
  },
};

const regionColors: Record<string, { bg: string; text: string; border: string }> = {
  '中国': { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
  '美国': { bg: '#DBEAFE', text: '#1E3A8A', border: '#3B82F6' },
  '欧洲': { bg: '#E0E7FF', text: '#312E81', border: '#6366F1' },
  '日本': { bg: '#F3E8FF', text: '#581C87', border: '#A855F7' },
  '韩国': { bg: '#FCE7F3', text: '#831843', border: '#EC4899' },
  '东南亚': { bg: '#DCFCE7', text: '#14532D', border: '#22C55E' },
};

const HolidayTag = ({ holiday, isDarkMode, currentColors }: { holiday: { name: string; region: string; dateObj: Date }; isDarkMode: boolean; currentColors: any }) => {
  const rc = regionColors[holiday.region] || { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' };
  const zhName = translateHoliday(holiday.name);
  return (
    <div
      className="text-xs p-1.5 rounded-md leading-tight"
      style={{
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : rc.bg,
        color: isDarkMode ? currentColors.text : rc.text,
        borderLeft: `3px solid ${rc.border}`,
      }}
    >
      {zhName ? (
        <>
          <div className="font-medium">{zhName}</div>
          <div className="text-[10px] opacity-60">{holiday.name}</div>
        </>
      ) : (
        <div className="font-medium">{holiday.name}</div>
      )}
      <div className="text-[10px] mt-0.5 opacity-50">{holiday.region}</div>
    </div>
  );
};

const MarketingCalendarPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const currentColors = isDarkMode ? COLORS.dark : COLORS.light;

  const initialView = (searchParams.get('view') as 'week' | 'month') || 'week';
  const [viewMode, setViewMode] = useState<'week' | 'month'>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedRegion, setSelectedRegion] = useState<string>('全部');

  const currentYear = currentDate.getFullYear();
  const [dynamicHolidays, setDynamicHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadHolidays = async () => {
      setIsLoading(true);
      try {
        const years = [currentYear - 1, currentYear, currentYear + 1];
        const allHolidays: Holiday[] = [];
        const results = await Promise.all(years.map(y => getAllHolidays(y)));
        results.forEach(h => allHolidays.push(...h));
        setDynamicHolidays(allHolidays);
      } catch (e) {
        console.error('Failed to load holidays:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadHolidays();
  }, [currentYear]);

  const allHolidaysWithDates = useMemo(() => {
    return dynamicHolidays.map(h => ({ ...h, dateObj: parseISO(h.date) }));
  }, [dynamicHolidays]);

  const holidayDates = useMemo(() => allHolidaysWithDates.map(h => h.dateObj), [allHolidaysWithDates]);

  // Navigation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const handlePrev = () => {
    setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
  };
  const handleNext = () => {
    setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
  };
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const regions = ['全部', '中国', '美国', '欧洲', '日本', '韩国', '东南亚'];

  // Week view data
  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const weekHolidaysByDay = useMemo(() => {
    return weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return allHolidaysWithDates.filter(h => format(h.dateObj, 'yyyy-MM-dd') === dayStr && (selectedRegion === '全部' || h.region === selectedRegion));
    });
  }, [weekDays, allHolidaysWithDates, selectedRegion]);

  // Month view - calendar grid data
  const monthGridWeeks = useMemo(() => {
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const weeks: Date[][] = [];
    let current = gridStart;
    while (current <= gridEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(addDays(current, i));
      }
      weeks.push(week);
      current = addDays(current, 7);
    }
    return weeks;
  }, [monthStart, monthEnd]);

  const monthHolidaysByDateStr = useMemo(() => {
    const map: Record<string, typeof allHolidaysWithDates> = {};
    allHolidaysWithDates
      .filter(h => selectedRegion === '全部' || h.region === selectedRegion)
      .forEach(h => {
        const key = format(h.dateObj, 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(h);
      });
    return map;
  }, [allHolidaysWithDates, selectedRegion]);

  // Calendar sidebar holidays
  const holidaysByDateMap = useMemo(() => {
    const map: Record<string, { name: string; region: string }[]> = {};
    dynamicHolidays.forEach(h => {
      if (!map[h.date]) map[h.date] = [];
      map[h.date].push({ name: h.name, region: h.region });
    });
    return map;
  }, [dynamicHolidays]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const holidaysOnSelectedDate = selectedDateStr ? holidaysByDateMap[selectedDateStr] : null;

  const rangeTitle = viewMode === 'week'
    ? `${format(weekStart, 'yyyy年M月d日')} ~ ${format(weekEnd, 'M月d日')} (第${getWeek(currentDate, { weekStartsOn: 1 })}周)`
    : format(currentDate, 'yyyy年M月');

  const dayHeaders = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
      style={{ backgroundColor: currentColors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: currentColors.text }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
            📅 出海营销日历
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main content */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: currentColors.backgroundSecondary, border: `1px solid ${currentColors.border}` }}
          >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div
                className="inline-flex items-center rounded-full p-1 gap-0.5"
                style={{ backgroundColor: isDarkMode ? '#3A3A3A' : '#E8E8E8' }}
              >
                <button
                  onClick={() => setViewMode('week')}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: viewMode === 'week' ? '#00a7f4' : 'transparent',
                    color: viewMode === 'week' ? '#FFFFFF' : currentColors.textSecondary,
                  }}
                >
                  周视图
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: viewMode === 'month' ? '#00a7f4' : 'transparent',
                    color: viewMode === 'month' ? '#FFFFFF' : currentColors.textSecondary,
                  }}
                >
                  月视图
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <ChevronLeft size={18} style={{ color: currentColors.text }} />
                </button>
                <span className="text-sm font-semibold min-w-[200px] text-center" style={{ color: currentColors.text }}>
                  {rangeTitle}
                </span>
                <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <ChevronRight size={18} style={{ color: currentColors.text }} />
                </button>
              </div>

              <button
                onClick={handleToday}
                className="px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: '#00a7f4', color: '#FFFFFF' }}
              >
                今天
              </button>
            </div>

            {/* Region filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {regions.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedRegion === region ? '#00a7f4' : 'transparent',
                    color: selectedRegion === region ? '#FFFFFF' : currentColors.textSecondary,
                    border: `1px solid ${selectedRegion === region ? '#00a7f4' : currentColors.border}`,
                  }}
                >
                  {region}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-20" style={{ color: currentColors.textSecondary }}>加载中...</div>
            ) : viewMode === 'week' ? (
              /* ===== Week View ===== */
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 border-b min-w-[700px] md:min-w-0" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.035)' }}>
                  {weekDays.map(day => (
                    <div
                      key={day.toString()}
                      className="text-center py-3 px-1"
                      style={{
                        borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.035)'}`,
                        backgroundColor: isToday(day) ? (isDarkMode ? 'rgba(0,167,244,0.15)' : 'rgba(0,167,244,0.08)') : 'transparent',
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: isToday(day) ? '#00a7f4' : currentColors.text }}>
                        {format(day, 'eee', { locale: zhCN })}
                      </p>
                      <p className="text-xs" style={{ color: isToday(day) ? '#00a7f4' : currentColors.textSecondary }}>
                        {format(day, 'M/d')}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 min-h-[400px] min-w-[700px] md:min-w-0">
                  {weekDays.map((day, i) => (
                    <div
                      key={day.toString()}
                      className="p-2 space-y-2"
                      style={{
                        borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.035)'}`,
                        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.035)'}`,
                        backgroundColor: isToday(day) ? (isDarkMode ? 'rgba(0,167,244,0.05)' : 'rgba(0,167,244,0.03)') : 'transparent',
                      }}
                    >
                      {weekHolidaysByDay[i].map((holiday, j) => (
                        <HolidayTag key={j} holiday={holiday} isDarkMode={isDarkMode} currentColors={currentColors} />
                      ))}
                      {weekHolidaysByDay[i].length === 0 && (
                        <div className="text-xs text-center pt-4" style={{ color: currentColors.textTertiary }}>-</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ===== Month View - Calendar Grid ===== */
              <div className="overflow-x-auto">
                {/* Day headers */}
                <div className="grid grid-cols-7 min-w-[840px] md:min-w-0" style={{ borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.035)'}` }}>
                  {dayHeaders.map(d => (
                    <div
                      key={d}
                      className="text-center py-2 text-sm font-semibold"
                      style={{ color: currentColors.textSecondary }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid rows */}
                {monthGridWeeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 min-w-[840px] md:min-w-0" style={{ minHeight: '120px' }}>
                    {week.map((day, di) => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const dayHolidays = monthHolidaysByDateStr[dayStr] || [];
                      const inMonth = isSameMonth(day, currentDate);
                      const today = isToday(day);

                      return (
                        <div
                          key={di}
                          className="p-1.5 space-y-1"
                          style={{
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.035)'}`,
                            backgroundColor: today
                              ? (isDarkMode ? 'rgba(0,167,244,0.1)' : 'rgba(0,167,244,0.05)')
                              : !inMonth
                                ? (isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)')
                                : 'transparent',
                            opacity: inMonth ? 1 : 0.5,
                          }}
                        >
                          {/* Date number */}
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"
                              style={{
                                color: today ? '#FFFFFF' : currentColors.text,
                                backgroundColor: today ? '#00a7f4' : 'transparent',
                              }}
                            >
                              {format(day, 'd')}
                            </span>
                          </div>
                          {/* Holiday tags */}
                          {(expandedDates.has(dayStr) ? dayHolidays : dayHolidays.slice(0, 3)).map((holiday, j) => (
                            <HolidayTag key={j} holiday={holiday} isDarkMode={isDarkMode} currentColors={currentColors} />
                          ))}
                          {dayHolidays.length > 3 && (
                            <button
                              className="text-[10px] text-center w-full cursor-pointer hover:opacity-70 transition-opacity"
                              style={{ color: '#00a7f4' }}
                              onClick={() => {
                                setExpandedDates(prev => {
                                  const next = new Set(prev);
                                  if (next.has(dayStr)) {
                                    next.delete(dayStr);
                                  } else {
                                    next.add(dayStr);
                                  }
                                  return next;
                                });
                              }}
                            >
                              {expandedDates.has(dayStr) ? '收起' : `+${dayHolidays.length - 3} 更多`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar - mini calendar */}
          <aside className="hidden lg:block">
            <div
              className="rounded-xl p-5 sticky top-[120px]"
              style={{ backgroundColor: currentColors.backgroundSecondary, border: `1px solid ${currentColors.border}` }}
            >
              <style>{`
                .cal-holiday-date {
                  position: relative;
                  color: #00a7f4 !important;
                }
                .cal-holiday-date[aria-selected="true"],
                .cal-holiday-date.today-marker {
                  color: white !important;
                }
                .cal-holiday-date::after {
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
                .cal-holiday-date[aria-selected="true"]::after,
                .cal-holiday-date.today-marker::after {
                  background-color: white;
                }
              `}</style>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setCurrentDate(date);
                }}
                month={currentDate}
                onMonthChange={setCurrentDate}
                className="p-0"
                locale={zhCN}
                modifiers={{ holiday: holidayDates }}
                modifiersClassNames={{ holiday: 'cal-holiday-date' }}
                classNames={{
                  day_selected: 'bg-[#00a7f4] text-white hover:bg-[#0090d4] focus:bg-[#00a7f4] focus:text-white',
                  day_today: 'bg-[#00a7f4] text-white today-marker',
                }}
                footer={
                  selectedDate && holidaysOnSelectedDate ? (
                    <div className="text-sm mt-2 pt-2 border-t text-center">
                      <p className="font-bold mb-1" style={{ color: currentColors.text }}>
                        {format(selectedDate, 'M月d日', { locale: zhCN })}
                      </p>
                      <ul className="space-y-1">
                        {holidaysOnSelectedDate.map((h, i) => {
                          const zh = translateHoliday(h.name);
                          return (
                            <li key={i} className="font-medium" style={{ color: currentColors.text }}>
                              {zh ? `${zh}` : h.name}
                              {zh && <span className="text-[10px] opacity-50 ml-1">({h.name})</span>}
                              <span className="text-xs opacity-50 ml-1">{h.region}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null
                }
              />

              {/* Region legend */}
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${currentColors.border}` }}>
                <h4 className="text-xs font-semibold mb-2" style={{ color: currentColors.textSecondary }}>地区图例</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(regionColors).map(([region, colors]) => (
                    <div
                      key={region}
                      className="flex items-center gap-1.5 text-xs cursor-pointer rounded-full px-2 py-1 transition-all"
                      style={{
                        backgroundColor: selectedRegion === region ? colors.bg : 'transparent',
                        border: `1px solid ${selectedRegion === region ? colors.border : 'transparent'}`,
                      }}
                      onClick={() => setSelectedRegion(selectedRegion === region ? '全部' : region)}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.border }} />
                      <span style={{ color: currentColors.text }}>{region}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 推荐工具 - 出海日历日期下方 */}
            <div className="mt-4">
              <RecommendedToolsCard isDarkMode={isDarkMode} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MarketingCalendarPage;
