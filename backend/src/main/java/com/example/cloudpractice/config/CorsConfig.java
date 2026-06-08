package com.example.cloudpractice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * ========================================
 * CORS (Cross-Origin Resource Sharing) 설정
 * ========================================
 * 
 * 브라우저는 보안상 다른 Origin으로의 API 요청을 차단합니다.
 * 개발/실습 환경에서는 프론트엔드와 백엔드의 Origin이 다를 수 있으므로
 * CORS를 허용해야 합니다.
 * 
 * 수업 실습 환경에서는 모든 Origin을 허용하지만,
 * 실제 운영 환경에서는 반드시 허용할 Origin을 제한해야 합니다.
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // ⚠️ 실습용: 모든 Origin 허용
                        // 🚨 운영 환경에서는 아래처럼 특정 Origin만 허용해야 합니다!
                        // 예시: .allowedOrigins("https://yourdomain.com")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
                        // ⚠️ allowCredentials(true)와 allowedOrigins("*")는 동시 사용 불가
                        // 운영 환경에서 쿠키/인증이 필요하면:
                        // .allowedOrigins("https://yourdomain.com")
                        // .allowCredentials(true)
            }
        };
    }
}
