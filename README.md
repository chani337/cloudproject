# ☁️ Apache + Spring Boot 클라우드 실습 프로젝트

Public Subnet의 Apache Web Server와 Private Subnet의 Spring Boot를 연동하는 클라우드 수업 실습 프로젝트입니다.

---

## 📋 목차

1. [프로젝트 설명](#1-프로젝트-설명)
2. [전체 아키텍처](#2-전체-아키텍처)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [Public 서버 역할](#4-public-서버-역할)
5. [Private 서버 역할](#5-private-서버-역할)
6. [Private 서버 - 백엔드 실행](#6-private-서버---백엔드-실행)
7. [Private 서버 - 백엔드 테스트](#7-private-서버---백엔드-테스트)
8. [Public 서버에서 Private 백엔드 테스트](#8-public-서버에서-private-백엔드-테스트)
9. [Public 서버 - 프론트엔드 빌드 및 배포](#9-public-서버---프론트엔드-빌드-및-배포)
10. [Apache 설정](#10-apache-설정)
11. [Apache 적용](#11-apache-적용)
12. [브라우저 접속 확인](#12-브라우저-접속-확인)
13. [API 테스트](#13-api-테스트)
14. [NCP ACG 설정](#14-ncp-acg-설정)
15. [NAT Gateway 설명](#15-nat-gateway-설명)
16. [수업 설명](#16-수업-설명)

---

## 1. 프로젝트 설명

이 프로젝트는 클라우드 수업에서 **Public Subnet / Private Subnet 구조**를 설명하기 위한 실습 프로젝트입니다.

- **프론트엔드**: React (Vite) 기반 대시보드
- **백엔드**: Spring Boot 3.x (내장 Tomcat, DB 없음)
- **웹서버**: Apache HTTP Server (Reverse Proxy)

핵심 목표:
- Public 서버의 Apache가 React 정적 파일을 제공
- `/api` 요청만 Private 서버의 Spring Boot로 프록시
- Private 서버는 외부에 직접 노출되지 않음

---

## 2. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                            │
│                    http://퍼블릭서버공인IP                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Public Subnet (공인 IP)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Apache Web Server (:80)                       │  │
│  │                                                           │  │
│  │  ┌─────────────────┐    ┌──────────────────────────────┐  │  │
│  │  │ React 정적 파일  │    │  Reverse Proxy (mod_proxy)   │  │  │
│  │  │ /var/www/cloud-  │    │  /api/* → Private:8080/api/* │  │  │
│  │  │ practice         │    │                              │  │  │
│  │  └─────────────────┘    └──────────────┬───────────────┘  │  │
│  └────────────────────────────────────────┼──────────────────┘  │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Private Subnet (내부 IP만)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Spring Boot (내장 Tomcat :8080)                  │  │
│  │                                                           │  │
│  │  GET  /api/health     → { "status": "UP" }               │  │
│  │  GET  /api/server-info → { "server": "private-..." }     │  │
│  │  GET  /api/students   → [ 학생 목록 ]                     │  │
│  │  POST /api/students   → 학생 등록                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**요청 흐름:**

```
사용자 브라우저
→ Public Server (Apache :80)
→ React Frontend (정적 파일 응답)
→ /api 요청 발생
→ Apache Reverse Proxy (mod_proxy)
→ Private Server (Spring Boot :8080)
→ JSON 응답 반환
→ 브라우저에 결과 표시
```

---

## 3. 프로젝트 구조

```
apache-springboot-cloud-practice/
├── frontend/                          # React 프론트엔드
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                   # React 진입점
│       ├── App.jsx                    # 메인 컴포넌트
│       ├── App.css                    # 스타일시트
│       └── api.js                     # API 호출 모듈
├── backend/                           # Spring Boot 백엔드
│   ├── pom.xml                        # Maven 설정
│   ├── mvnw                           # Maven Wrapper (Linux)
│   ├── mvnw.cmd                       # Maven Wrapper (Windows)
│   └── src/main/java/com/example/cloudpractice/
│       ├── CloudPracticeApplication.java    # 메인 클래스
│       ├── config/
│       │   └── CorsConfig.java              # CORS 설정
│       ├── controller/
│       │   ├── PageController.java          # 루트 페이지
│       │   ├── HealthController.java        # 헬스체크 & 서버정보
│       │   └── StudentController.java       # 학생 API
│       ├── dto/
│       │   ├── StudentRequest.java          # 요청 DTO
│       │   └── StudentResponse.java         # 응답 DTO
│       └── service/
│           └── StudentService.java          # 비즈니스 로직
└── README.md
```

---

## 4. Public 서버 역할

Public 서버는 **외부 사용자의 요청을 직접 받는 서버**입니다.

| 항목 | 설명 |
|------|------|
| 위치 | Public Subnet (공인 IP 보유) |
| 소프트웨어 | Apache HTTP Server |
| 역할 1 | React 빌드 파일(정적 파일) 제공 |
| 역할 2 | `/api` 요청을 Private 서버로 Reverse Proxy |
| 포트 | 80 (HTTP) |

### Apache 설치

```bash
sudo apt update
sudo apt install -y apache2
```

---

## 5. Private 서버 역할

Private 서버는 **외부에서 직접 접근할 수 없는 서버**입니다.
Public 서버를 통해서만 접근됩니다.

| 항목 | 설명 |
|------|------|
| 위치 | Private Subnet (내부 IP만 보유) |
| 소프트웨어 | Java 17 + Spring Boot |
| 역할 | REST API 제공 (WAS) |
| 포트 | 8080 |
| DB | 사용하지 않음 (메모리 저장) |

### Java 17 설치

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version
```

---

## 6. Private 서버 - 백엔드 실행

Private 서버에 SSH로 접속한 후 아래 명령어를 순서대로 실행합니다.

```bash
# 1. 프로젝트 클론
cd /opt
sudo git clone [저장소주소]
sudo chown -R $USER:$USER apache-springboot-cloud-practice

# 2. 백엔드 디렉토리로 이동
cd apache-springboot-cloud-practice/backend

# 3. Maven Wrapper 실행 권한 부여
chmod +x mvnw

# 4. 빌드 (테스트 스킵)
./mvnw clean package -DskipTests

# 5. 백그라운드로 실행
nohup java -jar target/*.jar > app.log 2>&1 &

# 6. 로그 확인 (Ctrl+C로 종료)
tail -f app.log
```

> **참고**: `nohup` 명령어를 사용하면 SSH 세션이 끊어져도 서버가 계속 실행됩니다.

---

## 7. Private 서버 - 백엔드 테스트

Private 서버 내부에서 API가 정상 동작하는지 확인합니다.

```bash
# Health Check
curl http://localhost:8080/api/health
# 예상 응답: {"status":"UP","message":"Spring Boot backend is running"}

# Server Info
curl http://localhost:8080/api/server-info
# 예상 응답: {"server":"private-spring-boot","role":"WAS","port":8080,...}

# Student List
curl http://localhost:8080/api/students
# 예상 응답: [{"id":1,"name":"김민수",...}, ...]

# Student Registration
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","course":"Spring Boot"}'
# 예상 응답: {"id":4,"name":"홍길동","course":"Spring Boot","status":"등록완료"}
```

---

## 8. Public 서버에서 Private 백엔드 테스트

Public 서버에서 Private 서버의 백엔드에 접근 가능한지 확인합니다.

> **Private 서버의 내부 IP가 `10.10.20.6`인 경우:**

```bash
# Public 서버에서 실행
curl http://10.10.20.6:8080/api/health
# 예상 응답: {"status":"UP","message":"Spring Boot backend is running"}

curl http://10.10.20.6:8080/api/server-info

curl http://10.10.20.6:8080/api/students
```

> ⚠️ 이 테스트가 실패하면 ACG(방화벽) 설정을 확인하세요.
> Private 서버 ACG에서 TCP 8080 포트가 Public 서버 IP에 대해 열려 있어야 합니다.

---

## 9. Public 서버 - 프론트엔드 빌드 및 배포

Public 서버에서 React 프론트엔드를 빌드하고 Apache 문서 루트에 배포합니다.

### Node.js 설치 (Public 서버)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 프론트엔드 빌드 및 배포

```bash
# 1. 프로젝트 클론
cd /opt
sudo git clone [저장소주소]
sudo chown -R $USER:$USER apache-springboot-cloud-practice

# 2. 프론트엔드 디렉토리로 이동
cd apache-springboot-cloud-practice/frontend

# 3. 의존성 설치
npm install

# 4. 빌드 (dist 폴더에 결과물 생성)
npm run build

# 5. Apache 문서 루트에 배포
sudo mkdir -p /var/www/cloud-practice
sudo rm -rf /var/www/cloud-practice/*
sudo cp -r dist/* /var/www/cloud-practice/
```

---

## 10. Apache 설정

### Apache 모듈 활성화

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

### Apache 설정 파일 생성

```bash
sudo tee /etc/apache2/sites-available/cloud-practice.conf > /dev/null <<'EOF'
<VirtualHost *:80>
    ServerName _

    DocumentRoot /var/www/cloud-practice

    <Directory /var/www/cloud-practice>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPreserveHost On

    ProxyPass /api/ http://10.10.20.6:8080/api/
    ProxyPassReverse /api/ http://10.10.20.6:8080/api/
</VirtualHost>
EOF
```

> ⚠️ **`10.10.20.6`은 예시 IP입니다.** 실제 Private 서버의 내부 IP로 변경하세요.

### Apache 설정 설명

| 설정 | 설명 |
|------|------|
| `DocumentRoot` | React 빌드 파일 위치 |
| `RewriteRule` | React Router의 클라이언트 사이드 라우팅 지원 (SPA) |
| `ProxyPass /api/` | `/api/` 요청을 Private Spring Boot 서버로 전달 |
| `ProxyPassReverse` | 응답 헤더의 URL을 원래 요청 URL로 되돌림 |
| `ProxyPreserveHost On` | 원본 Host 헤더를 유지 |

---

## 11. Apache 적용

```bash
# 1. 기본 사이트 비활성화
sudo a2dissite 000-default.conf

# 2. cloud-practice 사이트 활성화
sudo a2ensite cloud-practice.conf

# 3. 설정 문법 검사
sudo apachectl configtest
# 정상이면 "Syntax OK" 출력

# 4. Apache 재시작
sudo systemctl restart apache2
```

---

## 12. 브라우저 접속 확인

브라우저에서 Public 서버의 공인 IP로 접속합니다.

```
http://퍼블릭서버공인IP
```

React 대시보드 화면이 표시되면 프론트엔드 배포가 성공한 것입니다.

---

## 13. API 테스트

브라우저에서 직접 API를 호출하여 Reverse Proxy가 정상 동작하는지 확인합니다.

```
http://퍼블릭서버공인IP/api/health
http://퍼블릭서버공인IP/api/server-info
http://퍼블릭서버공인IP/api/students
```

또는 대시보드 화면의 **API 테스트 버튼**을 클릭하여 확인합니다.

---

## 14. NCP ACG 설정

### Public 서버 ACG (Access Control Group)

| 프로토콜 | 포트 | 소스 | 설명 |
|----------|------|------|------|
| TCP | 22 | 내 IP | SSH 접속 |
| TCP | 80 | 0.0.0.0/0 | HTTP (웹 접속) |
| TCP | 443 | 0.0.0.0/0 | HTTPS (선택) |

### Private 서버 ACG

| 프로토콜 | 포트 | 소스 | 설명 |
|----------|------|------|------|
| TCP | 22 | Public 서버 내부 IP/32 | SSH 접속 (Public에서만) |
| TCP | 8080 | Public 서버 내부 IP/32 | API 접속 (Public에서만) |

### ACG 설정 예시

Public 서버 내부 IP가 `10.10.10.6`인 경우:

```
Private 서버 ACG:
TCP 22    10.10.10.6/32     ← Public 서버에서 SSH 접속 허용
TCP 8080  10.10.10.6/32     ← Public 서버에서 API 접속 허용
```

> ⚠️ Private 서버의 8080 포트는 **Public 서버의 내부 IP에서만** 접근 가능해야 합니다.
> `0.0.0.0/0`으로 설정하면 Private 서버의 보안이 무의미해집니다.

---

## 15. NAT Gateway 설명

### Internet Gateway vs NAT Gateway

| 구분 | Internet Gateway | NAT Gateway |
|------|-----------------|-------------|
| 용도 | Public Subnet ↔ 인터넷 | Private Subnet → 인터넷 (아웃바운드만) |
| 방향 | 양방향 | 아웃바운드만 |
| 대상 | Public 서버 | Private 서버 |

### NAT Gateway가 필요한 경우

Private 서버에서 다음 작업을 하려면 **NAT Gateway**가 필요합니다:

- `apt update` / `apt install` (패키지 설치)
- `git clone` (GitHub에서 소스 코드 다운로드)
- Maven 의존성 다운로드 (`./mvnw clean package`)

### NAT Gateway 설정

Private Subnet의 Route Table에 아래 경로를 추가해야 합니다:

```
목적지: 0.0.0.0/0
타겟: NAT Gateway
```

### 참고 사항

- **Public 서버 → 외부 접속**: Internet Gateway 필요
- **Public 서버 → Private 서버 SSH**: NAT Gateway 필요 없음 (같은 VPC 내부 통신)
- **Private 서버 → GitHub, Maven Repository, apt repository**: **NAT Gateway 필요**
- Private Subnet Route Table에 `0.0.0.0/0 → NAT Gateway` 경로가 있어야 함

---

## 16. 수업 설명

이 실습은 **Public 서버와 Private 서버의 역할 분리**를 이해하기 위한 예제입니다.

- **Public 서버의 Apache**는 외부 사용자의 요청을 받고, React 정적 파일을 제공합니다.
- 백엔드 API 요청인 `/api` 경로는 **Apache Reverse Proxy**를 통해 Private 서버의 Spring Boot로 전달됩니다.
- **Private 서버는 외부에 직접 노출되지 않으며**, Public 서버를 통해서만 접근됩니다.
- Spring Boot는 **내장 Tomcat**을 사용하므로 별도의 Tomcat 설치 없이 WAS 역할을 수행합니다.

### 핵심 학습 포인트

1. **네트워크 분리**: Public Subnet과 Private Subnet의 역할 이해
2. **Reverse Proxy**: Apache가 클라이언트 요청을 백엔드로 중계하는 방식 이해
3. **보안**: Private 서버를 외부에 노출하지 않는 아키텍처 패턴 이해
4. **ACG(방화벽)**: 필요한 포트만 최소한으로 여는 보안 원칙 이해
5. **NAT Gateway**: Private 서버의 아웃바운드 인터넷 접속 방법 이해
