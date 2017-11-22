// 配置文件
import { IMGURL, mui, plus, REMOTE, ROOT } from "../config";
const server = ROOT + "static/packge/update.json?" + new Date().getTime(); // 获取升级描述文件服务器地址

// APP更新
export function update() {
    mui.getJSON(server, {
        appid: plus.runtime.appid,
        version: plus.runtime.version,
        imei: plus.device.imei
    }, (data) => {
        plus.runtime.getProperty(plus.runtime.appid, (inf) => {
            console.log("当前应用版本：" + inf.version);
            if (plus.os.name.toLowerCase() !== "ios" && data.status && data.version > inf.version) {
                plus.nativeUI.confirm(data.note, (event) => {
                    if (0 === event.index) {
                        // plus.runtime.openURL(data.url);
                        downWgt(ROOT + data.url);
                    }
                }, data.title, ["立即更新", "取　　消"]);
            }
        });
    });
}

// 设置 cookie
export function setCookie(key: string, value: any, time?: number): void {
    const expires: any = new Date(Date.now() + (time || 86400) * 1000);
    key && value && plus.navigator.setCookie(ROOT, key + "=" + value + "; expires=" + expires.toGMTString().replace(" ", "") + "; path=/");
}

// 获取 cookie
export function getCookie(key: string): string {
    const cookieStr = plus.navigator.getCookie(ROOT);
    const cookieArray = cookieStr && cookieStr.split("; ");
    const cookieValue = cookieArray && cookieArray.find((i) => i.indexOf(key) >= 0);
    if (cookieValue) {
        return cookieValue.split("=")[1];
    } else {
        return key ? "" : plus.navigator.getCookie(ROOT);
    }
}

// 设置应用本地配置
export function setSettings(attr: string, val: any): void {
    const settings = getSettings();
    attr && JSON.stringify(val) ? settings[attr] = val : "";
    plus.storage.setItem("NEO_SETING", JSON.stringify(settings));
}

// 获取应用本地配置
export function getSettings(attr?: string) {
    const settingsText = plus.storage.getItem("NEO_SETING") || "{}";
    return (attr && typeof attr === "string" ? JSON.parse(settingsText)[attr] : JSON.parse(settingsText));
}

export function getProductImg(url: string) {
    return "url(" + (url ? (IMGURL + url) : "assets/images/ndt/bank_avatar.jpg") + ")";
}

export function getImgUrl(url: string) {
    return url ? (IMGURL + url) : "assets/images/ndt/bank_avatar.jpg";
}

export function plusReady(cb) {
    function ready() {
        const webview = plus.webview.currentWebview();
        cb(webview);
    }
    if (plus) {
        ready();
    } else {
        document.addEventListener("plusready", ready, false);
    }
}

// 判断是否为数字字符串
export function IsNumeric(sText) {
    const ValidChars = "0123456789.";
    let IsNumber = true;
    let Char;
    for (let i = 0; i < sText.length && IsNumber === true; i++) {
        Char = sText.charAt(i);
        if (ValidChars.indexOf(Char) === -1) {
            IsNumber = false;
        }
    }
    return IsNumber;
}

// 日期格式化
export function timeFormat(timer, fmt) {
    const that = new Date(timer);
    const o = {
        "M+": that.getMonth() + 1, // 月份
        "d+": that.getDate(), // 日
        "h+": that.getHours(), // 小时
        "m+": that.getMinutes(), // 分
        "s+": that.getSeconds(), // 秒
        "q+": Math.floor((that.getMonth() + 3) / 3), // 季度
        "S": that.getMilliseconds() // 毫秒
    };
    // tslint:disable-next-line:curly
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (that.getFullYear() + "").substr(4 - RegExp.$1.length));
    // tslint:disable-next-line:curly
    for (const k in o)
        // tslint:disable-next-line:curly
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// *号展示身份证和电话
export function replaceNum(idCard, start, end) {
    const strStart = idCard.substr(0, start);
    const strEnd = idCard.substr(idCard.length - end, end);
    // tslint:disable-next-line:curly
    const ss = () => { let s = ""; for (let i = 0; i < idCard.length - (start + end); i++) s += "*"; return s; };
    const strRes = strStart + ss() + strEnd;
    return strRes;
}

// 获取本地是否安装客户端
export function isInstalled(id) {
    if (id === "qihoo" && mui.os.plus) {
        return true;
    }
    if (mui.os.android) {
        const main = plus.android.runtimeMainActivity();
        const packageManager = main.getPackageManager();
        const PackageManager = plus.android.importClass(packageManager);
        const packageName = {
            qq: "com.tencent.mobileqq",
            weixin: "com.tencent.mm",
            sinaweibo: "com.sina.weibo"
        };
        try {
            return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
        } catch (e) { }
    } else {
        switch (id) {
            case "qq":
                const TencentOAuth = plus.ios.import("TencentOAuth");
                return TencentOAuth.iphoneQQInstalled();
            case "weixin":
                const WXApi = plus.ios.import("WXApi");
                return WXApi.isWXAppInstalled();
            case "sinaweibo":
                const SinaAPI = plus.ios.import("WeiboSDK");
                return SinaAPI.isWeiboAppInstalled();
            default:
                break;
        }
    }
}

// 显示errorCode状态
export function showError(code, msg?) {
    switch (code) {
        case 1000:
            mui.toast("用户或记录不存在");
            break;
        case 1001:
            mui.toast("用户或记录已存在");
            break;
        case 1002:
            mui.toast("验证码错误或失效");
            break;
        case 1003:
            mui.toast("验证已过期");
            break;
        case 1004:
            mui.toast("IP限制访问");
            break;
        case 1006:
            mui.toast("账号已失效");
            break;
        case 1007:
            mui.toast("账号或密码错误");
            break;
        case 1100:
        case 1103:
        case 1101:
            mui.toast("token已过期");
            setCookie("access_token", " ", 0.001);
            setSettings("expires", "");
            const user = plus.webview.getWebviewById("user");
            const news = plus.webview.getWebviewById("news.html");
            mui.fire(user, "reloadData", {});
            mui.fire(news, "reloadData", {});
            break;
        case 2000:
            mui.toast("微信登录token失效或超时");
            break;
        case 2001:
            mui.toast("授权成功请绑定账号");
            break;
        case 2002:
            mui.toast("授权用户不存在");
            break;
        case 9998:
            mui.toast("参数错误");
            break;
        case 9999:
            mui.toast("未知错误");
            break;
        default:
            msg && mui.toast(msg);
            break;
    }
}

// 身份证号码验证
export function testIdNumber(id) {
    return (/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(id));
}

// 电话号码
export function testPhone(phone) {
    return /0?(13|14|15|18|17)[0-9]{9}/.test(phone);
}

// 格式化money
export function formatMoney(s) {
    return s.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

// 监听事件公共方法
export function addPageEvent(ev, cb) {
    window.addEventListener(ev, cb);
}

// 获取页面对象
export function getViewById(id) {
    return plus.webview.getWebviewById(id);
}

// 网络检测
export function wainshow(index?) {
    const online = plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE;
    if (online) {
        if (!getSettings("netError")) {
            mui.toast("网络异常，请检查网络设置");
            setSettings("netError", true);
        }
    } else {
        index && (() => {
            // mui.toast("网络已恢复");
            setSettings("netError", false);
            const allWebView: object[] = plus.webview.all();
            allWebView.forEach((view) => {
                mui.fire(view, "reloadData", {});
            });
        })();
    }
    return online;
}

function downWgt(wgtUrl) {
    plus.nativeUI.showWaiting("下载更新文件...");
    plus.downloader.createDownload(wgtUrl, { filename: "_doc/update/" }, (d, status) => {
        if (status === 200) {
            console.log("下载wgt成功：" + d.filename);
            installWgt(d.filename); // 安装wgt包
        } else {
            console.log("下载wgt失败！");
            plus.nativeUI.alert("下载更新失败！");
        }
        plus.nativeUI.closeWaiting();
    }).start();
}

// 更新应用资源
function installWgt(path) {
    plus.nativeUI.showWaiting("正在更新...");
    plus.runtime.install(path, {}, () => {
        plus.nativeUI.closeWaiting();
        console.log("安装wgt文件成功！");
        plus.nativeUI.alert("应用资源更新完成！", () => {
            plus.runtime.restart();
        });
    }, (e) => {
        plus.nativeUI.closeWaiting();
        console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
        plus.nativeUI.alert("应用更新失败[" + e.code + "]：" + e.message);
    });
}

// 图片上传
export function imageUploader(url, eventType) {
    const task = plus.uploader.createUpload(REMOTE + "file/upload", {
        method: "POST"
    }, (t, status) => {
        if (status === 200) {
            console.log(t.responseText);
            const src = REMOTE + "file/download/" + JSON.parse(t.responseText).data[0].fileId;
            const fileId = JSON.parse(t.responseText).data[0].fileId;
            mui.fire(plus.webview.currentWebview().opener(), eventType, { img: src, fileId });
            mui.later(() => {
                plus.nativeUI.closeWaiting();
                mui.back();
            }, 1000);
            console.info("上传成功");
        } else {
            mui.toast("上传失败：" + status);
            plus.nativeUI.closeWaiting();
        }
    });
    const key = url.substring(url.lastIndexOf("/") + 1, url.length);
    task.addData("key", key);
    task.setRequestHeader("Authorization", getCookie("access_token") || 1);
    task.addFile(url, { key });
    task.start();
}

export function setCloseBarStyle(view) {
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.style !== "dark" && plus.navigator.setStatusBarStyle("light");
        view.close();
    };
}