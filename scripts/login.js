window.twilioChat = window.twilioChat || {};

function login() {
    const convParams = new URLSearchParams(window.location.search);
    const conv = Object.fromEntries(convParams.entries());

    if (conv.sid && conv.name) {
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
            withCredentials: true,
            data: body
        })
            .then(() => {
                location.href = '/pages/chat.html';
            })
            .catch((error) => {
                console.log(error);
                // location.href = "/pages/error.html";
            });
    } else {
        location.href = '/pages/conversation.html';
    }
}
