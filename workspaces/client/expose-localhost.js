const ngrok = require('@ngrok/ngrok');

if (process.env.NGROK_ENABLED !== 'true') {
    console.info('Ngrok is not enabled.');
    process.exit(0);
}

ngrok.connect({
    addr: 4000,
    authtoken: process.env.NGROK_AUTHTOKEN,
    domain: process.env.NGROK_DOMAIN
})
.then(listener => console.info(`Exposed to ${listener.url()}`));

process.stdin.resume();
