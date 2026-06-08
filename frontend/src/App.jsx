import { useState } from 'react'
import { fetchHealth, fetchServerInfo, fetchStudents, addStudent } from './api'

/**
 * ========================================
 * 메인 App 컴포넌트
 * ========================================
 * 
 * 이 화면은 Public 서버의 Apache에서 제공되는 React 프론트엔드입니다.
 * API 요청은 Apache Reverse Proxy를 통해 Private 서버의 Spring Boot로 전달됩니다.
 * 
 * 구성:
 * 1. 아키텍처 설명 카드 3장 (Public / Reverse Proxy / Private)
 * 2. API 테스트 버튼 3개 (Health / Server Info / Students)
 * 3. 학생 등록 폼
 * 4. API 응답 표시 영역
 */
function App() {
  // API 응답 데이터를 저장하는 상태
  const [apiResult, setApiResult] = useState(null)
  // API 호출 중 로딩 상태
  const [loading, setLoading] = useState(false)
  // 에러 메시지
  const [error, setError] = useState(null)
  // 현재 활성화된 결과 타입 (어떤 API 응답인지 구분)
  const [resultType, setResultType] = useState(null)

  // 학생 등록 폼 상태
  const [studentName, setStudentName] = useState('')
  const [studentCourse, setStudentCourse] = useState('')
  // 등록 결과
  const [registerResult, setRegisterResult] = useState(null)

  /**
   * API 호출 공통 핸들러
   * 로딩/에러 상태를 관리하고, API 함수를 실행합니다.
   */
  const handleApiCall = async (apiFn, type) => {
    setLoading(true)
    setError(null)
    setResultType(type)
    try {
      const data = await apiFn()
      setApiResult(data)
    } catch (err) {
      setError(`API 호출 실패: ${err.message}`)
      setApiResult(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 학생 등록 핸들러
   * POST /api/students 호출
   */
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!studentName.trim() || !studentCourse.trim()) {
      setError('이름과 과정명을 모두 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await addStudent({
        name: studentName,
        course: studentCourse,
      })
      setRegisterResult(data)
      setStudentName('')
      setStudentCourse('')
    } catch (err) {
      setError(`학생 등록 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* ========================================
          헤더 영역
          ======================================== */}
      <header className="header">
        <div className="header-content">
          <div className="header-badge">Cloud Practice</div>
          <h1 className="header-title">
            <span className="header-icon">☁️</span>
            Public Apache → Private Spring Boot 실습
          </h1>
          <p className="header-desc">
            이 화면은 <strong>Public 서버의 Apache</strong>에서 제공되는 React 프론트엔드입니다.<br />
            API 요청은 <strong>Apache Reverse Proxy</strong>를 통해 <strong>Private 서버의 Spring Boot</strong>로 전달됩니다.
          </p>
        </div>
      </header>

      <main className="main-content">
        {/* ========================================
            아키텍처 설명 카드 3장
            ======================================== */}
        <section className="architecture-section">
          <h2 className="section-title">
            <span className="section-icon">🏗️</span>
            아키텍처 구성
          </h2>
          <div className="card-grid">
            {/* 카드 1: Public Server */}
            <div className="arch-card public-card">
              <div className="card-header">
                <span className="card-emoji">🌐</span>
                <h3>Public Server</h3>
              </div>
              <div className="card-tag public-tag">Public Subnet</div>
              <ul className="card-list">
                <li><span className="list-icon">▸</span> Apache Web Server</li>
                <li><span className="list-icon">▸</span> React 정적 파일 제공</li>
                <li><span className="list-icon">▸</span> 외부 사용자의 요청을 받음</li>
              </ul>
            </div>

            {/* 카드 2: Reverse Proxy */}
            <div className="arch-card proxy-card">
              <div className="card-header">
                <span className="card-emoji">🔀</span>
                <h3>Reverse Proxy</h3>
              </div>
              <div className="card-tag proxy-tag">Apache mod_proxy</div>
              <ul className="card-list">
                <li><span className="list-icon">▸</span> /api 요청을 Private 서버로 전달</li>
                <li><span className="list-icon">▸</span> Apache mod_proxy 사용</li>
                <li><span className="list-icon">▸</span> 백엔드 서버 직접 노출 방지</li>
              </ul>
            </div>

            {/* 카드 3: Private Server */}
            <div className="arch-card private-card">
              <div className="card-header">
                <span className="card-emoji">🔒</span>
                <h3>Private Server</h3>
              </div>
              <div className="card-tag private-tag">Private Subnet</div>
              <ul className="card-list">
                <li><span className="list-icon">▸</span> Spring Boot</li>
                <li><span className="list-icon">▸</span> 내장 Tomcat</li>
                <li><span className="list-icon">▸</span> 8080 포트에서 API 처리</li>
              </ul>
            </div>
          </div>

          {/* 요청 흐름 시각화 */}
          <div className="flow-diagram">
            <div className="flow-step">
              <span className="flow-icon">👤</span>
              <span className="flow-label">브라우저</span>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step">
              <span className="flow-icon">🌐</span>
              <span className="flow-label">Apache:80</span>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step">
              <span className="flow-icon">🔀</span>
              <span className="flow-label">Proxy</span>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step">
              <span className="flow-icon">🔒</span>
              <span className="flow-label">Spring:8080</span>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step">
              <span className="flow-icon">📦</span>
              <span className="flow-label">JSON 응답</span>
            </div>
          </div>
        </section>

        {/* ========================================
            API 테스트 버튼 영역
            ======================================== */}
        <section className="api-section">
          <h2 className="section-title">
            <span className="section-icon">🧪</span>
            API 테스트
          </h2>
          <p className="section-desc">
            아래 버튼을 클릭하면 <code>/api</code> 경로로 요청이 전송됩니다.
            Apache Reverse Proxy가 정상 동작하면 Private Spring Boot 서버의 응답이 표시됩니다.
          </p>

          <div className="button-group">
            <button
              id="btn-health"
              className="api-btn health-btn"
              onClick={() => handleApiCall(fetchHealth, 'health')}
              disabled={loading}
            >
              <span className="btn-icon">💚</span>
              Health Check
              <span className="btn-path">/api/health</span>
            </button>
            <button
              id="btn-server-info"
              className="api-btn info-btn"
              onClick={() => handleApiCall(fetchServerInfo, 'server-info')}
              disabled={loading}
            >
              <span className="btn-icon">ℹ️</span>
              Server Info
              <span className="btn-path">/api/server-info</span>
            </button>
            <button
              id="btn-students"
              className="api-btn students-btn"
              onClick={() => handleApiCall(fetchStudents, 'students')}
              disabled={loading}
            >
              <span className="btn-icon">👨‍🎓</span>
              Student List
              <span className="btn-path">/api/students</span>
            </button>
          </div>

          {/* 로딩 표시 */}
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <span>API 요청 중...</span>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="error-box">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* API 응답 표시 영역 */}
          {apiResult && !loading && (
            <div className="result-box">
              <div className="result-header">
                <span className="result-badge">
                  {resultType === 'health' && '💚 Health Check 응답'}
                  {resultType === 'server-info' && 'ℹ️ Server Info 응답'}
                  {resultType === 'students' && '👨‍🎓 Student List 응답'}
                </span>
                <span className="result-source">from: Private Spring Boot</span>
              </div>

              {/* students 타입이면 카드 형태로 표시 */}
              {resultType === 'students' && Array.isArray(apiResult) ? (
                <div className="student-grid">
                  {apiResult.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-id">#{student.id}</div>
                      <div className="student-name">{student.name}</div>
                      <div className="student-course">{student.course}</div>
                      <span className={`student-status ${student.status === '완료' ? 'status-done' : student.status === '등록완료' ? 'status-new' : 'status-active'}`}>
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* JSON 형태로 표시 */
                <pre className="json-output">
                  {JSON.stringify(apiResult, null, 2)}
                </pre>
              )}
            </div>
          )}
        </section>

        {/* ========================================
            학생 등록 폼
            ======================================== */}
        <section className="register-section">
          <h2 className="section-title">
            <span className="section-icon">📝</span>
            학생 등록
          </h2>
          <p className="section-desc">
            POST /api/students 요청을 보냅니다. 등록 데이터는 Private 서버의 메모리에 저장됩니다.
          </p>

          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="input-name">이름</label>
              <input
                id="input-name"
                type="text"
                placeholder="예: 홍길동"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="input-course">과정명</label>
              <input
                id="input-course"
                type="text"
                placeholder="예: Spring Boot"
                value={studentCourse}
                onChange={(e) => setStudentCourse(e.target.value)}
              />
            </div>
            <button
              id="btn-register"
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              <span className="btn-icon">✚</span>
              학생 등록
            </button>
          </form>

          {/* 등록 결과 표시 */}
          {registerResult && (
            <div className="result-box register-result">
              <div className="result-header">
                <span className="result-badge">✅ 등록 완료</span>
                <span className="result-source">POST /api/students</span>
              </div>
              <pre className="json-output">
                {JSON.stringify(registerResult, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </main>

      {/* ========================================
          푸터
          ======================================== */}
      <footer className="footer">
        <p>☁️ Cloud Practice — Apache + Spring Boot 통신 실습</p>
        <p className="footer-sub">Public Subnet / Private Subnet 아키텍처 학습</p>
      </footer>
    </div>
  )
}

export default App
