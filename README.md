# electron-hot-updata

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Contributing](../CONTRIBUTING.md)

## About <a name = "about"></a>

electron的项目用 electron 自动更新，更新之后需要手动安装程序，有需求就有产出;

electron-hot-updata插件，使用本插件热更新，动态替换electron 执行文件达到热更新;

## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them.

```
npm i electron-hot-updata
```

### Installing

A step by step series of examples that tell you how to get a development env running.

#### 1.  因为electron 默认是安装在C:\Program Files\ 目录下 操作文件需要管理员权限;
// 在electron-build 的package.json 里面配置权限;

// 我的项目是基于vue  我就直接在vue.config.js 里面配置
```
    //因为electron 默认是安装在C:\Program Files\ 目录下 操作文件需要管理员权限;
     module.exports = {
        ...,
         "win": { 
            "requestedExecutionLevel": "highestAvailable" // highestAvailable 最高权限
        },
    }


```
#### 2.   配置项目服务器地址 
```
    // vue.config.js
    1.配置项目服务器地址 
    module.exports = {
        ...,
        publish: [{
           "provider": "generic",
           url: "http://192.168.0.191/electron/" // 更新文件服务器地址 放你后台的地址
         }],
     }
        配置之后执行electron-build 打包之后会自动生成 latest.yml 文件

    2.sasr 配置   //看你自己需求  可有可无
    module.exports = {
        ...,
        sasr: false  //  执行文件是否打包成sasr文件
     }

    sasr:false   // 打包出来的就是 html + css + js   
    sasr:true   // 打包之后就是sasr 文件

    ##
    http://192.168.0.191/electron/ 下面存放两个文件
        latest.yml      
            系统打包之后自动生成
        app.zip     
            //app.zip 分两种情况
            1.sasr:false 
                项目/dist_electron/win-unpacked/resources/  下找到app文件夹 打包成 app.zip 文件
            2.sasr:true 
                 项目/dist_electron/win-unpacked/resources/  下找到 app.sasr文件 打包成app.zip 文件  
        
```

#### 3.  版本号  如果你有更好的修改项目版本号办法  直接无视这一块
```
    electron 版本区分默认依靠 项目>package.json>version;
    所有每次打包之后 都要修改版本号 ；
    靠版本号来区分是否需要更新
    

    在vue.cinfog.js 里面添加以下代码  
    <!-- 一下代码每次运行项目都会修改版本号 -->

    const path = require('path')
    const fs = require('fs');
    const resolve=(dir)=> {
        return path.join(__dirname, dir)
    }
    const AddZero = (time)=> {
        if (time < 10) {
            return "0" + time
        } else {
            return time
        }
    }
    let packageTxt = fs.readFileSync('./package.json', 'utf8');
    let versionData = packageTxt.split('\n');
    let packageJson = JSON.parse(packageTxt);
    let VersionArr = packageJson.version.split('.');
    let date = new Date();
    let today = date.getFullYear() + "" + AddZero((date.getMonth() + 1)) + "" + AddZero(date.getDate())
    if (today == VersionArr[1]) {
        VersionArr[2] = parseInt(VersionArr[2]) + 1
    } else {
        VersionArr[1] = date.getFullYear() + "" + AddZero((date.getMonth() + 1)) + "" + AddZero(date.getDate())
        VersionArr[2] = 1;
    }
    let versionLine = VersionArr.join('.');
    for (let i = 0; i < versionData.length; i++) {
        if (versionData[i].indexOf('"version":') != -1) {
            versionData.splice(i, 1, '  "version": "' + versionLine + '",');
            break;
        }
    }
    fs.writeFileSync('./package.json', versionData.join('\n'), 'utf8');
```


Say what the step will be

```
/demo 目录下有案例
```

