declare function require(path: string): any;

import { Base64 } from "js-base64";
import Vue from "vue";
import * as Neo from "../../common";
import "./register.scss";

import "../../../../assets/js/mui.picker.min.js";

const { plus, mui, plusReady } = Neo;
const template = require("./register.html");
const userInfo = Neo.getSettings("user");
let exceptResult: any = null;
let isExist = false;

mui.init({
    swipeBack: true
});

// 城市选择
const cityPicker = new mui.PopPicker();
cityPicker.setData([
    { value: 5101, text: "成都市" }
]);
cityPicker.pickers[0].setSelectedValue(5101);
cityPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    register.address = { ...register.address, city: item[0].text };
    getDataById(item[0].value, (data) => {
        countyPicker.setData(data);
    });
};

// 区县选择
const countyPicker = new mui.PopPicker();
countyPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    townPicker.setData([]);
    villagePicker.setData([]);
    register.address = { ...register.address, county: item[0].text, town: "", village: "" };
    getDataById(item[0].value, (data) => {
        townPicker.setData(data);
    });
};

// 乡镇选择器
const townPicker = new mui.PopPicker();
townPicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    villagePicker.setData([]);
    register.address = { ...register.address, town: item[0].text, village: "" };
    getDataById(item[0].value, (data) => {
        villagePicker.setData(data);
    });
};

// 村/社区选择器
const villagePicker = new mui.PopPicker();
villagePicker.showCb = (item) => {
    register.address = { ...register.address, village: item[0].text };
    console.log(item[0].text + ":" + item[0].value);
};

const picker = {
    cityPicker,
    countyPicker,
    townPicker,
    villagePicker
};

function getDataById(id, cb) {
    mui.get(Neo.REMOTE + "division/children/" + id, {}, (res: any) => {
        if (res.errorCode === 0) {
            if (res.data.length) {
                const data: object[] = [];
                res.data.forEach((item) => {
                    data.push({
                        value: item.id,
                        text: item.name
                    });
                });
                cb && cb(data);
            }
        } else {
            Neo.showMsg("区域ID返回错误");
        }
    }, "json");
}

interface ILoginModel {
    phone: string;
    oldPassword: string;
    password: string;
    repeatPwd: string;
    validateId: string;
    type: string;
    btnTxt: string;
    title: string;
    blur?: any;
    regetTimer?: any;
    resetBtn?: any;
    auth?: any;
    adminDivisionId: number;
    address: object | any;
    addressStr: string;
    name: string;
    identityId: string;
}
const LoginForm: object | any = {
    el: "#register",
    data(): ILoginModel {
        return {
            phone: userInfo && userInfo.phone || "",
            password: "",
            oldPassword: "",
            validateId: "",
            name: "",
            identityId: "",
            adminDivisionId: 0,
            repeatPwd: "",
            type: "register",
            title: "个人注册",
            btnTxt: "完成注册，进入农贷通",
            address: {},
            addressStr: ""
        };
    },
    template,
    watch: {
        address(newValue, oldValue) {
            if (newValue.county === "市辖区") {
                newValue.town = "";
                newValue.village = "";
            }
            register.getPickerVal();
        }
    },
    mounted() {
        Neo.setImmersed();
    },
    methods: {
        blur() {
            const inputs: any = document.querySelectorAll(".loginForm input");
            mui.each(inputs, (index, element) => {
                element.blur();
            });
        },
        toRegister() {
            Neo.openPage("register", {
                pageType: "register",
                createNew: true,
                exceptResult
            });
        },
        isExist(this: ILoginModel) {
            if (this.type === "register" && /0?(13|14|15|18|17)[0-9]{9}/.test(this.phone)) {
                Neo.$http("GET", "mobile/exist", { mobile: this.phone }).then((res: any) => {
                    if (!res.errorCode && res.data) {
                        mui.toast("用户或记录已存在");
                    }
                    isExist = res.data;
                });
            }
        },
        showPicker(pickerName) {
            picker[pickerName].show(picker[pickerName].showCb);
        },
        getPickerVal(this: ILoginModel) {
            this.adminDivisionId = picker.villagePicker.getSelectedItems()[0].value
                || picker.townPicker.getSelectedItems()[0].value
                || picker.countyPicker.getSelectedItems()[0].value
                || picker.cityPicker.getSelectedItems()[0].value;
        },
        oldBlur(this: ILoginModel) {
            if (this.oldPassword && Neo.getSettings("authInfo").password !== Base64.encode(this.oldPassword)) {
                return Neo.showMsg("请输入正确的旧密码");
            }
        },
        getValidateId(this: ILoginModel) {
            if (!this.auth()) {
                return false;
            }
            if (isExist) {
                return Neo.showMsg("用户或记录已存在");
            }
            const vallidateBtn: any = document.getElementById("vallidateBtn");
            const businessType = this.type === "register" ? 0 : 1;
            vallidateBtn.classList.add("mui-disabled");
            Neo.$http("GET", "verify/getCode", { mobile: this.phone, businessType }).then((res: any) => {
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
        },
        resetBtn(vallidateBtn) {
            vallidateBtn.innerText = "重新发送";
            vallidateBtn.classList.remove("mui-disabled");
        },
        regetTimer() {
            const vallidateBtn: any = document.getElementById("vallidateBtn");
            let num = 100;
            const intlId: any = setInterval(() => {
                num--;
                if (num === 0) {
                    clearInterval(intlId);
                    this.resetBtn(vallidateBtn);
                } else {
                    vallidateBtn.innerText = num + "秒后重发";
                }
            }, 1000);
        },
        auth(this: ILoginModel) {
            this.blur();
            // 验证手机号码和邮箱
            if (!Neo.testPhone(this.phone)) {
                return Neo.showMsg("请输入正确的手机号码");
            }
            if (this.type === "resetPwd" && Neo.getSettings("authInfo").password !== Base64.encode(this.oldPassword)) {
                return Neo.showMsg("请输入正确的旧密码");
            }
            if (this.type === "resetPwd" && this.password === this.oldPassword) {
                return Neo.showMsg("旧密码与新密码相同");
            }
            if (this.type !== "bindWx" && this.password !== this.repeatPwd) {
                return Neo.showMsg("两次密码输入不一致");
            }
            if (this.password.length < 6) {
                return Neo.showMsg("密码少于6位");
            }
            if (this.type === "register" && !this.adminDivisionId) {
                return Neo.showMsg("请选择你的注册区域地址");
            }
            return true;
        },
        login(url, loginInfo) {
            plus.nativeUI.showWaiting("登录中...");
            Neo.ajax("POST", url, loginInfo, (res) => {
                if (!res.errorCode) {
                    Neo.setSettings("expires", new Date().getTime() + res.data.tokenExpireMinutes * 60 * 1000);
                    Neo.setCookie("access_token", res.data.token, res.data.tokenExpireMinutes * 60);
                    Neo.setSettings("user", res.data);
                    Neo.setSettings("authInfo", loginInfo);
                    plus.webview.getWebviewById("login").close("none");
                    // 如果是绑定页面到注册页，则绑定成功后关闭绑定页面
                    register.type !== "bindWx" && exceptResult && plus.webview.getWebviewById("register").close("none");
                    // 刷新user 页面
                    const user = plus.webview.getWebviewById("user");
                    const news = plus.webview.getWebviewById("news.html");
                    mui.fire(user, "reloadData", {});
                    mui.fire(news, "reloadData", {});
                    mui.later(() => {
                        plus.nativeUI.closeWaiting();
                        mui.back();
                    }, 1000);
                } else {
                    Neo.showError(res.errorCode, "登录失败");
                    plus.nativeUI.closeWaiting();
                }
            }, () => {
                Neo.showMsg("登录出错");
                plus.nativeUI.closeWaiting();
            });
        },
        register(this: ILoginModel) {
            if (!this.auth()) {
                return false;
            }
            if (this.type === "register" && !Neo.testIdNumber(this.identityId)) {
                return mui.toast("请填写正确的身份证号");
            }
            if (this.type === "register" && this.name.length <= 1) {
                return mui.toast("请填写正确的姓名");
            }
            if (this.type !== "bindWx" && !this.validateId) {
                return Neo.showMsg("请输入正确的短信验证码");
            }
            // 获取注册信息
            const { city, county, town, village } = this.address;
            const authInfo = {
                mobile: this.phone.toLowerCase(),
                password: Base64.encode(this.password),
                verificationCode: this.validateId,
                identityId: this.identityId,
                name: this.name,
                adminDivisionId: this.adminDivisionId,
                // address: (city || "") + (county || "") + (town || "") + (village || "")
                address: this.addressStr
            };
            // 获取user页面
            const user = plus.webview.getWebviewById("user");
            const resetPwd = plus.webview.currentWebview();

            switch (this.type) {
                case "register":
                    plus.nativeUI.showWaiting("注册中...");
                    Neo.$http("POST", "user/register", authInfo).then((res: any) => {
                        if (!res.errorCode) {
                            const loginInfo: any = {
                                loginName: authInfo.mobile,
                                password: authInfo.password,
                                loginType: 1
                            };
                            let url = "login";
                            if (exceptResult) {
                                url = "bindThirdAccount";
                                loginInfo.thirdId = exceptResult.thirdUserId;
                            }
                            plus.nativeUI.closeWaiting();
                            register.login(url, loginInfo);
                        } else {
                            Neo.showError(res.errorCode, "注册失败");
                            plus.nativeUI.closeWaiting();
                        }
                    }).catch(() => {
                        plus.nativeUI.closeWaiting();
                    });
                    break;
                case "resetPwd":
                    const userData = Neo.getSettings("user");
                    plus.nativeUI.showWaiting("修改密码中...");
                    Neo.ajax("POST", "account/updatePasswd", {
                        userId: userData.userId,
                        oldPassword: Base64.encode(this.oldPassword),
                        newPassword: authInfo.password
                    }, (res: any) => {
                        if (!res.errorCode) {
                            // 设置token失效
                            Neo.setCookie("access_token", " ", 1);
                            Neo.setSettings("authInfo", {
                                loginName: authInfo.mobile,
                                password: authInfo.password,
                                loginType: 1
                            });
                            mui.later(() => {
                                plus.nativeUI.closeWaiting();
                                Neo.openPage("login");
                                mui.fire(user, "reloadData", {});
                            }, 500);
                        } else {
                            Neo.showError(res.errorCode, "修改密码失败");
                            plus.nativeUI.closeWaiting();
                        }
                    }, () => {
                        plus.nativeUI.closeWaiting();
                        Neo.showMsg("修改密码错误");
                    });
                    break;
                case "forget":
                    plus.nativeUI.showWaiting("重置密码中...");
                    Neo.$http("POST", "account/resetPasswd", {
                        loginName: authInfo.mobile,
                        newPassword: authInfo.password,
                        verificationCode: authInfo.verificationCode
                    }).then((res: any) => {
                        if (!res.errorCode) {
                            Neo.setSettings("authInfo", {
                                loginName: authInfo.mobile,
                                password: authInfo.password,
                                loginType: 1
                            });
                            mui.later(() => {
                                plus.nativeUI.closeWaiting();
                                mui.back();
                            }, 300);
                        } else {
                            Neo.showError(res.errorCode, "重置密码失败");
                            plus.nativeUI.closeWaiting();
                        }
                    }).catch(() => {
                        plus.nativeUI.closeWaiting();
                    });
                    break;
                case "bindWx":
                    plus.nativeUI.showWaiting("绑定中...");
                    const loginInfo: any = {
                        loginName: authInfo.mobile,
                        password: authInfo.password,
                        thirdId: exceptResult.thirdUserId,
                        loginType: 1
                    };
                    register.login("bindThirdAccount", loginInfo);
                    break;
                default:
                    plus.nativeUI.closeWaiting();
                    break;
            }
        }
    }
};

const register: any = new Vue(LoginForm);

plusReady((view) => {
    Neo.hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        if (["bindWx", "resetPwd"].indexOf(view.pageType) >= 0) {
            plus.navigator.setStatusBarStyle("light");
        }
        view.close();
    };

    register.type = view.pageType;
    if (view.pageType === "forget") {
        register.title = "忘记密码";
        register.btnTxt = "重置密码";
    }
    if (view.pageType === "resetPwd") {
        register.title = "修改密码";
        register.btnTxt = "修改密码";
    }
    if (view.pageType === "bindWx") {
        register.title = "绑定账号";
        register.btnTxt = "绑定账号";
    }
    exceptResult = view.exceptResult;

});