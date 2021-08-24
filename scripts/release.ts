import axios from 'axios';

(async() => {
  const releasesInfo = await axios({
    url: ' https://api.github.com/repos/raxjs/rax-app/releases/latest',
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    },
  });
  const response = await axios({
    url: process.env.DING_WEBHOOK,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    data: {
      msgtype: 'markdown',
      "markdown": {
        "title": releasesInfo.data.name,
        "text": `### Rax App released ${releasesInfo.data.name}
        \n ${releasesInfo.data.body}
        \n ##### [Release 详情](${releasesInfo.data.html_url})`
      }
    },
  });
  console.log('notify success', response.data);
})();
