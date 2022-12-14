<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div>electron 自动热更新</div>
  <div>查看版本</div>
  <HelloWorld v-if="!modalVisible" msg="Welcome to Your Vue.js + TypeScript App" />
  <div v-else style="border:10px solid pink;width:200px;height:200px;margin:0 auto;">
    <div v-if="!isUpdatte" @click="startUpdata"
      style="border:1px solid aqua;width:80px;height:40px;margin:30px auto;">更新版本</div>
      <div>进度条 {{progress}} %</div>
  </div>

</template>

<script lang="ts">
import {
    Options,
    Vue
  } from 'vue-class-component';
  import HelloWorld from './components/HelloWorld.vue';

  const ipcRenderer = (window as any).ipcRenderer

  @Options({
    components: {
      HelloWorld,
    },
  })
  export default class App extends Vue {
    modalVisible = false
    percent = 0
    isUpdatte = false;
    progress=0

    startUpdata(){
      ipcRenderer.send("start-updata");
    }

    created() {
      let _this = this;
      if(ipcRenderer){
        window.setInterval(() => {
        console.log("循环开始检查更新....")
        ipcRenderer.send("startLoop");
      }, 10000);

      ipcRenderer.on("hotMessage", (event: any, arg: any) => {
        console.log(arg);
          if(arg.cmd == 'new-version-available'){
            _this.modalVisible=true
          }else if(arg.cmd == 'downloaded-failed'){
            console.log('更新失败')
          }else if(arg.cmd == 'downloaded-progressNumber'){
            console.log('获取跟新进度'+arg.message)
            _this.progress=arg.message
          }else if(arg.cmd == 'complete-downloaded'){
            console.log('更新完成')

            // 更新完成 立即 重启程序
            ipcRenderer.send("relaunch");
          }
      });
   
      }
   
   
    }

  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>