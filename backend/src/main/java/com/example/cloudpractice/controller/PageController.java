package com.example.cloudpractice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ========================================
 * 페이지 컨트롤러
 * ========================================
 * 
 * GET / 요청 시 간단한 HTML 페이지를 반환합니다.
 * 브라우저에서 백엔드 서버에 직접 접속했을 때
 * 정상 동작 여부를 빠르게 확인할 수 있습니다.
 * 
 * 실제 운영에서는 React 프론트엔드가 Public Apache에서 제공되므로
 * 이 페이지는 직접 노출되지 않습니다.
 */
@RestController
public class PageController {

    /**
     * 루트 경로 접속 시 HTML 반환
     * Private 서버에서 curl http://localhost:8080/ 으로 테스트 가능
     */
    @GetMapping(value = "/", produces = "text/html;charset=UTF-8")
    public String home() {
        return """
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>Spring Boot Backend</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
                        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                        p { color: #555; line-height: 1.6; }
                        a { color: #3498db; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        ul { list-style: none; padding: 0; }
                        li { margin: 8px 0; padding: 8px 12px; background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                    </style>
                </head>
                <body>
                    <h1>🚀 Apache to Spring Boot 실습</h1>
                    <p>Public Apache 서버에서 Private Spring Boot 서버로 Reverse Proxy 연결 확인</p>
                    <h2>📋 API 목록</h2>
                    <ul>
                        <li><a href="/api/health">/api/health</a> - 서버 상태 확인</li>
                        <li><a href="/api/server-info">/api/server-info</a> - 서버 정보 조회</li>
                        <li><a href="/api/students">/api/students</a> - 학생 목록 조회</li>
                    </ul>
                </body>
                </html>
                """;
    }
}
