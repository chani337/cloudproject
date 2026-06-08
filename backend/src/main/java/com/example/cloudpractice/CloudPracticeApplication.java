package com.example.cloudpractice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ========================================
 * Spring Boot 메인 클래스
 * ========================================
 * 
 * 이 클래스가 실행되면 내장 Tomcat이 8080 포트에서 시작됩니다.
 * 별도의 Tomcat 설치 없이 WAS(Web Application Server) 역할을 수행합니다.
 * 
 * 실행 방법:
 *   ./mvnw clean package -DskipTests
 *   java -jar target/*.jar
 * 
 * DB를 사용하지 않으므로 실행 즉시 8080 포트가 열립니다.
 */
@SpringBootApplication
public class CloudPracticeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudPracticeApplication.class, args);
    }
}
