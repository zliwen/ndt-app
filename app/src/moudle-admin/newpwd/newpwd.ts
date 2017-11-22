declare function require(path: string): any;

import { Base64 } from "js-base64";
import Vue from "vue";
import * as Neo from "../../common";
import "./newpwd.scss";

const { plus, mui, plusReady, layer } = Neo;
const template = require("./newpwd.html");

mui.init({
    swipeBack: true
});

interface ILoginModel {
    phone: number;
    validateId: string;
    password:string;
    repeatPwd:string;
}

const NewPwdForm: object | any = {
    el: "#newpwd",
    data(): ILoginModel {
        return {
            phone: "",
            validateId: "",
            password:"",
            repeatPwd:''
        };
    },
    template,
    mounted() {
        Neo.setImmersed();
    },
    methods: {
    	auth(this: ILoginModel) {
            this.blur();
            if (this.password.length < 6) {
                return Neo.showMsg("密码少于6位");
            }
            if (this.password !== this.repeatPwd) {
                return Neo.showMsg("两次密码输入不一致");
            }
            return true;
        },
    	finish(this: ILoginModel) {
            if (this.auth()) {
                var param = {};
                param.loginName = this.phone;
                param.verificationCode = this.validateId;
                param.newPassword = Base64.encode(this.password);
                Neo.ajax("POST", "account/resetPasswd", param, (res: any) => {
                    if (res.errorCode == 0) {
                    	Neo.showMsg("重置密码成功!");
                        Neo.openPage("login");
                    }else if(res.errorCode == 1002){
                        this.$modal.toast({
                            template: '手机验证码错误'
                        });
                    }
	            }, () => {
	                plus.nativeUI.closeWaiting();
	                Neo.showMsg("重置密码错误");
	            });
            }
        },
        blur() {
            const inputs: any = document.querySelectorAll(".loginForm input");
            mui.each(inputs, (index, element) => {
                element.blur();
            });
        }
    }
};

const newpwd: any = new Vue(NewPwdForm);

plusReady((view) => {
    Neo.hideScroll();
    plus.navigator.setStatusBarStyle("dark");
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        plus.navigator.setStatusBarStyle("light");
        view.close();
    };
    
    newpwd.phone = view.phone;
    newpwd.validateId = view.validateId
});
