import { useState, useEffect } from 'react';
import { ConsultationHistoryList } from './ConsultationHistoryList';
import { CareLogo } from './CareLogo';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Database } from 'lucide-react';
import { backendApi } from '../api';

interface ConsultationHistoryScreenProps {
  onBackToMain: () => void;
}

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

export function ConsultationHistoryScreen({ onBackToMain }: ConsultationHistoryScreenProps) {
  console.log('ConsultationHistoryScreen 렌더링됨');
  
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [factChecks, setFactChecks] = useState<FactCheck[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [factChecksLoading, setFactChecksLoading] = useState(false);

  const handleSelectHistory = async (history: any) => {
    console.log('상담 내역 선택:', history);
    setSelectedHistory(history);
    
    // 선택된 상담의 팩트체크 가져오기
    try {
      setFactChecksLoading(true);
      const consultationNo = parseInt(history.id);
      console.log('팩트체크 조회 - 상담 번호:', consultationNo);
      
      const factChecksData = await backendApi.getFactChecks(consultationNo);
      console.log('가져온 팩트체크:', factChecksData);
      
      setFactChecks(factChecksData || []);
    } catch (error) {
      console.error('팩트체크 조회 실패:', error);
      setFactChecks([]);
    } finally {
      setFactChecksLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // 데이터 새로고침 로직
      setRefreshTrigger(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 지연
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      console.log('백엔드 연결 테스트 시작...');
      const result = await backendApi.testSupabaseConnection();
      console.log('백엔드 Supabase 연결 테스트 결과:', result);
      
      let message = `백엔드 Supabase 연결 상태: ${result.status}\n메시지: ${result.message}`;
      if (result.consultations_count !== undefined) {
        message += `\n상담 내역 수: ${result.consultations_count}`;
      }
      if (result.sample_data) {
        message += `\n샘플 데이터: ${JSON.stringify(result.sample_data, null, 2)}`;
      }
      
      alert(message);
    } catch (error) {
      console.error('백엔드 Supabase 연결 테스트 실패:', error);
      alert(`백엔드 Supabase 연결 테스트에 실패했습니다.\n오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestData = async () => {
    setLoading(true);
    try {
      console.log('테스트 데이터 생성 시작...');
      const result = await backendApi.createTestData();
      console.log('테스트 데이터 생성 결과:', result);
      
      let message = `테스트 데이터 생성 상태: ${result.status}\n메시지: ${result.message}`;
      if (result.customer) {
        message += `\n생성된 고객: ${result.customer.customer_name}`;
      }
      if (result.consultation) {
        message += `\n생성된 상담: ${result.consultation.topic}`;
      }
      
      alert(message);
      // 데이터 새로고침
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('테스트 데이터 생성 실패:', error);
      alert(`테스트 데이터 생성에 실패했습니다.\n오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
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
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-[#d50982] to-[#ff383c] text-white rounded-2xl hover:opacity-90 transition-opacity"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-h-[calc(100vh-140px)]">
        {/* Left Sidebar - Consultation History */}
        <div className="w-[320px] bg-[#001e5a] p-6 flex items-center justify-center">
          <ConsultationHistoryList 
            onSelectHistory={handleSelectHistory}
            key={refreshTrigger}
          />
        </div>

        {/* Right Content - Care Report (전체 높이 사용) */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white border-2 border-[#242760] rounded-2xl flex flex-col">
            {/* Header */}
            <div className="bg-[#242760] text-white py-3 px-4 flex items-center justify-center flex-shrink-0">
              <h1 className="text-xl text-center">C.A.R.E REPORT</h1>
            </div>
            
            {/* 내용 영역 - 스크롤 가능 */}
            <div 
              className="flex-1 overflow-y-auto p-2 custom-scrollbar"
              style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#4B5563 #F3F4F6'
              }}
            >
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
                <div className="space-y-3">
                  {/* 팩트체크 요약 */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">상담 요약</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          {factChecks.filter(fc => fc.severity === '심각').length}
                        </div>
                        <div className="text-xs text-gray-600">중요</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">
                          {factChecks.filter(fc => fc.severity === '경고').length}
                        </div>
                        <div className="text-xs text-gray-600">경고</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {factChecks.filter(fc => fc.severity === '정보').length}
                        </div>
                        <div className="text-xs text-gray-600">적정</div>
                      </div>
                    </div>
                  </div>

                  {/* 팩트체크 목록 */}
                  <div className="space-y-2">
                    {factChecks.map((factCheck, index) => (
                      <div key={factCheck.factcheck_no} className="border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                        
                        <div className="space-y-1">
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-0.5">🚨 감지된 문구</h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-1.5">
                              <p className="text-xs text-red-800 font-medium">
                                "{factCheck.detected_statement}"
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-0.5">💡 수정 제안</h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5">
                              <p className="text-xs text-blue-800">
                                {factCheck.correction_suggestion}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-0.5">⚖️ 관련 법령</h4>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
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

    </div>
  );
}
