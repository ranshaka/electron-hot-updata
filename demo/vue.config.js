 const path = require('path')
 var webpack = require('webpack');
 const fs = require('fs');
 const AppName = "app"

 function resolve(dir) {
   return path.join(__dirname, dir)
 }


 function AddZero(time) {
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

 // All configuration item explanations can be find in https://cli.vuejs.org/config/

 module.exports = {
   outputDir: 'dist',
   publicPath: './',
   productionSourceMap: false,

   // 简单配置webpack
   configureWebpack: {
     // provide the app's title in webpack's name field, so that
     // it can be accessed in index.html to inject the correct title.
     resolve: {
       alias: {
         '@': resolve('src')
       }
     },
   },
   //  更加细粒化的配置webpack
   //  取自vue-admin-template

   chainWebpack: config => {
     config.module
       .rule('svg')
       .exclude.add(resolve('src/svg-icon'))
       .end()
     config.module
       .rule('icons')
       .test(/\.svg$/)
       .include.add(resolve('src/svg-icon'))
       .end()
       .use('svg-sprite-loader')
       .loader('svg-sprite-loader')
       .options({
         symbolId: 'icon-[name]'
       })
       .end()

   },
   pluginOptions: {
     electronBuilder: {

       // List native deps here if they don't work
       // 原生包必须这里声明下
       externals: ["serialport"],
       //   If you are using Yarn Workspaces, you may have multiple node_modules folders
       //   List them all here so that VCP Electron Builder can find them
       nodeModulesPath: ["../../node_modules", "./node_modules"],
       nodeIntegration: true,
       // 打包配置
       builderOptions: {

         "appId": AppName + versionLine,

         // 发布者名称
         productName: AppName,

         // 安装包名称，可自行配置
         artifactName: AppName + '.exe',

         nsis: {
        
           // "guid": "YOUR GUID",
           // "include": "./installer.nsh",
           // "guid": "com.net.app",
           // "include": "build/installer.nsh",
           // 一键安装，如果设为true，nsis设置就无意义请直接删除 nsis 配置
           oneClick: false,
           // true全用户安装【目录为：C:\Program Files (x86)】，false安装到当前用户
           perMachine: true,
           // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
           allowElevation: true,
           // 允许修改安装目录
           allowToChangeInstallationDirectory: true,
           // 创建桌面图标
           createDesktopShortcut: true,
           // 创建开始菜单图标
           createStartMenuShortcut: true,
           // 快捷方式的名称,默认为应用程序名称
           shortcutName: AppName,
           // 安装图标
           // installerIcon: "./logo.png",// 安装图标
           // uninstallerIcon: "./logo.png",//卸载图标
           // installerHeaderIcon: "./logo.png", // 安装时头部图标
         },
         //  files: [
         //      {
         //        'filter': ['**/*']
         //      }
         //    ],
         //    extraFiles: ['./extensions/'],
        //  asar: true,
         publish: [{
           "provider": "generic",
           url: "http://192.168.0.191/electron/" // 更新文件服务器地址
         }],
         "win": { //  win相关配置
          "requestedExecutionLevel": "highestAvailable"
        
        },
       }
     }
   },


 }