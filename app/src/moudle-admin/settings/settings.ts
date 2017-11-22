declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./settings.scss";

import "../../../../assets/js/mui.picker.min.js";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./settings.html");

const userInfo = Neo.getSettings("user");
const authInfo = Neo.getSettings("authInfo");

mui.init({
    swipeBack: true
});

plusReady((view) => {
    hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        plus.navigator.setStatusBarStyle("light");
        view.close();
    };
});

@Component({
    template
})
export class Setting extends Vue {
    constructor() {
        super();
    }
    logout() {
        mui.confirm("", "确认退出登录?", "", (e) => {
            if (e.index === 1) {
                Neo.setCookie("access_token", " ", 0.001);
                Neo.setSettings("expires", "");
                mui.fire(plus.webview.getWebviewById("user"), "reloadData", {});
                Neo.setSettings("user", "");
                mui.fire(plus.webview.getWebviewById("news.html"), "reloadData", {});
                Neo.$http("GET", "logout", {
                    token: userInfo.token
                });
                mui.later(() => {
                    mui.back();
                }, 500);
            }
        }, "div");
    }
    mounted() {
        Neo.setImmersed();
    }
}

const settings = new Setting().$mount("#settings");