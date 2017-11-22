// 配置文件
import { APPNAME, ASSETSIMG, mui, plus } from "../config";
import { plusReady, setSettings } from "./util";

/**
 * @description 创建页面
 * @param {string} id 页面ID
 * @param {Vue.Component} component 页面组件对象
 * @param {any} [ready] PlusReady 后执行
 * @returns 返回页面对象
 */
export function CreatePage(id: string, component: any, ready?) {
    const pageComponent: any = new component().$mount("#" + id);
    plusReady((view) => {
        hideScroll();
        ready && ready(view, pageComponent);
    });
    return pageComponent;
}

// 判断是否全屏，返回状态栏高度
export function getImmersed() {
    let immersed = 0;
    const ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
    if (ms && ms.length >= 3) {
        immersed = parseFloat(ms[2]);
    }
    if (immersed) {
        return immersed;
    } else if (plus.navigator.isImmersedStatusbar()) {
        return plus.navigator.getStatusbarHeight();
    } else {
        return 0;
    }
}

// 隐藏滚动条
export function hideScroll() {
    plus.webview.currentWebview().setStyle({
        scrollIndicator: "none"
    });
}

export function getRootSize() {
    return Math.ceil(window.screen.availWidth / 7.5);
}

/**
 * @description 顶部状态栏高度 区分首页和内页不同处理
 * @param {String|null} str 顶部状态栏颜色
 */
export function setImmersed() {
    const r = getRootSize();
    const immersed = getImmersed();
    if (immersed) {
        let t: Element | any = (document.querySelector(".mui-bar") || document.querySelector(".orange"));
        t && (t.style.paddingTop = immersed + "px", t.style.height = (.9 * r + immersed) + "px");
        t = document.querySelector(".mui-content");
        t && (t.style.paddingTop = (.9 * r + immersed) + "px");
    }
}

// APP显示错误信息，并返回false
export function showMsg(err: string) {
    plus.nativeUI.toast(err);
}

/**
 * @description 打开新页面如果页面已经打开，则显示页面
 * @param {String|Object} 要打开页面的ID
 */
export function openPage(page: string, param: any = {}, showedCB?): void {
    const tmp = plus.webview.getWebviewById(page);
    const ios = plus.os.name.toLowerCase() === "ios";
    const moveType = ios ? "pop-in" : "slide-in-right";
    if (tmp && !param.createNew) {
        tmp.show(moveType, 300, showedCB);
    } else {
        const options: any = {
            url: page + ".html",
            id: param.createNew ? "new_" + page : page,
            show: {
                aniShow: moveType,
                duration: 300,
                event: "loaded"
            },
            styles: {
                hardwareAccelerated: true,
                popGesture: "close"
            },
            waiting: {
                autoShow: false
            },
            extras: param
        };
        param.createNew && (options.createNew = true);
        mui.openWindow(options);
    }
}

// 初始化安卓手机返回按钮行为
export function back(): void {
    let first: number = 0;
    mui.back = () => {
        if (!first) {
            mui.toast("再按一次退出" + APPNAME);
            first++;
            setTimeout(() => {
                first = 0;
            }, 1500);
        } else {
            plus.runtime.quit();
        }
    };
}
// 绘制页面标题
export function createTitle(title, leftBtn?, rightBtn?) {
    const topoffset = getImmersed();
    const currentView = plus.webview.currentWebview();
    // 开启回弹
    currentView.setStyle({
        bounce: "vertical",
        bounceBackground: "#edf2f5"
    });
    const childNode: object[] = [
        { tag: "rect", id: "rect", color: "#dfdfdf", position: { top: (topoffset + 44) + "px", left: "0px", width: "100%", height: "1px" } },
        { tag: "font", id: "font", text: title, position: { top: topoffset + "px", left: "0px", width: "100%", height: "44px" }, textStyles: { size: "17px", color: "#444" } }
    ];
    leftBtn ? childNode.push({ tag: "img", id: "leftBtn", src: ASSETSIMG + leftBtn.icon, position: { top: (topoffset + 10) + "px", left: "10px", width: "24px", height: "24px" } }) : "";
    rightBtn ? childNode.push({ tag: "img", id: "rightBtn", src: ASSETSIMG + rightBtn.icon, position: { top: (topoffset + 10) + "px", left: (window.innerWidth - 34) + "px", width: "24px", height: "24px" } }) : "";
    const titleView = new plus.nativeObj.View("titleView", { top: "0px", left: "0px", height: (topoffset + 45) + "px", width: "100%", backgroundColor: "#fff", dock: "top", position: "dock" }, childNode);
    titleView.addEventListener("click", (e) => {
        const x = e.clientX;
        if (x < 44 && leftBtn && leftBtn.click) {
            leftBtn.click();
            return false;
        }
        if (x > window.innerWidth - 34 && rightBtn && rightBtn.click) {
            rightBtn.click();
            return false;
        }
    }, false);
    currentView.append(titleView);
}

export function createTitleIndex(title: string) {
    // 获取顶部状态栏高度
    const topoffset = getImmersed();
    const currentView = plus.webview.currentWebview();
    // 开启回弹
    currentView.setStyle({
        bounce: "vertical",
        bounceBackground: "#edf2f5"
    });
    const titleView = new plus.nativeObj.View("titleView", {
        top: "0px",
        left: "0px",
        height: (topoffset + 45) + "px",
        width: "100%",
        backgroundColor: "#fff",
        dock: "top",
        position: "dock"
    });
    // 绘制标题底部边线
    titleView.drawRect("#dfdfdf", {
        top: (topoffset + 44) + "px",
        height: "1px",
        left: "0px"
    });
    titleView.drawText(title, {
        top: topoffset + "px",
        left: "0px",
        width: "100%",
        height: "44px"
    }, {
            size: "17px",
            color: "#444"
        });
    // titleView.drawText("退出", {
    //     top: (topoffset + 10) + "px",
    //     left: (window.innerWidth - 44) + "px",
    //     width: "34px",
    //     height: "24px"
    // },
    //     {
    //         size: "15px",
    //         color: "#51b1f5"
    //     });

    // titleView.addEventListener("click", (e) => {
    //     const x = e.clientX;
    //     if (x > window.innerWidth - 44) {
    //         setSettings("expires", Date.now());
    //         openPage("login");
    //         return false;
    //     }
    // }, false);

    titleView.interceptTouchEvent(true);
    currentView.append(titleView);
}