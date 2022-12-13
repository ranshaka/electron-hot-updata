const request = require('request')
const events = require("events");
const admZip = require('adm-zip')
const YAML = require('js-yaml');
const compareVersion = require("./utils.js")
const fs = require("fs")
const path = require('path');
const baseUrl = path.join(__dirname, '../../resources/')
 class electronHotupdata extends events.EventEmitter {
    constructor(options) {
        super();
        this.provider = ""
        this.newVersion = ""
        this.usedVersion = ""
        this.baseUrl=baseUrl
    }

    setBaseUrl(baseUrls) {
        this.baseUrl = baseUrls;
    }
    setProvider(provider) {
        this.provider = provider;
    }
    setNewVersion(newVersion) {
        this.newVersion = newVersion;
    }
    startLoop() {
        if (!this.provider || !this.newVersion) {
            this.emit("get-version-failed", "版本号/地址不对")
        }
        try {
            request(this.provider+"latest.yml",(error, res, body) => {
                if (!res) {
                    return this.emit("get-version-failed", "获取更新版本号失败")
                }
                if (error || res.statusCode !== 200) {
                    return this.emit("get-version-failed", "获取更新版本号失败" + res)
                }
                let result = YAML.load(body);
                if(result &&  result.version){
                    const VersionType=compareVersion(result.version,this.newVersion)
                    if(VersionType ==  1){
                         this.emit("new-version-available", "获取到可更新版本 ==== " + result.version )
                    }else if(VersionType==0){
                        this.emit("no-new-version", "当前已经是最新版")
                    }else{
                        this.emit("no-new-version", "当前已经是最新版")
                    }
                }else{
                    return this.emit("get-version-failed", "获取更新版本号失败")
                }
            })
        } catch (error) {
            return this.emit("get-version-failed", "获取更新版本号失败")
        }
    }
    startUpdata() {
        if (!this.usedVersion || this.usedVersion == this.newVersion) {
            this.emit("no-new-version", "当前已经是最新版")
        }
        this.downLoad().then(res => {
            this.emit("complete-downloaded")
        })
    }

    downLoad() {
        return new Promise((resolve, reject) => {
            isFileExisted(this.baseUrl + "app.zip").then(falg => {
                this.emit("no-new-version", `${this.baseUrl}test.zip`)
                const stream = fs.createWriteStream(`${this.baseUrl}test.zip`);
                request(`${this.provider}app.zip?v=${new Date().getTime()}`).pipe(stream).on('close', (error, res, body) => {
                    console.log("开始解压" + this.provider + 'app.zip')
                    const unzip = new admZip(`${this.baseUrl}test.zip`);
                    unzip.extractAllTo(this.baseUrl, /*overwrite*/ true); 
                    resolve(null)
                });
            }).catch(err => {
                this.emit("downloaded-failed", err)
            })
        })

    }



}

module.exports ={
    electronHotupdata
}