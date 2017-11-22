import CountUp from "countup.js";
import { Base64 } from "js-base64";
import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import "./phoneAuth.scss";

declare function require(path: string): any;
const { plus, mui, plusReady, hideScroll, openPage } = Neo;
const userInfo = Neo.getSettings("user");
let taskId = "";

@Component({
    template: require("./phoneAuth.html")
})
export class PhoneAuth extends Vue {
    taskList: object[] = [];
    phone = "";
    password = "";
    validateId = "";
    getValidateId() {
        if (!this.auth()) {
            return false;
        }
        const vallidateBtn: any = document.getElementById("vallidateBtn");
        vallidateBtn.classList.add("mui-disabled");
        Neo.$http("GET", "verify/getCode", { mobile: this.phone, businessType: 1 }).then((res: any) => {
            if (!res.errorCode) {
                mui.toast("验证码已发送");
                this.regetTimer(vallidateBtn);
            } else {
                Neo.showError(res.errorCode, "验证码发送失败");
                this.resetBtn(vallidateBtn);
            }
        }).catch(() => {
            this.resetBtn(vallidateBtn);
            mui.toast("发送验证码出错");
        });
    }
    resetBtn(vallidateBtn) {
        vallidateBtn.innerText = "重新发送";
        vallidateBtn.classList.remove("mui-disabled");
    }
    regetTimer(vallidateBtn) {
        let num = 100;
        const intlId: any = setInterval(() => {
            num--;
            if (num === 0) {
                clearInterval(intlId);
                vallidateBtn.setAttribute("data-is", "true");
                this.resetBtn(vallidateBtn);
            } else {
                vallidateBtn.innerText = num + "秒后重发";
                vallidateBtn.classList.add("mui-disabled");
            }
        }, 1000);
    }
    auth() {
        const isPhoneNum = /0?(13|14|15|18|17)[0-9]{9}/.test(this.phone);
        if (!isPhoneNum) {
            return Neo.showMsg("请输入正确的手机号码");
        }
        if (Neo.getSettings("authInfo").password !== Base64.encode(this.password)) {
            return Neo.showMsg("请输入正确的登录密码");
        }
        return true;
    }
    oldBlur() {
        if (this.password && Neo.getSettings("authInfo").password !== Base64.encode(this.password)) {
            return Neo.showMsg("请输入正确的登录密码");
        }
    }
    toAuth() {
        if (!this.auth()) {
            return false;
        }
        if (!this.validateId || !Neo.IsNumeric(this.validateId)) {
            return Neo.showMsg("请输入正确的短信验证码");
        }
        Neo.$http("POST", "user/updateLoginName", {
            userId: Neo.getSettings("user").userId,
            type: "mobile",
            value: this.phone,
            verificationCode: this.validateId
        }).then((res: any) => {
            if (!res.errorCode) {
                if (taskId) {
                    Neo.$http("POST", "userCredittaskLog/add", {
                        userId: Neo.getSettings("user").userId,
                        credittaskId: taskId
                    }).then((rsp: any) => {
                        if (!rsp.errorCode) {
                            mui.toast(res.data || "认证成功");
                            mui.fire(plus.webview.getWebviewById("userProfile"), "reloadData", {});
                            mui.fire(plus.webview.getWebviewById("credit"), "reloadData", {});
                            mui.later(() => {
                                mui.back();
                            }, 1000);
                        } else {
                            Neo.showError(rsp.errorCode, "认证失败");
                        }
                    }).catch(() => {
                        mui.toast("认证失败");
                    });
                }
            } else {
                Neo.showError(res.errorCode, "认证失败");
            }
        }).catch(() => {
            mui.toast("认证失败");
        });
    }
    mounted() {
        Neo.setImmersed();
    }
}

const phoneAuth = new PhoneAuth().$mount("#phoneAuth");

plusReady((view) => {
    hideScroll();
    Neo.setCloseBarStyle(view);
    taskId = view.taskId;
});