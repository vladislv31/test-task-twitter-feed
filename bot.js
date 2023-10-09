let idx = 0;

function sendTweet() {
  const currentIdx = idx++;
  const messageContent = {
    message: `${currentIdx}: test`,
  };

  fetch('http://localhost:3000/messages/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageContent),
  })
    .then((_) => {
      console.log(`${currentIdx} request was sent`);
    })
    .catch((error) => {
      console.error('Ошибка при отправке твита:', error);
    });
}

function startBot(intervalSeconds) {
  setInterval(sendTweet, intervalSeconds);
}

// Чтение аргументов командной строки
const args = process.argv.slice(2);
const intervalSeconds = parseInt(args[0], 10);

if (!intervalSeconds) {
  console.error(
    'Пожалуйста, укажите интервал в секундах как аргумент командной строки.',
  );
  process.exit(1);
}

startBot(intervalSeconds);
