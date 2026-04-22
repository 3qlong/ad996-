
import React, { useState } from 'react';
import Header from '@/components/Header';
import MarketingCalendarView from '@/components/MarketingCalendarView';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { zhCN } from 'date-fns/locale';

const MarketingCalendarPage = () => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setCurrentDate(date);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <div className="sticky top-0 z-10 shadow-sm bg-gradient-to-b from-white to-white/80 backdrop-blur-sm">
                 <Header />
                 <div className="container mx-auto py-2">
                    <Button asChild variant="link">
                        <Link to="/">&larr; 返回首页</Link>
                    </Button>
                 </div>
            </div>
            <main className="container mx-auto py-4 md:py-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] md:gap-8">
                    <div>
                        <MarketingCalendarView currentDate={currentDate} setCurrentDate={setCurrentDate} />
                    </div>
                    <div className="hidden md:block">
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={handleDateSelect}
                            className="rounded-lg border shadow-sm bg-white"
                            locale={zhCN}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
};

export default MarketingCalendarPage;
