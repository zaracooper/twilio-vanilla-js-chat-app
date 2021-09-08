window.twilioChat = window.twilioChat || {};

function createConversation() {
    let convoForm = document.getElementById('convoForm');
    let formData = new FormData(convoForm);

    let body = {};
    for (const entry of formData.entries()) {
        { body[entry[0]] = entry[1] };
    }

    let submitBtn = document.getElementById('submitConvo');
    submitBtn.innerHTML = "Creating..."
    submitBtn.disabled = true;
    submitBtn.style.cursor = 'wait';

    axios.request({
        url: '/api/conversations',
        baseURL: 'http://localhost:8000',
        method: 'post',
        withCredentials: true,
        data: body
    })
        .then(() => {
            window.twilioChat.username = body.username;
            location.href = '/pages/chat.html';
        })
        .catch(() => {
            location.href = '/pages/error.html';
        });
}