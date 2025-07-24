import { useState, useEffect } from 'react';
import { FaTint, FaRunning, FaWeight, FaTooth, FaChild, FaUserPlus, FaTrash } from 'react-icons/fa';
import './App.css';

const ICON_MAP: Record<string, any> = {
  FaTint: FaTint,
  FaChild: FaChild,
  FaTooth: FaTooth,
  FaRunning: FaRunning,
  FaWeight: FaWeight,
  FaUserPlus: FaUserPlus,
};

const DEFAULT_CHECKLIST_ITEMS = [
  { key: 'water', label: '물 마시기', iconName: 'FaTint', color: '#4e8cff', type: 'default' },
  { key: 'stretch', label: '스트레칭', iconName: 'FaChild', color: '#6fcf97', type: 'default' },
  { key: 'floss', label: '치실', iconName: 'FaTooth', color: '#56ccf2', type: 'default' },
  { key: 'run', label: '러닝', iconName: 'FaRunning', color: '#f2994a', type: 'default' },
  { key: 'weight', label: '체중 기록', iconName: 'FaWeight', color: '#9b51e0', type: 'default' },
];

const pageList = [
  { key: 'checklist', label: '체크리스트' },
  { key: 'diet', label: '식단 기록' },
  { key: 'exercise', label: '운동 기록' },
  { key: 'diary', label: '일기' },
  { key: 'stats', label: '통계' },
];

const ENCOURAGE_MESSAGES = [
  '오늘도 수고했어요! 🌟',
  '멋진 하루를 기록했네요! 👍',
  '당신의 하루를 응원합니다 💪',
  '일기 쓰기, 정말 멋져요 😊',
  '내일도 힘내요! 🌈',
  '작은 기록이 큰 힘이 됩니다!',
  '오늘의 감정도 소중해요 💖',
];

const ENCOURAGE_MESSAGE = '잘하고 있어! 너는 점점 더 멋있는 사람이 되어가고 있어';

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
function getMonthStr(date: Date) {
  return date.toISOString().slice(0, 7); // yyyy-mm
}

// localStorage helpers
const STORAGE_KEY = 'daily-record-v1';
const CHECKLIST_KEY = 'checklist-items-v1';
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveData(data: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadChecklistItems() {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some(item => !item.iconName)) {
      localStorage.removeItem(CHECKLIST_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(CHECKLIST_KEY);
    return null;
  }
}
function saveChecklistItems(items: any) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));
}

function getIcon(iconName: string, color: string) {
  const IconComp = ICON_MAP[iconName] || FaUserPlus;
  return <IconComp color={color} />;
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [page, setPage] = useState(0);
  // 날짜별 데이터: { [date]: { checked, diet, exercise, diary } }
  const [allData, setAllData] = useState<any>({});
  // 체크리스트 항목 목록(기본+사용자 추가)
  const [checklistItems, setChecklistItems] = useState<any[]>(DEFAULT_CHECKLIST_ITEMS);
  // 체크리스트 항목 추가 입력
  const [newItemLabel, setNewItemLabel] = useState('');

  const todayStr = formatDate(currentDate);
  const monthStr = getMonthStr(currentDate);

  // 현재 날짜 데이터 추출
  const checked = allData[todayStr]?.checked || {};
  const savedDiet = allData[todayStr]?.diet || '';
  const savedExercise = allData[todayStr]?.exercise || '';
  const savedDiary = allData[todayStr]?.diary || '';

  // 임시 입력값(식단, 운동, 일기)
  const [tempDiet, setTempDiet] = useState('');
  const [tempExercise, setTempExercise] = useState('');
  const [tempDiary, setTempDiary] = useState('');

  // 날짜/페이지 변경 시 임시 입력값 초기화
  useEffect(() => {
    setTempDiet(savedDiet);
    setTempExercise(savedExercise);
    setTempDiary(savedDiary);
    // eslint-disable-next-line
  }, [todayStr, page]);

  // 최초 로드 시 localStorage에서 불러오기
  useEffect(() => {
    setAllData(loadData());
    const loaded = loadChecklistItems();
    if (loaded) setChecklistItems(loaded);
    else setChecklistItems(DEFAULT_CHECKLIST_ITEMS);
  }, []);

  // 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    saveData(allData);
  }, [allData]);

  // 체크리스트 항목 변경 시 localStorage에 저장
  useEffect(() => {
    saveChecklistItems(checklistItems);
  }, [checklistItems]);

  // 체크리스트 체크
  const handleCheck = (key: string) => {
    setAllData((prev: any) => ({
      ...prev,
      [todayStr]: {
        ...prev[todayStr],
        checked: { ...prev[todayStr]?.checked, [key]: !prev[todayStr]?.checked?.[key] },
        diet: prev[todayStr]?.diet || '',
        exercise: prev[todayStr]?.exercise || '',
        diary: prev[todayStr]?.diary || '',
      },
    }));
  };

  // 체크리스트 항목 추가
  const handleAddItem = () => {
    if (!newItemLabel.trim()) return;
    // 고유 key 생성: user-타임스탬프
    const key = 'user-' + Date.now();
    setChecklistItems((prev) => [
      ...prev,
      {
        key,
        label: newItemLabel.trim(),
        iconName: 'FaUserPlus',
        color: '#e57373',
        type: 'user',
      },
    ]);
    setNewItemLabel('');
  };

  // 체크리스트 항목 삭제(사용자 추가 항목만)
  const handleDeleteItem = (key: string) => {
    setChecklistItems((prev) => prev.filter(item => item.key !== key));
    // 기존 기록에서도 해당 항목 체크값 삭제
    setAllData((prev: any) => {
      const updated: any = { ...prev };
      Object.keys(updated).forEach(date => {
        if (updated[date]?.checked && key in updated[date].checked) {
          const c = { ...updated[date].checked };
          delete c[key];
          updated[date] = { ...updated[date], checked: c };
        }
      });
      return updated;
    });
  };

  // 식단/운동/일기 기록 저장
  const handleSaveDiet = () => {
    setAllData((prev: any) => ({
      ...prev,
      [todayStr]: {
        ...prev[todayStr],
        checked: prev[todayStr]?.checked || {},
        diet: tempDiet,
        exercise: prev[todayStr]?.exercise || '',
        diary: prev[todayStr]?.diary || '',
      },
    }));
  };
  const handleSaveExercise = () => {
    setAllData((prev: any) => ({
      ...prev,
      [todayStr]: {
        ...prev[todayStr],
        checked: prev[todayStr]?.checked || {},
        diet: prev[todayStr]?.diet || '',
        exercise: tempExercise,
        diary: prev[todayStr]?.diary || '',
      },
    }));
  };
  const handleSaveDiary = () => {
    setAllData((prev: any) => ({
      ...prev,
      [todayStr]: {
        ...prev[todayStr],
        checked: prev[todayStr]?.checked || {},
        diet: prev[todayStr]?.diet || '',
        exercise: prev[todayStr]?.exercise || '',
        diary: tempDiary,
      },
    }));
    setEncourageMsg(ENCOURAGE_MESSAGE);
    setShowEncourage(true);
  };

  // 날짜 이동
  const moveDate = (days: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + days);
      return d;
    });
  };

  // 월별 통계 계산
  function getMonthStats(month: string) {
    // month: yyyy-mm
    const daysInMonth = Object.keys(allData).filter(date => date.startsWith(month));
    const totalDays = daysInMonth.length;
    const stats: { [key: string]: { count: number; percent: number } } = {};
    checklistItems.forEach(item => {
      let count = 0;
      daysInMonth.forEach(date => {
        if (allData[date]?.checked?.[item.key]) count++;
      });
      stats[item.key] = {
        count,
        percent: totalDays ? Math.round((count / totalDays) * 100) : 0,
      };
    });
    return { totalDays, stats };
  }

  // 통계 페이지 월 선택
  const [statsMonth, setStatsMonth] = useState(getMonthStr(new Date()));
  const { totalDays, stats } = getMonthStats(statsMonth);

  // 응원 메시지 모달 상태
  const [showEncourage, setShowEncourage] = useState(false);
  const [encourageMsg, setEncourageMsg] = useState('');

  // 페이지 렌더링
  let pageContent = null;
  if (page === 0) {
    pageContent = (
      <div className="checklist">
        <div className="checklist-add-row">
          <input
            className="checklist-add-input"
            type="text"
            value={newItemLabel}
            onChange={e => setNewItemLabel(e.target.value)}
            placeholder="체크리스트 항목 추가"
            maxLength={20}
          />
          <button className="checklist-add-btn" onClick={handleAddItem} disabled={!newItemLabel.trim()}>추가</button>
        </div>
        {checklistItems.map((item) => (
          <label key={item.key} className="check-item">
            <input
              type="checkbox"
              checked={!!checked[item.key]}
              onChange={() => handleCheck(item.key)}
            />
            <span className="icon" style={{ color: item.color }}>{getIcon(item.iconName, item.color)}</span>
            <span>{item.label}</span>
            {item.type === 'user' && (
              <button className="checklist-del-btn" onClick={() => handleDeleteItem(item.key)} title="삭제"><FaTrash /></button>
            )}
          </label>
        ))}
      </div>
    );
  } else if (page === 1) {
    pageContent = (
      <div className="record-section">
        <div>
          <h3>식단 기록</h3>
          <textarea
            className="record-input"
            value={tempDiet}
            onChange={(e) => setTempDiet(e.target.value)}
            placeholder="오늘 먹은 식단을 입력하세요"
            rows={5}
          />
          <button className="save-btn" onClick={handleSaveDiet} disabled={tempDiet === savedDiet}>저장</button>
        </div>
      </div>
    );
  } else if (page === 2) {
    pageContent = (
      <div className="record-section">
        <div>
          <h3>운동 기록</h3>
          <textarea
            className="record-input"
            value={tempExercise}
            onChange={(e) => setTempExercise(e.target.value)}
            placeholder="오늘 한 운동을 입력하세요"
            rows={5}
          />
          <button className="save-btn" onClick={handleSaveExercise} disabled={tempExercise === savedExercise}>저장</button>
        </div>
      </div>
    );
  } else if (page === 3) {
    pageContent = (
      <div className="record-section">
        <div>
          <h3>일기</h3>
          <textarea
            className="record-input"
            value={tempDiary}
            onChange={(e) => setTempDiary(e.target.value)}
            placeholder="오늘의 일기를 입력하세요"
            rows={7}
          />
          <button className="save-btn" onClick={handleSaveDiary} disabled={tempDiary === savedDiary}>저장</button>
        </div>
      </div>
    );
  } else if (page === 4) {
    pageContent = (
      <div className="stats-section">
        <div className="stats-month-picker">
          <input
            type="month"
            value={statsMonth}
            onChange={e => setStatsMonth(e.target.value)}
          />
          <span className="stats-total-days">(기록일수: {totalDays}일)</span>
        </div>
        <div className="stats-list">
          {checklistItems.map(item => (
            <div key={item.key} className="stats-item">
              <span className="icon" style={{ color: item.color }}>{getIcon(item.iconName, item.color)}</span>
              <span>{item.label}</span>
              <span className="stats-percent">{stats[item.key]?.percent ?? 0}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 날짜 이동 UI */}
      {page !== 4 && (
        <div className="date-nav">
          <button className="date-btn" onClick={() => moveDate(-1)}>&lt;</button>
          <input
            type="date"
            value={todayStr}
            onChange={e => setCurrentDate(new Date(e.target.value))}
            className="date-input"
          />
          <button className="date-btn" onClick={() => moveDate(1)}>&gt;</button>
        </div>
      )}
      {/* 페이지네이션 탭 */}
      <div className="page-tabs">
        {pageList.map((p, idx) => (
          <button
            key={p.key}
            className={`page-tab${page === idx ? ' active' : ''}`}
            onClick={() => setPage(idx)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* 실제 내용 */}
      {pageContent}
      {/* 응원 메시지 모달 */}
      {showEncourage && (
        <div className="encourage-modal-bg" onClick={() => setShowEncourage(false)}>
          <div className="encourage-modal" onClick={e => e.stopPropagation()}>
            <div className="encourage-msg">{encourageMsg}</div>
            <button className="encourage-close-btn" onClick={() => setShowEncourage(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
