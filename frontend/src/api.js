// ========================================
// API 호출 모듈
// ========================================
//
// 모든 API 호출은 상대경로 /api 를 사용합니다.
// 절대경로(http://10.10.20.6:8080/api)를 사용하면 안 됩니다!
//
// 이유:
// - 브라우저는 Public Apache 서버(80포트)로 접속합니다.
// - /api 요청은 Apache Reverse Proxy가 Private Spring Boot(8080)로 전달합니다.
// - 프론트엔드는 백엔드의 실제 IP를 알 필요가 없습니다.
//
// 개발 환경: Vite dev proxy가 /api → localhost:8080으로 전달
// 배포 환경: Apache mod_proxy가 /api → Private서버:8080으로 전달
// ========================================

/**
 * Health Check API
 * GET /api/health
 */
export async function fetchHealth() {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Server Info API
 * GET /api/server-info
 */
export async function fetchServerInfo() {
  const response = await fetch("/api/server-info");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Student List API
 * GET /api/students
 */
export async function fetchStudents() {
  const response = await fetch("/api/students");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Student Registration API
 * POST /api/students
 * 
 * @param {Object} studentData - { name: "홍길동", course: "Spring Boot" }
 */
export async function addStudent(studentData) {
  const response = await fetch("/api/students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
