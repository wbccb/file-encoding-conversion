/**
 * 1. 读取某个文件夹下面的所有文件
 * 2. 读取
 */
const fs = require("fs");
const chardet = require("chardet");
const jschardet = require("jschardet");
const encoding = require("encoding");

const writeFileOptions = {
    encoding: "utf8",
    flag: "w",
    mode: 0o666
};

function fileCallBack(err, filePath, encodingName) {
    // fs.writeFile的回调函数，检测是否覆写成功
    if (err) {
        console.info("错误！！", err, "filePath:" + filePath, " 原来的格式是:" + encodingName);
    } else {
        console.info("写入文件成功，文件格式已经改为utf-8", "filePath:" + filePath, " 原来的格式是:" + encodingName);
    }
}

function readDirectory(dirPath) {
    console.clear();
    if (!fs.existsSync(dirPath)) {
        console.info("请将文件放入" + dirPath + "中");
        return;
    }

    const files = fs.readdirSync(dirPath);

    if (files.length <= 0) {
        console.info("请将文件放入" + dirPath + "中，目前数量为空");
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = dirPath + "/" + file;
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            // 如果拿到的仍然是目录
            readDirectory(filePath);
        } else if (stats.isFile()) {
            // 如果拿到的是文件
            const buffer = fs.readFileSync(filePath);
            const info = jschardet.detect(buffer);
            if (info.encoding === "GB2312" || info.encoding === "ascii") {
                const resultBuffer = encoding.convert(buffer, "utf-8", info.encoding);
                fs.writeFile(filePath, resultBuffer, writeFileOptions, (err) => {
                    fileCallBack(err, filePath, info.encoding);
                });
            } else if (info.encoding !== "UTF-8" && chardet.detectFileSync(filePath) !== "UTF-8") {
                if (buffer.toString().indexOf("\r\n") > -1) {
                    const resultBuffer = encoding.convert(buffer, "UTF-8", "GBK");
                    fs.writeFile(filePath, resultBuffer, writeFileOptions, (err) => {
                        fileCallBack(err, filePath, info.encoding);
                    });
                }
            } else if (info.encoding === "UTF-8") {
                console.info("本来就是utf-8", "filePath:" + filePath);

            }
        }
    }
}

readDirectory("data");