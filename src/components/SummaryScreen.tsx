import React, { useState } from 'react';
import { ConsultationHistoryList, ConsultationHistory } from './ConsultationHistoryList';
import { CareLogo } from './CareLogo';
import { backendApi } from '../api';

interface FactCheck {
  factcheck_no: number;
  consultation_no: number;
  customer_no: number;
  severity: string;
  detected_statement: string;
  correction_suggestion: string;
  related_law: string;
  created_at: string;
}

interface SummaryScreenProps {
  onNewConsultation: () => void;
  onBackToMain: () => void;
}

export function SummaryScreen({ onNewConsultation, onBackToMain }: SummaryScreenProps) {
  console.log('SummaryScreen 렌더링됨');
  
  const [selectedHistory, setSelectedHistory] = useState<ConsultationHistory | null>(null);
  const [factChecks, setFactChecks] = useState<FactCheck[]>([]);
  const [factChecksLoading, setFactChecksLoading] = useState(false);


  const handleNewConsultation = () => {
    setSelectedHistory(null);
    setFactChecks([]);
    onNewConsultation();
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-[92px] bg-white border-b-2 border-[#001e5a] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <CareLogo size="md" color="blue" onClick={onBackToMain} />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onBackToMain}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            메인 메뉴
          </button>
          <button
            onClick={handleNewConsultation}
            className="px-6 py-3 bg-gradient-to-r from-[#d50982] to-[#ff383c] text-white rounded-2xl hover:opacity-90 transition-opacity"
          >
            새 상담
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Consultation History */}
        <div className="w-[360px] bg-[#001e5a] p-8 flex items-center justify-center">
          <ConsultationHistoryList 
            onSelectHistory={handleSelectHistory}
          />
        </div>

        {/* Right Content - Care Report (전체 높이 사용) */}
        <div className="flex-1 p-8">
          <div className="h-full bg-white border-2 border-[#242760] rounded-2xl flex flex-col">
            {/* Header */}
            <div className="bg-[#242760] text-white py-5 px-8 flex items-center justify-center flex-shrink-0">
              <h1 className="text-3xl text-center">C.A.R.E REPORT</h1>
            </div>

            {/* Content - 스크롤 가능 */}
            <div className="flex-1 overflow-y-auto p-8">
              {!selectedHistory ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 text-4xl mb-4">📋</div>
                    <div className="text-gray-500 text-lg">상담 내역을 선택하세요</div>
                    <div className="text-gray-400 text-sm mt-2">왼쪽에서 상담 내역을 클릭하면 팩트체크 리포트가 표시됩니다</div>
                  </div>
                </div>
              ) : factChecksLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#242760] mx-auto mb-4"></div>
                    <div className="text-gray-500 text-sm">팩트체크를 불러오는 중...</div>
                  </div>
                </div>
              ) : factChecks.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-green-400 text-4xl mb-4">✅</div>
                    <div className="text-gray-500 text-lg">완벽한 상담!</div>
                    <div className="text-gray-400 text-sm mt-2">이 상담에서는 개선 포인트가 발견되지 않았습니다</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 팩트체크 요약 */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">상담 요약</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {factChecks.filter(fc => fc.severity === '심각').length}
                        </div>
                        <div className="text-sm text-gray-600">심각</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {factChecks.filter(fc => fc.severity === '경고').length}
                        </div>
                        <div className="text-sm text-gray-600">경고</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {factChecks.filter(fc => fc.severity === '정보').length}
                        </div>
                        <div className="text-sm text-gray-600">정보</div>
                      </div>
                    </div>
                  </div>

                  {/* 팩트체크 목록 */}
                  <div className="space-y-4">
                    {factChecks.map((factCheck, index) => (
                      <div key={factCheck.factcheck_no} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              factCheck.severity === '심각' ? 'bg-red-100 text-red-800' :
                              factCheck.severity === '경고' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {factCheck.severity}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(factCheck.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">🚨 감지된 문구</h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-800 font-medium">
                                "{factCheck.detected_statement}"
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">💡 수정 제안</h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                {factCheck.correction_suggestion}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">⚖️ 관련 법령</h4>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <p className="text-xs text-gray-700">
                                {factCheck.related_law}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-5 bg-[#d50982]" />
    </div>
  );
}
