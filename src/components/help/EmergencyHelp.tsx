'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, X, Info } from 'lucide-react';

const hotlines = [
  { name: '全国心理援助热线', number: '400-161-9995', desc: '24小时服务' },
  { name: '希望24热线', number: '400-161-9995', desc: '生命教育与危机干预' },
  { name: '北京心理危机研究与干预中心', number: '010-8295-1332', desc: '24小时服务' },
];

export function EmergencyHelp() {
  const [showModal, setShowModal] = useState(false);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="w-full bg-red-500 hover:bg-red-600 text-white transition-all hover-lift animate-pulse-soft"
      >
        <AlertTriangle className="w-5 h-5 mr-2" />
        紧急求助
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-6 w-full max-w-sm animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-bold">心理援助热线</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-700">
                  如果你正经历困难或危机，请不要犹豫，立即拨打以下热线寻求专业帮助。
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {hotlines.map((hotline, index) => (
                <div
                  key={index}
                  className="bg-secondary/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{hotline.name}</p>
                    <p className="text-sm text-muted-foreground">{hotline.desc}</p>
                  </div>
                  <Button onClick={() => handleCall(hotline.number)}>
                    <Phone className="w-4 h-4 mr-1" />
                    拨打
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowModal(false)}
            >
              我知道了
            </Button>
          </div>
        </div>
      )}
    </>
  );
}