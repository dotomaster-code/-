// 전역 변수
let users = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

// 사용자 목록 로드
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        users = await response.json();
        displayUsers(users);
        updateStats();
    } catch (error) {
        console.error('사용자 로드 오류:', error);
        alert('사용자 목록을 불러오는데 실패했습니다.');
    }
}

// 사용자 목록 표시
function displayUsers(usersToDisplay) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    usersToDisplay.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <span class="status-badge status-${user.status.toLowerCase()}">
                    ${user.status}
                </span>
            </td>
            <td>${user.createdAt}</td>
            <td>
                <button class="btn btn-edit" onclick="editUser(${user.id})">✏️ 수정</button>
                <button class="btn btn-delete" onclick="deleteUser(${user.id})">🗑️ 삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 통계 업데이트
function updateStats() {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;

    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('inactiveUsers').textContent = inactive;
}

// 사용자 검색
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    displayUsers(filtered);
}

// 추가 모달 열기
function openAddModal() {
    document.getElementById('modalTitle').textContent = '새 계정 추가';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').style.display = 'block';
}

// 수정 모달 열기
async function editUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        const user = await response.json();

        document.getElementById('modalTitle').textContent = '계정 수정';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('status').value = user.status;
        document.getElementById('userModal').style.display = 'block';
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        alert('사용자 정보를 불러오는데 실패했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
}

// 사용자 저장 (추가/수정)
async function saveUser(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        status: document.getElementById('status').value
    };

    try {
        let response;
        if (userId) {
            // 수정
            response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        } else {
            // 추가
            response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        }

        if (response.ok) {
            closeModal();
            loadUsers();
            alert(userId ? '계정이 수정되었습니다.' : '새 계정이 추가되었습니다.');
        } else {
            throw new Error('저장 실패');
        }
    } catch (error) {
        console.error('저장 오류:', error);
        alert('계정 저장에 실패했습니다.');
    }
}

// 사용자 삭제
async function deleteUser(id) {
    if (!confirm('정말로 이 계정을 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadUsers();
            alert('계정이 삭제되었습니다.');
        } else {
            throw new Error('삭제 실패');
        }
    } catch (error) {
        console.error('삭제 오류:', error);
        alert('계정 삭제에 실패했습니다.');
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}
