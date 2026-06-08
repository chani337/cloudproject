package com.example.cloudpractice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * ========================================
 * 헬스체크 & 서버 정보 컨트롤러
 * ========================================
 * 
 * /api/health     - 서버 상태 확인 (UP/DOWN)
 * /api/server-info - 서버 역할 및 포트 정보
 * 
 * 이 API들은 Apache Reverse Proxy 설정이 정상 동작하는지
 * 확인하는 용도로 사용합니다.
 * 
 * 테스트 순서:
 * 1. Private 서버에서: curl http://localhost:8080/api/health
 * 2. Public 서버에서:  curl http://10.10.20.6:8080/api/health
 * 3. 브라우저에서:     http://퍼블릭IP/api/health
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * 서버 상태 확인 API
     * Apache → Spring Boot 연결이 되면 이 응답이 브라우저까지 전달됩니다.
     */
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "UP",
                "message", "Spring Boot backend is running"
        );
    }

    /**
     * 서버 정보 API
     * Private 서버의 역할과 포트 정보를 반환합니다.
     * 이 정보가 브라우저에 표시되면 Reverse Proxy가 정상 동작하는 것입니다.
     */
    @GetMapping("/server-info")
    public Map<String, Object> serverInfo() {
        return Map.of(
                "server", "private-spring-boot",
                "role", "WAS",
                "port", 8080,
                "description", "This server runs inside a private subnet"
        );
    }
}
