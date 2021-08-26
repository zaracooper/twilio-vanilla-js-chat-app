window.twilioChat = window.twilioChat || {};

function getConversation() {
    const convParams = new URLSearchParams(window.location.search);
    const conv = Object.fromEntries(convParams.entries());

    if (conv.sid && conv.name) {
        window.twilioChat.joinConversation = conv;
    } else {
        location.href = '/pages/conversation.html';
    }
}

function login() {
    let loginForm = document.getElementById('loginForm');
    let formData = new FormData(loginForm);
    let body = {};
    for (const entry of formData.entries()) {
        { body[entry[0]] = entry[1] };
    }

    axios.request({
        url: '/auth/token',
        baseURL: 'http://localhost:8000',
        method: 'post',
        withCredentials: true,
        data: body
    })
        .then(function () {
            location.href = '/pages/conversation.html';
        })
        .catch(function () {
            location.href = "/pages/error.html";
        });
}

getConversation();