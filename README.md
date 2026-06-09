# ☁️ Apache + Spring Boot + GitHub Actions 클라우드 실습 프로젝트

Public Subnet의 Apache Web Server와 Private Subnet의 Spring Boot를 연동하고, systemd와 GitHub Actions CI/CD까지 구성하는 클라우드 수업 실습 프로젝트입니다.

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
17. [systemd 서비스 등록](#17-systemd-서비스-등록)
18. [SSH 설정](#18-ssh-설정)
19. [GitHub Actions CI/CD](#19-github-actions-cicd)
20. [최종 점검 체크리스트](#20-최종-점검-체크리스트)
21. [자주 발생하는 오류](#21-자주-발생하는-오류)

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
│                        사용자 브라우저                           │
│                    http://퍼블릭서버공인IP                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Public Subnet (공인 IP)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Apache Web Server (:80)                      │  │
│  │                                                           │  │
│  │  ┌─────────────────┐    ┌──────────────────────────────┐  │  │
│  │  │ React 정적 파일  │    │  Reverse Proxy (mod_proxy)   │  │  │
│  │  │ /var/www/cloud- │    │  /api/* → Private:8080/api/* │  │  │
│  │  │ practice        │    │                              │  │  │
│  │  └─────────────────┘    └──────────────┬───────────────┘  │  │
│  └────────────────────────────────────────┼──────────────────┘  │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Private Subnet (내부 IP만)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Spring Boot (내장 Tomcat :8080)                 │  │
│  │                                                           │  │
│  │  GET  /api/health     → { "status": "UP" }                │  │
│  │  GET  /api/server-info → { "server": "private-..." }      │  │
│  │  GET  /api/students   → [ 학생 목록 ]                      │  │
│  │  POST /api/students   → 학생 등록                          │  │
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
cloudproject/
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
sudo git clone https://github.com/chani337/cloudproject.git
sudo chown -R $USER:$USER cloudproject

# 2. 백엔드 디렉토리로 이동
cd cloudproject/backend

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
sudo git clone https://github.com/chani337/cloudproject.git
sudo chown -R $USER:$USER cloudproject

# 2. 프론트엔드 디렉토리로 이동
cd cloudproject/frontend

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


---

## 17. systemd 서비스 등록

`nohup`은 임시 실행에는 편리하지만, 서버를 재부팅하면 Spring Boot가 자동으로 다시 실행되지 않습니다.  
운영 형태로 배포하려면 Private 서버에서 Spring Boot를 `systemd` 서비스로 등록합니다.

### 17-1. Private 서버에서 기존 Java 프로세스 종료

```bash
pkill -f 'java -jar' 2>/dev/null
ps -ef | grep java
```

### 17-2. 배포용 디렉토리 생성

Private 서버에서 실행합니다.

```bash
mkdir -p /opt/cloudproject/app
cd /opt/cloudproject/backend
cp target/*.jar /opt/cloudproject/app/app.jar
```

### 17-3. systemd 서비스 파일 생성

```bash
sudo tee /etc/systemd/system/cloudproject.service > /dev/null <<'EOF'
[Unit]
Description=Cloud Project Spring Boot Backend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/cloudproject/app
ExecStart=/usr/bin/java -jar /opt/cloudproject/app/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

StandardOutput=append:/opt/cloudproject/app/app.log
StandardError=append:/opt/cloudproject/app/error.log

[Install]
WantedBy=multi-user.target
EOF
```

### 17-4. 서비스 시작 및 자동 실행 등록

```bash
sudo systemctl daemon-reload
sudo systemctl start cloudproject
sudo systemctl enable cloudproject
sudo systemctl status cloudproject
```

### 17-5. 서비스 확인

```bash
ss -tulnp | grep 8080
curl http://localhost:8080/api/health
```

### 17-6. 로그 확인

```bash
journalctl -u cloudproject -f
```

또는 파일 로그를 확인합니다.

```bash
tail -f /opt/cloudproject/app/app.log
tail -f /opt/cloudproject/app/error.log
```

### 17-7. 백엔드 재배포 수동 절차

Private 서버에서 백엔드 코드를 새로 반영할 때는 아래 순서로 진행합니다.

```bash
cd /opt/cloudproject/backend
git pull
./mvnw clean package -DskipTests

sudo systemctl stop cloudproject
cp target/*.jar /opt/cloudproject/app/app.jar
sudo systemctl start cloudproject
sudo systemctl status cloudproject

curl http://localhost:8080/api/health
```

---

## 18. SSH 설정

Public 서버는 Private 서버로 접속하는 Bastion 역할을 합니다.  
GitHub Actions CI/CD에서도 Public 서버를 거쳐 Private 서버에 접근해야 하므로, Public 서버에서 Private 서버로 비밀번호 없이 SSH 접속되도록 설정합니다.

### 18-1. Public 서버에서 SSH 키 생성

Public 서버에서 실행합니다.

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/cloud_private_key
```

엔터를 눌러 기본값으로 진행합니다.

### 18-2. Public 서버 공개키 확인

```bash
cat ~/.ssh/cloud_private_key.pub
```

출력된 공개키 내용을 복사합니다.

### 18-3. Private 서버에 공개키 등록

Public 서버에서 Private 서버로 접속합니다.

```bash
ssh root@10.10.20.6
```

Private 서버에서 실행합니다.

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

Public 서버에서 복사한 공개키를 붙여넣고 저장합니다.

```bash
chmod 600 ~/.ssh/authorized_keys
exit
```

### 18-4. Public 서버에서 Private 서버 접속 테스트

```bash
ssh -i ~/.ssh/cloud_private_key root@10.10.20.6
```

### 18-5. SSH 별칭 설정

Public 서버에서 실행합니다.

```bash
nano ~/.ssh/config
```

아래 내용을 입력합니다.

```sshconfig
Host cloud-private
    HostName 10.10.20.6
    User root
    Port 22
    IdentityFile ~/.ssh/cloud_private_key
```

권한 설정:

```bash
chmod 600 ~/.ssh/config
```

이제 Public 서버에서 아래 명령어만으로 Private 서버에 접속할 수 있습니다.

```bash
ssh cloud-private
```

---

## 19. GitHub Actions CI/CD

GitHub Actions를 사용하면 `main` 브랜치에 push할 때마다 프론트엔드와 백엔드를 자동으로 빌드하고 서버에 배포할 수 있습니다.

### 19-1. CI/CD 배포 흐름

```
개발자 git push
→ GitHub Repository
→ GitHub Actions 실행
→ backend Maven build
→ frontend Vite build
→ Public 서버에 React dist 배포
→ Public 서버를 경유하여 Private 서버에 app.jar 전송
→ Private 서버 cloudproject.service 재시작
→ Public Apache를 통해 /api/health 확인
```

### 19-2. GitHub Actions가 Private 서버에 직접 접속하지 못하는 이유

Private 서버의 IP인 `10.10.20.6`은 VPC 내부에서만 접근 가능한 사설 IP입니다.  
따라서 GitHub Actions Runner는 Private 서버에 직접 접속할 수 없습니다.

그래서 아래 구조로 배포합니다.

```
GitHub Actions
→ Public 서버 SSH 접속
→ Public 서버에서 Private 서버로 SCP/SSH
→ Private 서버 Spring Boot 재시작
```

### 19-3. GitHub Secrets 등록

GitHub 저장소에서 아래 위치로 이동합니다.

```
Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

다음 Secret을 등록합니다.

| Secret 이름 | 값 |
|------------|----|
| `PUBLIC_HOST` | Public 서버 공인 IP 예: `223.130.157.120` |
| `PUBLIC_USER` | 예: `root` |
| `PUBLIC_SSH_KEY` | GitHub Actions가 Public 서버에 접속할 때 사용할 private key 전체 내용 |
| `PRIVATE_HOST` | Private 서버 내부 IP 예: `10.10.20.6` |
| `PRIVATE_USER` | 예: `root` |

> 주의: `PUBLIC_SSH_KEY`에는 `.pub` 파일이 아니라 private key 내용을 넣어야 합니다.

### 19-4. Public 서버에 CI/CD용 Private 서버 접속 키 준비

GitHub Actions는 Public 서버까지만 직접 접속합니다.  
그 다음 Public 서버 내부에서 Private 서버로 접속할 때는 `/root/.ssh/cloud_private_key`를 사용합니다.

Public 서버에서 아래가 성공해야 합니다.

```bash
ssh -i ~/.ssh/cloud_private_key root@10.10.20.6
```

### 19-5. GitHub Actions Workflow 파일 생성

저장소에 아래 경로로 파일을 생성합니다.

```
.github/workflows/deploy.yml
```

내용:

```yaml
name: Deploy Cloud Project

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source code
        uses: actions/checkout@v4

      - name: Set up Java 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: maven

      - name: Build Spring Boot backend
        working-directory: backend
        run: |
          chmod +x mvnw
          ./mvnw clean package -DskipTests

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Build React frontend
        working-directory: frontend
        run: |
          npm install
          npm run build

      - name: Prepare SSH key for Public server
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.PUBLIC_SSH_KEY }}" > ~/.ssh/public_key
          chmod 600 ~/.ssh/public_key
          ssh-keyscan -H ${{ secrets.PUBLIC_HOST }} >> ~/.ssh/known_hosts

      - name: Upload frontend build to Public server
        run: |
          tar -czf frontend-dist.tar.gz -C frontend/dist .
          scp -i ~/.ssh/public_key frontend-dist.tar.gz ${{ secrets.PUBLIC_USER }}@${{ secrets.PUBLIC_HOST }}:/tmp/frontend-dist.tar.gz

      - name: Deploy frontend on Public server
        run: |
          ssh -i ~/.ssh/public_key ${{ secrets.PUBLIC_USER }}@${{ secrets.PUBLIC_HOST }} << 'EOF'
            set -e
            mkdir -p /var/www/cloud-practice
            rm -rf /var/www/cloud-practice/*
            tar -xzf /tmp/frontend-dist.tar.gz -C /var/www/cloud-practice
            systemctl restart apache2
          EOF

      - name: Upload backend jar to Public server
        run: |
          cp backend/target/*.jar app.jar
          scp -i ~/.ssh/public_key app.jar ${{ secrets.PUBLIC_USER }}@${{ secrets.PUBLIC_HOST }}:/tmp/app.jar

      - name: Deploy backend to Private server through Public server
        run: |
          ssh -i ~/.ssh/public_key ${{ secrets.PUBLIC_USER }}@${{ secrets.PUBLIC_HOST }} << EOF
            set -e

            scp -i ~/.ssh/cloud_private_key /tmp/app.jar ${{ secrets.PRIVATE_USER }}@${{ secrets.PRIVATE_HOST }}:/opt/cloudproject/app/app.jar

            ssh -i ~/.ssh/cloud_private_key ${{ secrets.PRIVATE_USER }}@${{ secrets.PRIVATE_HOST }} '
              systemctl daemon-reload
              systemctl restart cloudproject
              systemctl status cloudproject --no-pager
            '
          EOF

      - name: Health check through Public Apache
        run: |
          sleep 5
          curl -f http://${{ secrets.PUBLIC_HOST }}/api/health
```

### 19-6. GitHub Actions 실행 조건

위 설정은 `main` 브랜치에 push될 때 자동 실행됩니다.

```bash
git add .
git commit -m "add github actions deploy workflow"
git push origin main
```

### 19-7. CI/CD 성공 확인

GitHub 저장소에서 아래 메뉴로 이동합니다.

```
Actions
→ Deploy Cloud Project
```

성공 후 Public 서버에서 확인합니다.

```bash
curl http://localhost/api/health
```

브라우저에서 확인합니다.

```
http://퍼블릭서버공인IP
http://퍼블릭서버공인IP/api/health
```

### 19-8. GitHub Actions용 ACG 주의사항

GitHub Actions Runner는 고정 IP가 아닐 수 있습니다.  
따라서 Actions가 Public 서버에 SSH 접속하려면 Public 서버 ACG의 TCP 22 접근소스를 넓게 열어야 할 수 있습니다.

임시 설정:

```
Public 서버 ACG:
TCP 22  0.0.0.0/0
```

단, 실무에서는 위험합니다.  
수업에서는 반드시 아래 내용을 설명합니다.

```
실무에서는 22번을 0.0.0.0/0으로 열지 않는다.
VPN, Bastion, Self-hosted Runner, 고정 IP Runner, 배포 전용 계정 등을 사용한다.
```

---

## 20. 최종 점검 체크리스트

### 네트워크

- [ ] Public 서버에 공인 IP가 연결되어 있다.
- [ ] Public 서버 Subnet은 Internet Gateway가 적용되어 있다.
- [ ] Private 서버는 공인 IP가 없다.
- [ ] Private 서버는 Public 서버를 통해 SSH 접속한다.
- [ ] Private 서버에서 `apt update`, `git clone`, Maven 빌드가 필요하면 NAT Gateway가 구성되어 있다.
- [ ] Private Subnet Route Table에 `0.0.0.0/0 → NAT Gateway` 경로가 있다.

### ACG

- [ ] Public 서버 ACG에 TCP 80이 `0.0.0.0/0`으로 열려 있다.
- [ ] Public 서버 ACG에 TCP 22가 관리자 IP 또는 실습용 허용 범위로 열려 있다.
- [ ] Private 서버 ACG에 TCP 22가 Public 서버 내부 IP로 열려 있다.
- [ ] Private 서버 ACG에 TCP 8080이 Public 서버 내부 IP로 열려 있다.

### Private 서버

- [ ] Java 17이 설치되어 있다.
- [ ] Spring Boot가 8080 포트에서 실행 중이다.
- [ ] `curl http://localhost:8080/api/health`가 정상 응답한다.
- [ ] `cloudproject.service`가 active 상태이다.
- [ ] 서버 재부팅 후에도 Spring Boot가 자동 실행된다.

### Public 서버

- [ ] Apache가 설치되어 있다.
- [ ] `proxy`, `proxy_http`, `rewrite`, `headers` 모듈이 활성화되어 있다.
- [ ] React 빌드 파일이 `/var/www/cloud-practice`에 배포되어 있다.
- [ ] Apache 설정 파일이 `/etc/apache2/sites-available/cloud-practice.conf`에 있다.
- [ ] `sudo apachectl configtest` 결과가 `Syntax OK`이다.
- [ ] `curl http://localhost/api/health`가 정상 응답한다.

### CI/CD

- [ ] GitHub Secrets가 등록되어 있다.
- [ ] `.github/workflows/deploy.yml` 파일이 있다.
- [ ] `main` 브랜치 push 시 GitHub Actions가 실행된다.
- [ ] Actions 성공 후 Public 화면과 API가 정상 동작한다.

---

## 21. 자주 발생하는 오류

### 21-1. `https://공인IP`로 접속했는데 안 됨

HTTPS는 SSH와 다릅니다.

- SSH: 22번 포트
- HTTP: 80번 포트
- HTTPS: 443번 포트 + SSL 인증서 필요

기본 실습은 HTTP 기준입니다.

```
http://퍼블릭서버공인IP
```

HTTPS를 사용하려면 도메인, 인증서, Apache SSL 설정이 추가로 필요합니다.

### 21-2. `curl http://10.10.20.6:8080/api/health` 실패

확인 순서:

```bash
# Private 서버에서
ss -tulnp | grep 8080
curl http://localhost:8080/api/health
systemctl status cloudproject
tail -n 100 /opt/cloudproject/app/error.log
```

Private 서버 ACG에 아래 규칙이 있어야 합니다.

```
TCP 8080  Public서버내부IP/32
```

### 21-3. Apache에서 502 Bad Gateway 발생

대부분 Private 서버 백엔드가 안 떠 있거나, ACG가 막힌 경우입니다.

```bash
# Public 서버에서
curl http://10.10.20.6:8080/api/health
sudo tail -n 100 /var/log/apache2/error.log
```

### 21-4. React 화면은 나오는데 API 버튼이 실패함

프론트엔드가 `/api` 상대경로로 요청하는지 확인합니다.

잘못된 예:

```javascript
fetch("http://10.10.20.6:8080/api/health")
```

올바른 예:

```javascript
fetch("/api/health")
```

브라우저는 Private IP에 직접 접근할 수 없으므로 반드시 Apache 프록시를 거쳐야 합니다.

### 21-5. GitHub Actions에서 SSH 접속 실패

확인할 것:

- `PUBLIC_HOST`가 Public 서버 공인 IP인지 확인
- `PUBLIC_USER`가 맞는지 확인
- `PUBLIC_SSH_KEY`에 private key 전체 내용이 들어갔는지 확인
- Public 서버 ACG의 TCP 22 접근소스가 GitHub Actions 접속을 허용하는지 확인
- Public 서버의 `~/.ssh/cloud_private_key`로 Private 서버 접속이 되는지 확인

### 21-6. GitHub Actions에서 backend 배포는 됐는데 서비스 재시작 실패

Private 서버에서 확인합니다.

```bash
systemctl status cloudproject
journalctl -u cloudproject -n 100 --no-pager
```

서비스 파일이 없으면 17장 systemd 설정을 먼저 진행해야 합니다!
