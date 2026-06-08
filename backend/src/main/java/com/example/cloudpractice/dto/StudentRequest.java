package com.example.cloudpractice.dto;

/**
 * ========================================
 * 학생 등록 요청 DTO (Data Transfer Object)
 * ========================================
 * 
 * POST /api/students 요청 시 클라이언트가 보내는 JSON 형식:
 * {
 *   "name": "홍길동",
 *   "course": "Spring Boot"
 * }
 * 
 * Lombok을 사용하지 않으므로 getter/setter를 직접 작성합니다.
 */
public class StudentRequest {

    private String name;
    private String course;

    // 기본 생성자 (JSON 역직렬화에 필요)
    public StudentRequest() {
    }

    public StudentRequest(String name, String course) {
        this.name = name;
        this.course = course;
    }

    // Getter & Setter
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }
}
