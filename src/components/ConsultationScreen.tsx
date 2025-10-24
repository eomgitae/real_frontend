import { useState, useEffect } from 'react';
import { ConversationPanel } from './ConversationPanel';
import { CustomerInfoPanel } from './CustomerInfoPanel';
import { TopHeader } from './TopHeader';
import { SessionStatusBar } from './SessionStatusBar';
import { ActionButton } from './ActionButton';
import { FeedbackPopup } from './FeedbackPopup';

interface Message {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: Date;
  hasFeedback?: boolean;
  feedbackId?: string;
}

interface Feedback {
  id: string;
  messageId: string;
  type: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  regulation: string;
  suggestion: string;
  timestamp: Date;
  originalText?: string;
}

interface ConsultationScreenProps {
  customerName: string;
  phoneNumber: string;
  onEndConsultation?: (feedbacks: Feedback[]) => void;
  onBackToMain?: () => void;
}

export function ConsultationScreen({ customerName, phoneNumber, onEndConsultation, onBackToMain }: ConsultationScreenProps) {
  console.log('ConsultationScreen 렌더링됨:', { customerName, phoneNumber });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePopup, setActivePopup] = useState<{
    type: 'high' | 'medium';
    category: string;
    id: string;
  } | null>(null);
  const [sessionInfo] = useState({
    sessionId: 'A1234B56',
    agentName: '김민지',
    agentId: 'A-1234',
  });
  const [customerInfo] = useState({
    name: customerName,
    phoneNumber: phoneNumber,
    age: 33,
    investmentExperience: 'beginner' as const,
    riskTolerance: 'conservative' as const,
    financialStatus: '안정적 (정기 소득 있음)',
    investmentPurpose: '노후 자금 마련',
    customerGrade: 'VIP',
  });

  // 시뮬레이션을 위한 샘플 대화 데이터
  const sampleConversations = [
    { speaker: 'agent' as const, text: `안녕하세요, ${customerName} 고객님. 오늘은 어떤 상담을 도와드릴까요?`, delay: 1000 },
    { speaker: 'customer' as const, text: '안녕하세요. 노후 대비를 위한 안정적인 상품을 찾고 있어요.', delay: 3000 },
    { speaker: 'agent' as const, text: '고객님 투자 성향 분석 결과, 안정형으로 분류되어 계시네요. 우리 은행의 "안심 연금저축보험"을 추천드립니다. 매월 납입금액은 32,000원이고 만기 시 원금 보장에 연 4.5% 수익률이 적용됩니다.', delay: 5000, feedback: {
      type: 'high' as const,
      category: '상품 정보 오안내',
      description: '납입금액 오류 감지! 상품 안내자료에는 월 37,000원으로 명시되어 있으나 32,000원으로 잘못 안내하였습니다.',
      regulation: '금융소비자보호법 제19조 (설명의무 위반)',
      suggestion: '"죄송합니다, 제가 잘못 안내드렸습니다. 정확한 월 납입금액은 37,000원입니다."',
    }},
    { speaker: 'agent' as const, text: '아, 죄송합니다. 제가 금액을 잘못 말씀드렸네요. 정확한 월 납입금액은 37,000원입니다.', delay: 7000 },
    { speaker: 'customer' as const, text: '아, 그렇군요. 그런데 수익률이 확정인가요?', delay: 9000 },
    { speaker: 'agent' as const, text: '네, 이 상품은 확정금리 상품이라 안심하셔도 됩니다. 최소 3%는 보장되고 시장 금리가 좋으면 더 받으실 수도 있습니다.', delay: 11000, feedback: {
      type: 'high' as const,
      category: '수익률 단정적 판단',
      description: '"확정금리", "안심하셔도 됩니다", "더 받으실 수도" 등의 단정적 표현을 사용하였습니다.',
      regulation: '자본시장법 제49조 (부당권유 금지), 금융소비자보호법 제21조',
      suggestion: '"이 상품은 최저 보증이율 3%가 적용되며, 공시이율에 따라 변동될 수 있습니다. 시장 상황에 따라 수익률이 달라질 수 있으니 약관을 꼭 확인해 주세요."',
    }},
    { speaker: 'agent' as const, text: '정확히 말씀드리면, 이 상품은 최저 보증이율 3%가 적용되며 공시이율에 따라 변동될 수 있습니다. 시장 상황에 따라 달라질 수 있으니 상품설명서를 꼭 확인해 주세요.', delay: 13000 },
    { speaker: 'customer' as const, text: '알겠습니다. 그럼 지금 가입하면 특별한 혜택이 있나요?', delay: 15000 },
    { speaker: 'agent' as const, text: '오늘까지만 가입하시면 첫 3개월 납입액 면제 이벤트가 있습니다. 내일부터는 혜택이 없어요.', delay: 17000, feedback: {
      type: 'medium' as const,
      category: '시간압박성 권유',
      description: '"오늘까지만", "내일부터는 혜택이 없어요" 등 시간 압박을 주는 표현을 사용하였습니다.',
      regulation: '금융소비자보호법 제21조 제1항 (부당권유행위 금지)',
      suggestion: '"현재 진행 중인 이벤트는 12월 31일까지입니다. 충분히 검토하신 후 가입 여부를 결정하시면 됩니다."',
    }},
    { speaker: 'agent' as const, text: '현재 진행 중인 이벤트는 12월 31일까지입니다. 천천히 검토하신 후에 결정하시면 됩니다.', delay: 19000 },
    { speaker: 'customer' as const, text: '네, 알겠습니다. 그럼 현재 가입한 정기예금을 해지하고 이걸로 갈아타려고 하는데요.', delay: 21000 },
    { speaker: 'agent' as const, text: '좋습니다. 바로 해지 처리해드리겠습니다.', delay: 23000, feedback: {
      type: 'high' as const,
      category: '중도해지 불이익 미고지',
      description: '기존 상품 해지 시 발생하는 불이익(이자 손실, 수수료 등)에 대한 안내가 누락되었습니다.',
      regulation: '금융소비자보호법 제19조 (설명의무), 제21조 (부당권유행위 금지)',
      suggestion: '"현재 보유하신 정기예금을 중도 해지하시면 약정 이자의 50%만 지급되며, 중도해지 수수료가 발생할 수 있습니다. 만기일 확인 후 결정하시는 것을 권장드립니다."',
    }},
    { speaker: 'agent' as const, text: '잠깐만요, 중요한 사항을 말씀드려야겠습니다. 현재 보유하신 정기예금을 중도 해지하시면 약정 이자의 50%만 지급되고 중도해지 수수료도 발생합니다. 만기일이 언제인지 먼저 확인해보시는 게 좋을 것 같습니다.', delay: 25000 },
    { speaker: 'customer' as const, text: '아, 그런 불이익이 있는지 몰랐네요. 만기일 확인하고 다시 연락드릴게요.', delay: 27000 },
    { speaker: 'agent' as const, text: '네, 고객님. 충분히 검토하시고 궁금한 점 있으시면 언제든지 연락 주세요. 감사합니다.', delay: 29000 },
  ];

  useEffect(() => {
    if (isRecording) {
      let index = 0;
      const addMessage = () => {
        if (index < sampleConversations.length) {
          const conv = sampleConversations[index];
          const messageId = `msg-${Date.now()}-${index}`;
          
          const newMessage: Message = {
            id: messageId,
            speaker: conv.speaker,
            text: conv.text,
            timestamp: new Date(),
          };

          if (conv.feedback) {
            const feedbackId = `fb-${Date.now()}-${index}`;
            newMessage.hasFeedback = true;
            newMessage.feedbackId = feedbackId;

            const newFeedback: Feedback = {
              id: feedbackId,
              messageId: messageId,
              ...conv.feedback,
              originalText: conv.text, // 원본 텍스트 저장
              timestamp: new Date(),
            };

            setTimeout(() => {
              setFeedbacks(prev => [...prev, newFeedback]);
              
              // 커스텀 팝업 표시
              if (conv.feedback?.type === 'high' || conv.feedback?.type === 'medium') {
                setActivePopup({
                  type: conv.feedback.type,
                  category: conv.feedback.category,
                  id: feedbackId
                });
              }
            }, 500);
          }

          setMessages(prev => [...prev, newMessage]);
          index++;

          if (index < sampleConversations.length) {
            setTimeout(addMessage, sampleConversations[index].delay - sampleConversations[index - 1].delay);
          }
        }
      };

      setTimeout(addMessage, sampleConversations[0].delay);
    }
  }, [isRecording]);

  const handleStartStop = () => {
    if (isRecording) {
      // 상담 종료 - feedbacks를 상위로 전달
      if (onEndConsultation) {
        onEndConsultation(feedbacks);
      }
    } else {
      // 상담 시작
      setMessages([]);
      setFeedbacks([]);
      setActivePopup(null); // 팝업도 초기화
    }
    setIsRecording(!isRecording);
  };

  const handleClosePopup = () => {
    setActivePopup(null);
  };

  const handleViewHistory = () => {
    console.log('상담 내역 조회 버튼 클릭됨');
    if (onBackToMain) {
      onBackToMain();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header - Fixed */}
      <TopHeader 
        isRecording={isRecording}
        onViewHistory={handleViewHistory}
        onStartStop={handleStartStop}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onBackToMain={() => {
          console.log('Care 로고 클릭 - 메인 메뉴로 이동');
          if (onBackToMain) {
            onBackToMain();
          }
        }}
      />

      {/* Main Layout - Below Header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <div className="w-[300px] bg-[#001e5a] relative flex flex-col">
            {/* Customer Info Panel */}
            <div className="flex-1 overflow-y-auto pb-16 pt-4">
              <CustomerInfoPanel customerInfo={customerInfo} />
            </div>

            {/* STT Status Bar */}
            <SessionStatusBar sessionId={sessionInfo.sessionId} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 p-4 overflow-hidden">
            {/* Chat Area */}
            <ConversationPanel 
              messages={messages} 
              isRecording={isRecording}
              feedbacks={feedbacks}
            />
          </div>
        </div>
      </div>

      {/* 커스텀 팝업 */}
      {activePopup && (
        <FeedbackPopup
          type={activePopup.type}
          category={activePopup.category}
          onClose={handleClosePopup}
          autoCloseDelay={5000}
        />
      )}
    </div>
  );
}
