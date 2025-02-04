function canvasToImageFile(canvas, originFile, ratio) {
    return new Promise((resolve, reject) => {
        // 转为文件
        // canvas转为blob并上传
        canvas.toBlob(function (blobObj) {
            // 转为了二进制
            let genFileObj = new File([blobObj], originFile.name, { type: originFile.type });
            console.log("正在判断是否要使用压缩上传：压缩后的大小：" + genFileObj.size + "，原始大小：" + originFile.size);
            // 最终决定是否要使用压缩的上传
            resolve(genFileObj.size < originFile.size ? genFileObj : originFile);
            canvas.remove();
        }, originFile.type, ratio); // 属于压缩关键第二部分
    });
}

// 判断是否为图片
function isImageFile(file) {
    if (file != null && file.type.indexOf("image") >= 0) return true;
    return false;
}

function ImgFileCheckCompression(originFile) {
    return new Promise((resolve, reject) => {
        let config = JSON.parse(localStorage.getItem("config"));
        let compressionConfig = config?.compression_config ?? '0.9:600:0.9';
        if (config?.compression !== 1 || !isImageFile(originFile)) {
            // 如果逻辑回调返回false表示不进行压缩，则  originFile 就是压缩的对象，等于没压缩
            resolve(originFile);
            return;
        }
        let compression_config_arr = compressionConfig.split(":");
        let widthWithHeightRatio = parseFloat(compression_config_arr[0]);
        let minWidth = parseFloat(compression_config_arr[1]);
        let ratio = parseFloat(compression_config_arr[1]); // 属于压缩关键第二部分

        console.log("进入压缩逻辑", widthWithHeightRatio, minWidth, ratio);
        // 开始准备获取图片原始大小（高度，宽度）
        let reader = new FileReader();
        reader.readAsDataURL(originFile);
        let img = new Image();
        reader.onload = e => {
            let path = e.currentTarget.result;
            img.src = path;
            img.onload = function () {
                // 获取到了宽度与高度
                const originHeight = img.height;
                const originWidth = img.width;
                if(originWidth * widthWithHeightRatio < minWidth) {
                    resolve(originFile);
                    return;
                }
                // 计算出压缩后的宽度与高度，如果压缩后宽度小于600，使用原始图片宽高
                let compressedWidth = originWidth * widthWithHeightRatio;
                let compressedHeight = originHeight * widthWithHeightRatio;
                
                console.log("压缩前(w/h): ",originWidth,originHeight, "压缩后的尺寸(w/h): ", compressedWidth, compressedHeight);
                // 将图片绘制canvas中
                
                const canvas = document.createElement('canvas');
                canvas.width = compressedWidth;
                canvas.height = compressedHeight;
                $("#canvas_box").append(canvas);
                var ctx = canvas.getContext("2d");
                // 将canvas绘制到页面中
                ctx.drawImage(img, 0, 0, compressedWidth, compressedHeight);
                // 到这里已经将图片绘制了，但我们将之隐藏了，因为用于压缩 ，所以无需显示
                canvasToImageFile(canvas, originFile, ratio).then(compressedFile => resolve(compressedFile));
            }
        };
    });
}

export default ImgFileCheckCompression;;