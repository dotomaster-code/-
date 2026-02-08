// 로그인 처리
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // 로그인 성공 - 세션 저장
            sessionStorage.setItem('user', JSON.stringify(data.user));
            
            // 역할에 따라 다른 페이지로 이동
            if (data.user.role === 'Administrator') {
                // 관리자는 관리자 화면으로
                window.location.href = 'admin.html';
            } else if (data.user.role === 'Teacher') {
                // 선생님은 선생님 대시보드로
                window.location.href = 'teacher.html';
            } else if (data.user.role === 'Student') {
                // 학생은 학생 대시보드로
                window.location.href = 'student.html';
            } else {
                // 기타는 일반 대시보드로
                window.location.href = 'dashboard.html';
            }
        } else {
            alert(data.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
    }
}

// 엔터키로 로그인
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin(e);
            }
        });
    }
});
