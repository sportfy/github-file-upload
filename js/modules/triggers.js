// 引入要使用的函数
import { UploadFromFile } from './upload.js'
import { viewMap } from '../upload-handles.js'
// 引入 jquery 
import '../jquery.js'


// 从事件对象中获取目标
function targetFromEvent(e) {
  if (e == null) return null;
  e = e || window.event; // 为 IE8 及更早的浏览器提供兼容性
  return e.target || e.srcElement; // 优先使用 e.target，如果不存在，会使用 e.srcElement
}
// 文件挂载-上传统一处理器
let resourceOperator = {
  resource: null,
  showAndUpload(files, isNowUpload = true, getPreUrl) {
    debugger
    if(files == null || (files = [...files].filter(e => e != null)).length == 0) return;
    if(files.length > 1) {
      alert("暂不支持多文件上传，请重新选择你的文件~");
      return;
    }
    let file = files[0];
    if (file == null || Array.isArray(file)) return;
    // 数据挂载
    this.resource = file;
    let isImg = file.type.startsWith("image");
    // 传入的自定义getPreUrl只有是图片的时候才起作用，否则也是用默认的获取preUrl函数
    if (getPreUrl == null || (getPreUrl != null && !isImg)) getPreUrl = function (resolve, reject) {
      let preShowURL = "img/file.svg";
      if (isImg) {
        let windowURL = window.URL || window.webkitURL;
        preShowURL = windowURL.createObjectURL(file);
      }
      resolve(preShowURL);
    }
    new Promise(getPreUrl).then(preShowURL => {
      viewMap.sensingArea(preShowURL)
    })
    // 看是否要立即上传
    if (isNowUpload) this.upload();
  },
  upload() {
    if (this.resource == null) return;
    UploadFromFile(this.resource)
  }
}
// 【选择上传】
$('#myFile').on('input', (e) => resourceOperator.showAndUpload(targetFromEvent(e).files))
// 点击图片进行上传时触发
// $("#img_pre_show").on('click', () => resourceOperator.upload())

// 【粘贴上传】
document.addEventListener('paste', function (e) {
  const clipboardData = (e.clipboardData || window.clipboardData);
  const items = clipboardData.items || clipboardData.files || [];
  // DataTransferItem转File（showAndUpload接收的是File[]对象）
  const files = Array.from(items).filter(item => item.kind === 'file').map(item => item.getAsFile());
  resourceOperator.showAndUpload(files, true, (resolve, reject) => {
    // 将剪贴板项作为Blob提取出来
    const targetFile = files[0];
    const imageFile = targetFile.getAsFile ? targetFile.getAsFile() : targetFile;
    // 使用 FileReader 读取图片文件并显示到页面上
    const reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    };
    reader.readAsDataURL(imageFile);
  });
});

// 【拖拽上传】
$("#choose_img")[0].addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
}, false);
$("#choose_img")[0].addEventListener("drop", function (e) {
  // 处理拖拽文件的逻辑
  e.preventDefault();
  e.stopPropagation();
  var df = e.dataTransfer;
  resourceOperator.showAndUpload(df.files, true)
}, false)

// // 【第四种-开发中】触发: 粘贴资源URL动作
// document.addEventListener('paste', function (e) {
//   var files = e.clipboardData.items;
//   for (var i = 0; i < files.length; i++) {
//     var file = files[i];
//     if(file.kind != "string") continue;
//     file.getAsString(function (sourceUrl){
//       if(sourceUrl.indexOf("http") != 0) return;
//       console.log("*** 是http链接")
//       alert("暂不支持图片链接上传~")
//     });
//   }
// });
