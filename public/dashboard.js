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
    
    // 사용자 정보 표시
    document.getElementById('userInfo').textContent = `👤 ${user.username}`;
    document.getElementById('welcomeMessage').textContent = `환영합니다, ${user.username}님!`;
    document.getElementById('myUsername').textContent = user.username;
    document.getElementById('myRole').textContent = user.role;

    // 관리자인 경우 관리자 화면 버튼 표시
    if (user.role === 'Administrator') {
        document.getElementById('adminButton').style.display = 'inline-block';
    }
}

// 관리자 화면으로 이동
function goToAdmin() {
    window.location.href = 'admin.html';
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}
