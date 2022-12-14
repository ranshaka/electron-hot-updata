
import {electronHotupdata} from "electron-hot-updata"
const electronHotupdatas= new electronHotupdata(this)
const path = require('path');
const baseUrl = path.resolve("./") + "/resources/";
import {
    ipcMain,
    app
} from 'electron'
let mainWindow:any=null
export function updateAva(windows:any,exeUrl:string,Version:string){
    mainWindow=windows
    console.log(baseUrl)
    // 设置版本号
    electronHotupdatas.setnewVersion(exeUrl,Version)

    // electronHotupdatas.on("startLoop",(message:any)=>{
    //     sendHotUpdateMessage({
    //         cmd: 'startLoop',
    //         message: message
    //     })
    // })

    // 监听获取版本失败
    electronHotupdatas.on("get-version-failed",(message:any)=>{
        sendHotUpdateMessage({
            cmd: 'get-version-failed',
            message: message
        })
    })

    // 监听没有新版本
    electronHotupdatas.on("no-new-version",(message:any)=>{
        sendHotUpdateMessage({
            cmd: 'no-new-version',
            message: message
        })
    })

    // 监听有新版本  可更新
    electronHotupdatas.on("new-version-available",(message:any)=>{
        sendHotUpdateMessage({
            cmd: 'new-version-available',
            message: message
        })
    })

     // 监听获取版本失败 更新失败
     electronHotupdatas.on("downloaded-failed",(message:any)=>{
        sendHotUpdateMessage({
            cmd: 'downloaded-failed',
            message: message
        })
     })

    // 监听更新完成
    electronHotupdatas.on("complete-downloaded",()=>{
        console.log('更新完成')

        app.relaunch()
        app.exit()
        
        console.log('更新完成2')
    })

    // 监听更新完成
    ipcMain.on("start-updata",(message:any)=>{
       
        electronHotupdatas.startUpdata()
    })
    // 监听更新完成
    ipcMain.on("startLoop",(message:any)=>{
       
        electronHotupdatas.startLoop()
    })

}


//给渲染进程发送消息
function sendHotUpdateMessage(text:any) {
    mainWindow.webContents.send('hotMessage', text)
}
