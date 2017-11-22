declare function require(path: string): any;

import { Base64 } from "js-base64";
import Vue from "vue";
import * as Neo from "../../common";
import "./forget.scss";

const { plus, mui, plusReady, layer } = Neo;
const template = require("./forget.html");

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
});

interface ILoginModel {
    phone: number;
    validateId: string;
}

const ForgetForm: object | any = {
    el: "#forget",
    data(): ILoginModel {
        return {
            phone: "",
            validateId: ""
        };
    },
    template,
    mounted() {
        Neo.setImmersed();
    },
    methods: {
    	getValidateId(this: ILoginModel) {
    		this.blur();
            if (!Neo.testPhone(this.phone)) {
                return Neo.showMsg("请输入正确的手机号码");
            }
            
            const vallidateBtn: any = document.getElementById("vallidateBtn");
            const businessType = 1;
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
        next(){
          this.blur();
          if (!Neo.testPhone(this.phone)) {
            return Neo.showMsg("请输入正确的手机号码");
          }
          
          if (!this.validateId) {
            return Neo.showMsg("请输入正确的短信验证码");
          }
          
          var param = {};
          param.phone = this.phone;
          param.validateId = this.validateId;
          Neo.openPage("newpwd", param);
        },
        blur() {
            const inputs: any = document.querySelectorAll(".loginForm input");
            mui.each(inputs, (index, element) => {
                element.blur();
            });
        }
    }
};

const forget: any = new Vue(ForgetForm);
