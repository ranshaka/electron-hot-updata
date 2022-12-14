const request = require('request')
const events = require("events");
const admZip = require('adm-zip')
const YAML = require('js-yaml');
const utils = require("./utils.js")
const fs = require("fs")
const path = require('path');

const progress = require('progress-stream');
const https = require("https")
const http = require("http")
const baseUrl = path.join(__dirname, '../../resources/')
// const baseUrl = path.join(__dirname,'../dist_electron/bundled/')
class electronHotupdata extends events.EventEmitter {
    constructor(options) {
        super();
        this.provider = ""
        this.newVersion = ""
        this.usedVersion = ""
        this.progressNumber = 0
        this.baseUrl = baseUrl
        this.status = "loop"
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
        if(this.progressNumber)return
        if (!this.provider || !this.newVersion) {
            this.emit("get-version-failed", "版本号/地址不对")
        }
        try {
            request(this.provider + "latest.yml", (error, res, body) => {
                if (!res) {
                    return this.emit("get-version-failed", "获取更新版本号失败")
                }
                if (error || res.statusCode !== 200) {
                    return this.emit("get-version-failed", "获取更新版本号失败" + res)
                }
                let result = YAML.load(body);
                if (result && result.version) {
                    const VersionType = utils.compareVersion(result.version, this.newVersion)
                    this.usedVersion = result.version
                    if (VersionType == 1) {
                       return this.emit("new-version-available", "获取到可更新版本  ====  " + result.version)
                    } else if (VersionType == 0) {
                        this.emit("no-new-version", "当前已经是最新版")
                    } else {
                        this.emit("no-new-version", "获取的老版本")
                    }
                } else {
                    return this.emit("get-version-failed", "获取更新版本号失败")
                }
            })
        } catch (error) {
            return this.emit("get-version-failed", "获取更新版本号失败")
        }
    }
    startUpdata() {
        if (!this.usedVersion || this.usedVersion == this.newVersion) {
            this.emit("no-new-version", "当前已经是最新版  ===  "+this.newVersion)
        }
        this.downLoad().then(res => {
            this.progressNumber=0
            this.emit("downloaded-progressNumber", 100)
            this.emit("complete-downloaded")
        }).catch((error)=>{
            this.progressNumber=0
            throw error
        })
    }

     async downLoad() {
        const stream = fs.createWriteStream(`${this.baseUrl}test.zip`);
        const p = await this.setDownloadProgress(this.provider + "app.zip")
        return new Promise((resolve, reject) => {
            this.emit("no-new-version", `${this.baseUrl}test.zip`)
            request(`${this.provider}app.zip?v=${new Date().getTime()}`).pipe(p).pipe(stream).on('close', (error, res, body) => {
                const unzip = new admZip(`${this.baseUrl}test.zip`);
                unzip.extractAllTo(this.baseUrl, /*overwrite*/ true);
                resolve(null)
            });
        })
    }
    // 获取地址
    async getUrlFileSize(url) {
        return new Promise(r => {
            let h = {
                http,
                https
            }
            let isHttps = url.indexOf("https") != -1
            h[isHttps ? "https" : "http"].get(url, {
                rejectUnauthorized: false
            }, (res) => {
                r(res.headers['content-length'])
            })
        })
    }
    /* 设置下载进度 */
    async setDownloadProgress(url) {
        const that=this
        try {
            let p = progress({
                length: await this.getUrlFileSize(url),
                time: 500
            })
            p.on('progress', progress => {
                let progressNumber=progress.percentage>=99?99:progress.percentage
                that.progressNumber=progressNumber
                that.emit("downloaded-progressNumber", that.progressNumber)
            });
            return p
        } catch (error) {
            that.progressNumber=0
            that.emit("downloaded-progressNumber", "-1")
            return error
             
        }
       
    }


}

module.exports = {
    electronHotupdata
}