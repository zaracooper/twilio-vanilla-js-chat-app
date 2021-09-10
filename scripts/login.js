function login() {
    const convParams = new URLSearchParams(window.location.search);
    const conv = Object.fromEntries(convParams.entries());

    if (conv.sid) {
        let submitBtn = document.getElementById('login-button');
        submitBtn.innerHTML = 'Logging in...';
        submitBtn.disabled = true;
        submitBtn.style.cursor = 'wait';

        let loginForm = document.getElementById('loginForm');
        let formData = new FormData(loginForm);
        let body = {};
        for (const entry of formData.entries()) {
            { body[entry[0]] = entry[1] };
        }

        axios.request({
            url: `/api/conversations/${conv.sid}/participants`,
            baseURL: 'http://localhost:8000',
            method: 'post',
            data: body
        })
            .then(resp => {
                localStorage.setItem('twilioChatToken', resp.data.token);
                localStorage.setItem('twilioChatUsername', resp.data.username);

                location.href = '/pages/chat.html';
            })
            .catch(() => {
                location.href = '/pages/error.html';
            });
    } else {
        location.href = '/pages/conversation.html';
    }
}
