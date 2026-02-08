// 페이지 로드 시 권한 확인
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// 권한 확인
function checkAuth() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userStr);
    
    // 선생님이 아닌 경우 접근 차단
    if (user.role !== 'Teacher') {
        alert('선생님만 접근할 수 있습니다.');
        window.location.href = 'login.html';
        return;
    }

    // 사용자 정보 표시
    document.getElementById('userInfo').textContent = `👨‍🏫 ${user.name || user.username}`;
    document.getElementById('welcomeMessage').textContent = `환영합니다, ${user.name || user.username} 선생님!`;
    document.getElementById('myName').textContent = user.name || user.username;
    document.getElementById('myUsername').textContent = user.username;
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}
