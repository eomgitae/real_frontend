import { CareLogo } from './CareLogo';
import { Button } from './ui/button';
import { UserPlus, History, Settings } from 'lucide-react';

interface MainMenuProps {
  onStartConsultation: () => void;
  onViewHistory: () => void;
  onConnectionTest: () => void;
}

export function MainMenu({ onStartConsultation, onViewHistory, onConnectionTest }: MainMenuProps) {
  console.log('MainMenu 렌더링됨');

  const handleStartClick = () => {
    console.log('고객 정보 입력 버튼 클릭됨');
    onStartConsultation();
  };

  const handleHistoryClick = () => {
    console.log('상담내역 조회 버튼 클릭됨');
    onViewHistory();
  };

  const handleTestClick = () => {
    console.log('연결 테스트 버튼 클릭됨');
    onConnectionTest();
  };
  return (
    <div className="min-h-screen bg-[#001e5a] relative flex flex-col items-center justify-center">
      {/* Logo - 메뉴 선택 박스 위에 위치 */}
      <div className="mb-8">
        <CareLogo size="lg" color="white" />
      </div>

      {/* Main Menu Card */}
      <div className="w-full max-w-lg mx-4">
        <div className="bg-white rounded-t-[160px] pt-20 pb-12 px-12 shadow-2xl">
          <h2 className="text-[#001e5a] text-2xl text-center mb-12 font-semibold">
            메뉴를 선택하세요
          </h2>

          <div className="space-y-6">
            {/* 고객 정보 입력 */}
            <Button
              onClick={handleStartClick}
              className="w-full h-14 rounded-[25px] text-white transition-all hover:opacity-90 flex items-center justify-center gap-3"
              style={{ 
                background: 'linear-gradient(90deg, rgb(227, 5, 128) 0%, rgb(227, 5, 128) 100%)',
                fontWeight: 600
              }}
            >
              <UserPlus className="w-6 h-6" />
              <span className="text-lg">고객 정보 입력</span>
            </Button>

            {/* 상담내역 조회 */}
            <Button
              onClick={handleHistoryClick}
              variant="outline"
              className="w-full h-14 rounded-[25px] border-2 border-[#001e5a] text-[#001e5a] hover:bg-[#001e5a] hover:text-white transition-all flex items-center justify-center gap-3"
              style={{ fontWeight: 600 }}
            >
              <History className="w-6 h-6" />
              <span className="text-lg">상담내역 조회</span>
            </Button>

            {/* 연결 테스트 */}
            <Button
              onClick={handleTestClick}
              variant="ghost"
              className="w-full h-12 rounded-[25px] text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
            >
              <Settings className="w-5 h-5" />
              <span>연결 테스트</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
