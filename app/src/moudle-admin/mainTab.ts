declare function require(path: string): any;
import Vue from "vue";
import "./mainTab.scss";

import { back, getCodeTable, getImmersed, getRootSize, hideScroll, mui, plus, plusReady, update, wainshow } from "../common";

const aniShow: object = {};
const subpages = [{
    name: "首页",
    url: "index.html",
    src: "assets/images/ndt/tab_btn_home_sel@3x.png",
    nosrc: "assets/images/ndt/tab_btn_home_nor@3x.png"
}, {
    name: "资讯",
    url: "news.html",
    src: "assets/images/ndt/tab_btn_zx_sel@3x.png",
    nosrc: "assets/images/ndt/tab_btn_zx_nor@3x.png"
}, {
    name: "审批",
    url: "creditQuery.html",
    src: "assets/images/ndt/se_btn_xx@3x.png",
    nosrc: "assets/images/ndt/se_btn_xx@3x.png"
}];

const mainTab: any = new Vue({
    el: "#mainTab",
    template: require("./mainTab.html"),
    data() {
        return {
            subpages,
            activeTab: subpages[0].url,
            navTop: document.body.scrollHeight - Math.floor(getRootSize() * 1.2) + "px",
            height: Math.floor(getRootSize() * 1.2) + "px"
        };
    },
    methods: {
        tabClick(page) {
            const targetTab = page.url;
            if (page.url === mainTab.activeTab || !targetTab) {
                return false;
            }
            if (mui.os.ios || aniShow[targetTab]) {
                plus.webview.show(targetTab);
            } else {
                // 否则，使用fade-in动画，且保存变量
                const temp = {};
                temp[targetTab] = "true";
                mui.extend(aniShow, temp);
                plus.webview.show(targetTab, "fade-in", 200);
            }
            // 隐藏当前;
            plus.webview.hide(mainTab.activeTab);
            // 更改当前活跃的选项卡
            mainTab.activeTab = targetTab;
        }
    }
});

plusReady((view) => {
    hideScroll();
    let titleView = view.getNavigationbar();
    if (!titleView) {
        titleView = plus.webview.getLaunchWebview().getNavigationbar();
    }
    plus.screen.lockOrientation("portrait-primary");
    // 关闭全屏
    mui.later(() => {
        plus.navigator.setFullscreen(false);
        plus.navigator.closeSplashscreen();
        plus.navigator.setStatusBarStyle("light");
        // 检测更新
        mui.os.plus && !mui.os.stream && mui.plusReady(update);
    }, 2500);
    subpages.forEach((item, key) => {
        const temp = {};
        item.url && (() => {
            const sub = plus.webview.create(item.url, item.url, {
                hardwareAccelerated: true,
                bottom: (getRootSize() * 1.2) + "px", top: "0px"
            });
            if (key > 0) {
                sub.hide();
            } else {
                temp[item.url] = "true";
                mui.extend(aniShow, temp);
            }
            view.append(sub);
        })();
    });
    back();
    // 获取码表值
    getCodeTable();
    // 网络提示
    document.addEventListener("netchange", () => {
        wainshow(true);
    }, false);
    wainshow();
});
