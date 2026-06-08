package com.example.cloudpractice.controller;

import com.example.cloudpractice.dto.StudentRequest;
import com.example.cloudpractice.dto.StudentResponse;
import com.example.cloudpractice.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ========================================
 * 학생 컨트롤러 (REST API)
 * ========================================
 * 
 * GET  /api/students  - 전체 학생 목록 조회
 * POST /api/students  - 신규 학생 등록
 * 
 * 프론트엔드(React)에서 fetch("/api/students")로 호출합니다.
 * 
 * 요청 흐름:
 * 브라우저 → Apache(Public) → Reverse Proxy → Spring Boot(Private) → 이 컨트롤러
 */
@RestController
@RequestMapping("/api")
public class StudentController {

    // StudentService를 생성자 주입 (Lombok 없이 직접 작성)
    private final StudentService studentService;

    /**
     * 생성자 주입 (Constructor Injection)
     * Spring이 StudentService 빈을 자동으로 주입합니다.
     * @Autowired는 생성자가 하나일 때 생략 가능합니다.
     */
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * 학생 목록 조회 API
     * 
     * 요청: GET /api/students
     * 응답: JSON 배열 형태의 학생 목록
     */
    @GetMapping("/students")
    public List<StudentResponse> getStudents() {
        return studentService.getAllStudents();
    }

    /**
     * 학생 등록 API
     * 
     * 요청: POST /api/students
     * Body: { "name": "홍길동", "course": "Spring Boot" }
     * 응답: 등록된 학생 정보 (id, status 자동 생성)
     * 
     * @RequestBody는 JSON 요청 본문을 StudentRequest 객체로 변환합니다.
     */
    @PostMapping("/students")
    public StudentResponse addStudent(@RequestBody StudentRequest request) {
        return studentService.addStudent(request);
    }
}
