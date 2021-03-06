import { config } from '../config/index'
import initdata from './database'
import { loader, setRootfont } from '../util/index'
import { playPlugVideo, playHtml5Video } from './video'
import bindKeyEvent from './keyevent'

const svgsheet = 'content/gallery/svgsheet.css'

/**
 * 加载css
 * @return {[type]} [description]
 */
const loadcss = (callback) => {
    //加载横版或者竖版css
    //nodeBuildMode 是node build下的test.html文件
    //加载build/*.css压缩文件
    //否则就是默认的css/*.css
    let baseCss = window.nodeBuildMode ? window.nodeBuildMode.csspath : './css/' + (config.layoutMode) + '.css'
    let cssArr = [baseCss, svgsheet]

    //是否需要加载svg
    //如果是ibooks模式
    //并且没有svg
    //兼容安卓2.x
    if (Xut.IBooks.Enabled && !Xut.IBooks.existSvg) {
        cssArr = [baseCss]
    }

    loader.load(cssArr, callback, null, true);
}

/**
 * 加载app应用
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
const loadApp = () => {
    //修正API接口
    //iframe要要Xut.config
    config.revised();
    loadcss(() => {
        setRootfont()
        initdata()
    });
}


/**
 * 如果是安卓桌面端
 * 绑定事件
 * 创建数据库
 * @return {[type]} [description]
 */
const creatDatabase = () => {
    //安卓上
    if (Xut.plat.isAndroid) {
        //预加载处理视频
        //妙妙学不加载视频
        //读库不加载视频
        if (!window.MMXCONFIG && !window.DUKUCONFIG) {
            playPlugVideo();
        }

        //不是子文档指定绑定按键
        if (!window.SUbCONFIGT) {
            Xut.Application.AddEventListener = () => {
                window.GLOBALCONTEXT.document.addEventListener("backbutton", config._event.back, false);
                window.GLOBALCONTEXT.document.addEventListener("pause", config._event.pause, false);
            }
        }
    }

    if (window.DUKUCONFIG) {
        PMS.bind("MagazineExit", () => {
            PMS.unbind();
            Xut.Application.DropApp();
        }, "*")
    }

    loadApp()
}


export default function() {

    //绑定键盘事件
    bindKeyEvent(config)

    //如果不是读库模式
    //播放HTML5视频
    //在IOS
    if (!window.DUKUCONFIG && !window.GLOBALIFRAME && Xut.plat.isIOS) {
        playHtml5Video();
    }

    //Ifarme嵌套处理
    //1 新阅读
    //2 子文档
    //3 pc
    //4 ios/android
    if (window.GLOBALIFRAME) {
        creatDatabase()
    } else {
        //brower or mobile(apk or ipa)
        if (config.isBrowser) {
            loadApp()
        } else {
            window.openDatabase(config.dbName, "1.0", "Xxtebook Database", config.dbSize);
            document.addEventListener("deviceready", () => {
                Xut.Plugin.XXTEbookInit.startup(config.dbName, creatDatabase, () => {});
            }, false)
        }
    }

}
