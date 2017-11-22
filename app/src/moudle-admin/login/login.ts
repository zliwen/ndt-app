declare function require(path: string): any;

import { Base64 } from "js-base64";
import Vue from "vue";
import * as Neo from "../../common";
import "./login.scss";

const { plus, mui, plusReady, layer } = Neo;
const template = require("./login.html");

mui.init({
    swipeBack: true
});

plusReady((view) => {
    Neo.hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        plus.navigator.setStatusBarStyle("light");
        view.close();
    };
    const resetPwd = plus.webview.getWebviewById("forget");
    mui.later(() => {
        resetPwd && resetPwd.close("none");
    }, 300);

});

interface ILoginModel {
    phoneOrEmail: string;
    password: string;
    validateId: string;
    blur?: any;
    isActive: number;
}

const LoginForm: object | any = {
    el: "#login",
    data(): ILoginModel {
        return {
            phoneOrEmail: "",
            password: "",
            validateId: "",
            isActive:0
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
                    Neo.openPage("forget", {
                        pageType: id
                    });
                }

            } else {
                Neo.openPage(id);
            }
        },
    	switchNav: function(e) {
            this.isActive = e;
            this.password = '';
            this.phoneOrEmail = '';
        },
        login(this: ILoginModel) {
            this.blur();
            if(this.isActive == 0){
            	if (this.phoneOrEmail=="") {
	                return Neo.showMsg("请输入账号");
	            }
            }else if(this.isActive == 1){
            	// 验证手机号码
	            if (!Neo.testPhone(this.phoneOrEmail)) {
	                return Neo.showMsg("请输入正确的手机号码");
	            }
            }
            
            if (this.password.length < 6) {
                return Neo.showMsg("密码少于6位");
            }
            // 获取登录信息
            const authInfo = {
                loginName: this.phoneOrEmail.toLowerCase(),
                password: Base64.encode(this.password),
                loginType: this.isActive
            };
            // 保存用户登录信息，显示登录loading
            plus.nativeUI.showWaiting("登录中...");
            Neo.ajax("POST", "login", authInfo, (res: any) => {
                if (!res.errorCode) {
                    if (res.data.userType == 205 || res.data.userType == 206 || res.data.userType == 207) {
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
