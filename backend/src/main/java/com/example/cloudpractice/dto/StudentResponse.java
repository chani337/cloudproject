package com.example.cloudpractice.dto;

/**
 * ========================================
 * 학생 응답 DTO (Data Transfer Object)
 * ========================================
 * 
 * API 응답으로 클라이언트에게 전달되는 JSON 형식:
 * {
 *   "id": 1,
 *   "name": "김민수",
 *   "course": "Spring Boot",
 *   "status": "수강중"
 * }
 * 
 * Lombok을 사용하지 않으므로 getter/setter를 직접 작성합니다.
 */
public class StudentResponse {

    private int id;
    private String name;
    private String course;
    private String status;

    // 기본 생성자
    public StudentResponse() {
    }

    public StudentResponse(int id, String name, String course, String status) {
        this.id = id;
        this.name = name;
        this.course = course;
        this.status = status;
    }

    // Getter & Setter
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
