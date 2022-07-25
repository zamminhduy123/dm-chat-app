const img = document.getElementById("photo");

var photoData = {};

const render = (imageMessage) => {
  const loadImage = (imageMessage) => {
    photoData = imageMessage;
    console.log(imageMessage);
    img.src = photoData.content.content;
    //avatar sender
    // const avatar = document.getElementById("sender-avatar");
    // avatar.src = imageMessage.avatar;
    // //sender name
    // const name = document.getElementById("sender-name");
    // name.innerText = imageMessage.name;
    //last sent
    const sendTime = document.getElementById("send-time");
    sendTime.innerText = new Date(imageMessage.create_at).toDateString();
  };

  var i = 1.0;
  function zoomin() {
    i += 0.3;
    img.style.transform = "scale(" + i + ")";
  }

  var deg = 0;
  function rotateRight() {
    deg += 90;
    img.style.transform = "rotate(" + deg + "deg)";
  }

  function zoomout() {
    i -= 0.3;
    img.style.transform = "scale(" + i + ")";
  }

  function fit() {
    i = 1.0;
    img.style.transform = "scale(" + i + ")";
  }

  async function download() {
    // console.log(window.electronAPI.files.downloadFile, content, "name");
    await window.electronAPI.files.downloadFile(
      photoData.content.content,
      photoData.name
    );
  }

  loadImage(imageMessage);
  document.getElementById("zoomin-btn").addEventListener("click", zoomin);
  document.getElementById("zoomout-btn").addEventListener("click", zoomout);
  document.getElementById("fit-btn").addEventListener("click", fit);
  document
    .getElementById("rotateRight-btn")
    .addEventListener("click", rotateRight);
  document.getElementById("download-btn").addEventListener("click", download);
};

window.onload = (event) => {
  window.electronAPI.photo.loadUrl(render);
};
