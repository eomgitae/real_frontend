import { useState, useEffect } from 'react';
import { ConsultationHistoryList } from './ConsultationHistoryList';
import { CareLogo } from './CareLogo';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Database } from 'lucide-react';
import { backendApi } from '../api';

interface ConsultationHistoryScreenProps {
  onBackToMain: () => void;
  customerName?: string;
  phoneNumber?: string;
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

export function ConsultationHistoryScreen({ onBackToMain, customerName, phoneNumber }: ConsultationHistoryScreenProps) {
  console.log('ConsultationHistoryScreen 렌더링됨');
  
  try {
    const [selectedHistory, setSelectedHistory] = useState<any>(null);
    const [factChecks, setFactChecks] = useState<FactCheck[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [factChecksLoading, setFactChecksLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

  const handleSelectHistory = async (history: any) => {
    try {
      console.log('=== 상담 내역 선택 시작 ===');
      console.log('선택된 상담 내역:', history);
      
      if (!history || !history.id) {
        console.error('잘못된 상담 내역 데이터:', history);
        setHasError(true);
        return;
      }
      
      
      setSelectedHistory(history);
      setHasError(false); // 오류 상태 초기화
      
      // 선택된 상담의 팩트체크 가져오기
      setFactChecksLoading(true);
      const consultationNo = parseInt(history.id);
      console.log('팩트체크 조회 - 상담 번호:', consultationNo);
      
      if (isNaN(consultationNo)) {
        console.error('잘못된 상담 번호:', history.id);
        setHasError(true);
        return;
      }
      
      const factChecksData = await backendApi.getFactChecks(consultationNo);
      console.log('가져온 팩트체크:', factChecksData);
      
      // 테스트용: 팩트체크가 없으면 목업 데이터 추가
      if (!factChecksData || factChecksData.length === 0) {
        console.log('실제 팩트체크가 없으므로 테스트용 목업 데이터를 추가합니다.');
        const mockFactChecks = [
          {
            factcheck_no: 1,
            consultation_no: consultationNo,
            customer_no: 1,
            severity: '심각',
            detected_statement: '테스트 감지된 문구입니다.',
            correction_suggestion: '테스트 수정 제안입니다.',
            related_law: '테스트 관련 법령입니다.',
            created_at: new Date().toISOString()
          },
          {
            factcheck_no: 2,
            consultation_no: consultationNo,
            customer_no: 1,
            severity: '경고',
            detected_statement: '테스트 경고 문구입니다.',
            correction_suggestion: '테스트 경고 수정 제안입니다.',
            related_law: '테스트 경고 관련 법령입니다.',
            created_at: new Date().toISOString()
          }
        ];
        console.log('목업 팩트체크 데이터:', mockFactChecks);
        setFactChecks(mockFactChecks);
      } else {
        setFactChecks(factChecksData || []);
      }
      
      console.log('=== 상담 내역 선택 완료 ===');
    } catch (error) {
      console.error('상담 내역 선택 중 오류 발생:', error);
      setFactChecksLoading(false);
      setFactChecks([]);
      setHasError(true);
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
      {/* 오류 상태 처리 */}
      {hasError && (
        <div className="fixed inset-0 bg-red-50 flex items-center justify-center z-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border-2 border-red-200">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-700 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-4">상담 내역을 처리하는 중 문제가 발생했습니다.</p>
            <button
              onClick={() => {
                setHasError(false);
                setSelectedHistory(null);
                setFactChecks([]);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
      
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
            className="px-6 py-3 text-white rounded-2xl hover:opacity-90 transition-opacity"
            style={{ background: 'rgb(227, 5, 128)' }}
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Consultation History */}
        <div className="w-[360px] bg-[#001e5a] p-8 flex items-center justify-center">
          <ConsultationHistoryList 
            onSelectHistory={handleSelectHistory}
            key={refreshTrigger}
            initialSearchQuery={customerName || ''}
          />
        </div>

        {/* Right Content - Care Report (전체 높이 사용) */}
        <div className="flex-1 p-8">
          <div className="h-full bg-white border-2 border-[#242760] rounded-2xl flex flex-col">
            {/* Header */}
            <div className="bg-[#242760] text-white py-5 px-8 flex items-center justify-center flex-shrink-0">
              <div className="text-center">
                <h1 className="text-3xl mb-2">CARE REPORT</h1>
              </div>
            </div>
            
            {/* Content - 스크롤 가능 */}
            <div className="flex-1 overflow-y-auto p-8">
              {(() => {
                try {
                  console.log('렌더링 조건 확인:', { 
                    selectedHistory: selectedHistory ? '있음' : '없음', 
                    factChecksLoading, 
                    factChecksLength: factChecks?.length || 0,
                    hasError 
                  });
                  
                  // 오류 상태가 있으면 오류 메시지 표시
                  if (hasError) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-red-400 text-4xl mb-4">⚠️</div>
                          <div className="text-gray-500 text-lg">오류가 발생했습니다</div>
                          <div className="text-gray-400 text-sm mt-2">페이지를 새로고침하거나 다시 시도해주세요</div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (!selectedHistory) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-gray-400 text-4xl mb-4">📋</div>
                          <div className="text-gray-500 text-lg">상담 내역을 선택하세요</div>
                          <div className="text-gray-400 text-sm mt-2">왼쪽에서 상담 내역을 클릭하면 팩트체크 리포트가 표시됩니다</div>
                          <div className="text-gray-400 text-xs mt-4">
                            검색창에서 고객명이나 전화번호로 검색할 수 있습니다
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (factChecksLoading) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#242760] mx-auto mb-4"></div>
                          <div className="text-gray-500 text-sm">팩트체크를 불러오는 중...</div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (!factChecks || factChecks.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-green-400 text-4xl mb-4">✅</div>
                          <div className="text-gray-500 text-lg">완벽한 상담!</div>
                          <div className="text-gray-400 text-sm mt-2">이 상담에서는 개선 포인트가 발견되지 않았습니다</div>
                          <div className="text-gray-400 text-xs mt-4">
                            상담 번호: {selectedHistory?.id} | 고객: {selectedHistory?.customerName}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                <div className="space-y-4">
                  {/* 선택된 상담 정보 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">선택된 상담</h3>
                    <div className="text-sm text-blue-800">
                      <div>고객명: {selectedHistory?.customerName}</div>
                      <div>전화번호: {selectedHistory?.phoneNumber}</div>
                      <div>상담일시: {selectedHistory?.timestamp.toLocaleString('ko-KR')}</div>
                    </div>
                  </div>

                  {/* 팩트체크 요약 */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">팩트체크 요약</h3>
                    <div className="flex justify-between items-center">
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-red-600">
                          {factChecks.filter(fc => fc.severity === '심각').length}
                        </div>
                        <div className="text-sm text-gray-600">심각</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold" style={{ color: '#001e5a' }}>
                          {factChecks.filter(fc => fc.severity === '경고').length}
                        </div>
                        <div className="text-sm text-gray-600">경고</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-black">
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
                );
                } catch (error) {
                  console.error('렌더링 오류:', error);
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-red-400 text-4xl mb-4">⚠️</div>
                        <div className="text-gray-500 text-lg">렌더링 오류가 발생했습니다</div>
                        <div className="text-gray-400 text-sm mt-2">페이지를 새로고침해주세요</div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
  } catch (error) {
    console.error('ConsultationHistoryScreen 렌더링 오류:', error);
    return (
      <div className="h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border-2 border-red-200">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">컴포넌트 오류</h2>
          <p className="text-gray-600 mb-4">상담 내역 화면을 로드하는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }
}
