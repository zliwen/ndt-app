declare function require(path: string): any;

import { Base64 } from "js-base64";
import Vue from "vue";
import * as Neo from "../../common";
import "./login.scss";

const { plus, mui, plusReady, layer } = Neo;
const template = require("./login.html");
const authInfo = Neo.getSettings("authInfo");

mui.init({
    swipeBack: true
});

const authBtns = ["weixin"]; // 配置业务支持的第三方登录
const auths: any = {};

plusReady((view) => {
    Neo.hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        plus.navigator.setStatusBarStyle("light");
        view.close();
    };
    const resetPwd = plus.webview.getWebviewById("register");
    mui.later(() => {
        resetPwd && resetPwd.close("none");
    }, 300);

    plus.oauth.getServices((services) => {
        // tslint:disable-next-line:forin
        for (const i in services) {
            const service = services[i];
            auths[service.id] = service;
            // tslint:disable-next-line:no-bitwise
            if (~authBtns.indexOf(service.id)) {
                (login as any).isInstalled = Neo.isInstalled(service.id);
            }
        }
    }, (e) => {
        plus.nativeUI.toast("获取登录认证失败：" + e.message);
    });

});

interface ILoginModel {
    phoneOrEmail: string;
    password: string;
    phone: string;
    validateId: string;
    isInstalled: boolean;
    blur?: any;
}

const LoginForm: object | any = {
    el: "#login",
    data(): ILoginModel {
        return {
            phoneOrEmail: authInfo && authInfo.loginName || "",
            phone: authInfo && authInfo.loginName || "",
            password: "",
            validateId: "",
            isInstalled: false
        };
    },
    template,
    mounted() {
        Neo.setImmersed();
    },
    methods: {
        showPage(id) {
            if (["register", "forget"].indexOf(id) >= 0) {
                if (id === "register") {
                    mui.confirm("请谨慎选择，身份确定后将不可更换<br/>个体工商户请选择个人", "请选择您注册的身份", ["我是企业", "我是个人"], (e) => {
                        if (e.index === 0) {
                            Neo.openPage("registerCompany", {
                                pageType: id
                            });
                        }
                        if (e.index === 1) {
                            Neo.openPage("register", {
                                pageType: id
                            });
                        }
                    }, "div");
                } else {
                    Neo.openPage("register", {
                        pageType: id
                    });
                }

            } else {
                Neo.openPage(id);
            }
        },
        loginWx(this: ILoginModel) {
            if (this.isInstalled) {
                // mui.toast("安装了微信");
                const auth = auths.weixin;
                plus.nativeUI.showWaiting("微信登录中...");
                auth.login(() => {
                    auth.getUserInfo(() => {
                        const name = auth.userInfo.nickname || auth.userInfo.name;
                        // plus.nativeUI.toast("获取用户信息成功");
                        // mui.toast(name);
                        // console.log(JSON.stringify(auth.userInfo));
                        console.log(JSON.stringify(auth.authResult));
                        Neo.$http("POST", "wxAppLogin", auth.authResult).then((res: any) => {
                            console.log(JSON.stringify(res));
                            if (!res.errorCode && res.data) {
                                if (res.data.userType === 202 || res.data.userType === 203) {
                                    Neo.setSettings("expires", new Date().getTime() + res.data.tokenExpireMinutes * 60 * 1000);
                                    Neo.setCookie("access_token", res.data.token, res.data.tokenExpireMinutes * 60);
                                    Neo.setSettings("user", res.data);
                                    Neo.setSettings("authInfo", authInfo);
                                    // 刷新user 页面
                                    const user = plus.webview.getWebviewById("user");
                                    const news = plus.webview.getWebviewById("news.html");
                                    mui.fire(user, "reloadData", {});
                                    mui.fire(news, "reloadData", {});
                                    mui.later(() => {
                                        plus.nativeUI.closeWaiting();
                                        mui.back();
                                    }, 300);
                                } else {
                                    plus.nativeUI.closeWaiting();
                                    Neo.showMsg("您是'" + Neo.getUnit(2, res.data.userType) + "'用户，请下载对应客户端登录");
                                }
                            }
                            if (res.errorCode === 2001) {
                                Neo.openPage("register", {
                                    pageType: "bindWx",
                                    exceptResult: res.exceptResult
                                });
                                plus.nativeUI.closeWaiting();
                            }
                            if (res.errorCode === 2002) {
                                plus.nativeUI.toast("授权登录失败");
                                plus.nativeUI.closeWaiting();
                            }
                        }).catch(() => {
                            plus.nativeUI.toast("服务器错误，登录失败");
                            plus.nativeUI.closeWaiting();
                        });
                    }, (e) => {
                        plus.nativeUI.toast("获取用户信息失败：" + e.message);
                        plus.nativeUI.closeWaiting();
                    });
                }, (e) => {
                    plus.nativeUI.toast("登录认证失败：" + e.message);
                    if (e.code === "-2") {
                        if (plus.os.name === "Android") {
                            plus.runtime.launchApplication({ pname: "com.tencent.mm" });
                        } else if (plus.os.name === "iOS") {
                            plus.runtime.launchApplication({ action: "weixin://RnUbAwvEilb1rU9g9yBU" });
                        }
                        setTimeout(() => {
                            login.loginWx();
                        }, 4500);
                    }
                    plus.nativeUI.closeWaiting();
                });
            } else {
                mui.toast("没有安装微信");
            }
        },
        login(this: ILoginModel) {
            this.blur();
            // 验证手机号码
            if (!Neo.testPhone(this.phoneOrEmail)) {
                return Neo.showMsg("请输入正确的手机号码");
            }
            if (this.password.length < 6) {
                return Neo.showMsg("密码少于6位");
            }
            // 获取登录信息
            const authInfo = {
                loginName: this.phoneOrEmail.toLowerCase(),
                password: Base64.encode(this.password),
                loginType: 1
            };
            // 保存用户登录信息，显示登录loading
            plus.nativeUI.showWaiting("登录中...");
            Neo.ajax("POST", "login", authInfo, (res: any) => {
                if (!res.errorCode) {
                    if (res.data.userType === 202 || res.data.userType === 203) {
                        Neo.setSettings("expires", new Date().getTime() + res.data.tokenExpireMinutes * 60 * 1000);
                        Neo.setCookie("access_token", res.data.token, res.data.tokenExpireMinutes * 60);
                        Neo.setSettings("user", res.data);
                        Neo.setSettings("authInfo", authInfo);
                        // 刷新user 页面
                        const user = plus.webview.getWebviewById("user");
                        const news = plus.webview.getWebviewById("news.html");
                        mui.fire(user, "reloadData", {});
                        mui.fire(news, "reloadData", {});
                        mui.later(() => {
                            plus.nativeUI.closeWaiting();
                            mui.back();
                        }, 300);
                    } else {
                        plus.nativeUI.closeWaiting();
                        Neo.showMsg("您是'" + Neo.getUnit(2, res.data.userType) + "'用户，不适用于此客户端");
                    }
                } else {
                    Neo.showError(res.errorCode, "登录失败");
                    plus.nativeUI.closeWaiting();
                }
            }, () => {
                plus.nativeUI.closeWaiting();
                Neo.showMsg("登录出错");
            });
        },
        blur() {
            const inputs: any = document.querySelectorAll(".loginForm input");
            mui.each(inputs, (index, element) => {
                element.blur();
            });
        }
    }
};

const login: any = new Vue(LoginForm);
