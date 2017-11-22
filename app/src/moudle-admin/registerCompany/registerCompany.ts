declare function require(path: string): any;

import { Base64 } from "js-base64";
import Vue from "vue";
import * as Neo from "../../common";
import "./registerCompany.scss";

import "../../../../assets/js/mui.picker.min.js";

const { plus, mui, plusReady } = Neo;
const template = require("./registerCompany.html");
const userInfo = Neo.getSettings("user");
let isExist = false;

mui.init({
    swipeBack: true
});

// 证件类型
const paperTypePicker = new mui.PopPicker();
paperTypePicker.setData([
    { value: 1501, text: "普通营业执照（存在独立的组织机构代码证）" },
    { value: 1502, text: "多证合一营业执照（不存在独立的组织机构代码证）" }
]);
paperTypePicker.pickers[0].setSelectedValue(1501);
paperTypePicker.showCb = (item) => {
    console.log(item[0].text + ":" + item[0].value);
    register.paperType = item[0].value;
    register.paperTypeName = item[0].text;
};

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
    paperTypePicker,
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
    password: string;
    repeatPwd: string;
    validateId: string;
    type: string;
    btnTxt: string;
    title: string;
    paperType: number;
    paperTypeName: string;
    blur?: any;
    regetTimer?: any;
    resetBtn?: any;
    auth?: any;
    adminDivisionId: number;
    address: object | any;
    name: string;
    step: number;
    corporation: string;
    corporationIdentity: string;
    contactName: string;
    contactIdentityId: string;
    code: string;
    addressStr: string;
}
const LoginForm: object | any = {
    el: "#registerCompany",
    data(): ILoginModel {
        return {
            phone: userInfo && userInfo.phone || "",
            password: "",
            validateId: "",
            name: "",
            paperType: 1501,
            paperTypeName: "",
            adminDivisionId: 0,
            repeatPwd: "",
            type: "register",
            title: "企业注册",
            btnTxt: "完成注册，进入农贷通",
            address: {},
            step: 1,
            code: "",
            corporation: "",
            corporationIdentity: "",
            contactName: "",
            contactIdentityId: "",
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
        nextStep(this: ILoginModel) {
            if (this.step === 2) {

            } else {
                if (!this.auth()) {
                    return false;
                }
                this.step += 1;
            }
        },
        blur() {
            const inputs: any = document.querySelectorAll(".loginForm input");
            mui.each(inputs, (index, element) => {
                element.blur();
            });
        },
        isExist(this: ILoginModel) {
            if (Neo.testPhone(this.phone)) {
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
        getValidateId(this: ILoginModel) {
            if (!this.auth()) {
                return false;
            }
            if (isExist) {
                return Neo.showMsg("用户或记录已存在");
            }
            const vallidateBtn: any = document.getElementById("vallidateBtn");
            vallidateBtn.classList.add("mui-disabled");
            Neo.$http("GET", "verify/getCode", { mobile: this.phone, businessType: 0 }).then((res: any) => {
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
            // 验证手机号码
            if (!Neo.testPhone(this.phone)) {
                return Neo.showMsg("请输入正确的手机号码");
            }
            if (this.password.length < 6) {
                return Neo.showMsg("密码少于6位");
            }
            if (this.password !== this.repeatPwd) {
                return Neo.showMsg("两次密码输入不一致");
            }
            if (!this.adminDivisionId) {
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
            if (this.name.length <= 1) {
                return mui.toast("请填写正确的企业名称");
            }
            if (!this.code) {
                return mui.toast(this.paperType === 1501 ? "请输入企业工商注册号" : "社会统一信用代码");
            }
            if (this.corporation.length <= 1) {
                return mui.toast("请填写正确的法人姓名");
            }
            if (!Neo.testIdNumber(this.corporationIdentity)) {
                return mui.toast("请填写正确的法人身份证号");
            }
            if (this.contactName.length <= 1) {
                return mui.toast("请填写正确的联系人姓名");
            }
            if (!Neo.testIdNumber(this.contactIdentityId)) {
                return mui.toast("请填写正确的联系人身份证号");
            }
            if (!Neo.IsNumeric(this.validateId)) {
                return Neo.showMsg("请输入正确的短信验证码");
            }
            // 获取注册信息
            const { city, county, town, village } = this.address;
            const authInfo = {
                registerInfo: {
                    mobile: this.phone.toLowerCase(),
                    password: Base64.encode(this.password),
                    verificationCode: this.validateId,
                    adminDivisionId: this.adminDivisionId,
                    // address: (city || "") + (county || "") + (town || "") + (village || "")
                    address: this.addressStr
                },
                companyInfo: {
                    name: this.name,
                    code: this.code,
                    paperType: this.paperType,
                    corporation: this.corporation,
                    corporationIdentity: this.corporationIdentity,
                    contactName: this.contactName,
                    contactIdentityId: this.contactIdentityId
                }
            };
            // 获取user页面
            console.log(JSON.stringify(authInfo.companyInfo));
            plus.nativeUI.showWaiting("注册中...");
            Neo.$http("POST", "company/register", authInfo).then((res: any) => {
                if (!res.errorCode) {
                    const loginInfo: any = {
                        loginName: authInfo.registerInfo.mobile,
                        password: authInfo.registerInfo.password,
                        loginType: 1
                    };
                    plus.nativeUI.closeWaiting();
                    register.login("login", loginInfo);
                } else {
                    Neo.showError(res.errorCode, "注册失败");
                    plus.nativeUI.closeWaiting();
                }
            }).catch(() => {
                plus.nativeUI.closeWaiting();
            });
        }
    }
};

const register: any = new Vue(LoginForm);

plusReady((view) => {
    Neo.hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        if (register.step === 2) {
            register.step = 1;
        } else {
            plus.nativeUI.closeWaiting();
            view.close();
        }
    };
    register.type = view.pageType;
});