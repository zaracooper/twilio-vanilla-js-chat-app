const initClient = async function () {
    try {
        const response = await axios.request({
            url: '/auth/token',
            baseURL: 'http://localhost:8000',
            method: 'get',
            withCredentials: true
        });

        console.log(response.data.token);

        window.client = await Twilio.Conversations.Client.create(response.data.token);
    }
    catch {
        location.href = "/pages/login.html";
    }
};

initClient();
