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

    axios.request({
        url: '/api/conversations',
        baseURL: 'http://localhost:8000',
        method: 'post',
        withCredentials: true,
        data: body
    })
        .then(function () {
            location.href = '/pages/chat.html';
        })
        .catch(function () {
            location.href = '/pages/error.html';
        });
}