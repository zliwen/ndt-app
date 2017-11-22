declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./user.scss";

const { plus, mui, plusReady, hideScroll, openPage } = Neo;
const template = require("./user.html");
let userInfo = Neo.getSettings("user");
const authInfo = Neo.getSettings("authInfo");
let currentView;

function getUserInfo() {
    userInfo && Neo.$http("GET", "user/findById", {
        userId: userInfo.userId
    }).then((res: any) => {
        if (!res.errorCode) {
            VUser.userName = res.data.name;
            VUser.mobile = res.data.mobile==""?"":res.data.mobile.substring(0, 3)+"****"+res.data.mobile.substring(7, 11);
            VUser.avatar = res.data.imageUrl;
        } else {
            Neo.showError(res.errorCode, "获取信息失败");
        }
    });
}
getUserInfo();

mui.init({
    swipeBack: false
});

interface IProductDetail {
    isLogin: boolean;
    userName: string;
    mobile: string;
    version: string;
    avatar: string;
}

@Component({
    data(): IProductDetail {
        return {
            isLogin: !!Neo.getCookie("access_token"),
            version: plus.runtime.version,
            userName: authInfo && authInfo.loginName,
            avatar: "",
            mobile:''
        };
    },
    template
})
export default class User extends Vue {
    showPage(id: string) {
        if (id === "resetPwd") {
            openPage("register", {
                pageType: Neo.getCookie("access_token") ? id : "forget"
            });
        } else {
            if (Neo.getCookie("access_token")) {
                openPage(id);
            } else {
                openPage("login");
            }
        }
    }
    replaceUrl(url) {
        if (url && String(url).indexOf("http") < 0) {
            return Neo.REMOTE + "file/download/" + url;
        } else {
            return url;
        }
    }
    openPersonal(this: IProductDetail) {
        if (this.isLogin) {

        } else {
            openPage("login");
        }
    }
    logout() {
        if (VUser.isLogin) {
            mui.confirm("", "确认退出登录?", "", (e) => {
                if (e.index === 1) {
                    Neo.setCookie("access_token", " ", 0.001);
                    mui.fire(currentView, "reloadData", {});
                    Neo.$http("GET", "logout", {
                        token: userInfo.token
                    });
                }
            }, "div");
        } else {
            openPage("login");
        }
    }
    mounted() {
        Neo.setImmersed();
        let t: Element | any = document.querySelector(".headerbg");
        t && ((t) => {
            const paddingTop: any = getComputedStyle(t).paddingTop;
            const top: number = Math.ceil(parseFloat(paddingTop));
            t.style.paddingTop = top + Neo.getImmersed() + "px";
        })(t);

        t = document.querySelector("#indexHeader");
        t && ((t) => {
            const height: any = getComputedStyle(t).height;
            const top: number = Math.ceil(parseFloat(height));
            t.style.height = top + Neo.getImmersed() + "px";
        })(t);
    }
}

const VUser: any = new User().$mount("#user");

plusReady((view) => {
    currentView = view;
    hideScroll();
    window.addEventListener("reloadData", (event: any) => {
        userInfo = Neo.getSettings("user");
        VUser.isLogin = !!Neo.getCookie("access_token");
        // 重新获取用户信息
        getUserInfo();
    });
    plus.runtime.getProperty(plus.runtime.appid, (inf) => {
        VUser.version = inf.version;
    });
});