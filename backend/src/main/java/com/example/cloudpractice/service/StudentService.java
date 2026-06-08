package com.example.cloudpractice.service;

import com.example.cloudpractice.dto.StudentRequest;
import com.example.cloudpractice.dto.StudentResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ========================================
 * 학생 서비스 (비즈니스 로직)
 * ========================================
 * 
 * DB를 사용하지 않으므로 메모리(List)에 데이터를 저장합니다.
 * 서버를 재시작하면 데이터가 초기화됩니다.
 * 
 * 이 프로젝트의 핵심 목표는 Apache → Spring Boot 통신 확인이므로
 * DB 연동은 의도적으로 제외했습니다.
 */
@Service
public class StudentService {

    // 메모리 기반 학생 목록 (DB 대신 사용)
    private final List<StudentResponse> students = new ArrayList<>();

    // ID 자동 증가를 위한 카운터 (thread-safe)
    private final AtomicInteger idCounter = new AtomicInteger(0);

    /**
     * 생성자: 초기 학생 데이터 3건을 등록합니다.
     * DB를 사용하지 않으므로 하드코딩된 샘플 데이터를 사용합니다.
     */
    public StudentService() {
        students.add(new StudentResponse(idCounter.incrementAndGet(), "김민수", "Spring Boot", "수강중"));
        students.add(new StudentResponse(idCounter.incrementAndGet(), "이서연", "Cloud Deployment", "수강중"));
        students.add(new StudentResponse(idCounter.incrementAndGet(), "박지훈", "Apache Reverse Proxy", "완료"));
    }

    /**
     * 전체 학생 목록 조회
     * GET /api/students 에서 호출
     */
    public List<StudentResponse> getAllStudents() {
        return students;
    }

    /**
     * 학생 등록
     * POST /api/students 에서 호출
     * 
     * @param request 등록할 학생 정보 (이름, 과정명)
     * @return 등록된 학생 정보 (자동 생성된 ID와 "등록완료" 상태 포함)
     */
    public StudentResponse addStudent(StudentRequest request) {
        StudentResponse newStudent = new StudentResponse(
                idCounter.incrementAndGet(),
                request.getName(),
                request.getCourse(),
                "등록완료"
        );
        students.add(newStudent);
        return newStudent;
    }
}
