declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./realAuth.scss";

// 图像上传裁切指令
import "../../directives/imgCropper";

import "../../../../assets/js/mui.picker.min.js";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./realAuth.html");

const userInfo = Neo.getSettings("user");
let taskId = "";

mui.init({
    swipeBack: true
});

function getUserInfo() {
    let url = "person/findByUserId";
    if (userInfo.userType === 203) {
        url = "front/company/detail/" + userInfo.userId;
    }
    Neo.$http("GET", url, {
        userId: userInfo.userId
    }).then((res: any) => {
        if (!res.errorCode) {
            if (res.data.relatedImgUrls) {
                const relatedImgUrls = JSON.parse(res.data.relatedImgUrls);
                res.data = { ...res.data, positive: relatedImgUrls[0], negative: relatedImgUrls[1], handle: relatedImgUrls[2] };
            }
            realAuth.info = res.data;
        } else {
            Neo.showError(res.errorCode, "获取信息失败");
        }
        realAuth.loading = false;
    }).catch(() => {
        realAuth.loading = "fail";
    });
}
getUserInfo();

plusReady((view) => {
    hideScroll();
    Neo.setCloseBarStyle(view);
    taskId = view.taskId;
});

interface IProductDetail {
    info: object | any;
    loading: boolean;
    userType: number;
}

const realAuth: any = new Vue({
    el: "#realAuth",
    template,
    data(): IProductDetail {
        return {
            info: null,
            loading: true,
            userType: userInfo.userType
        };
    },
    components: {
        "net-status": NetStatus
    },
    methods: {
        getUnit: Neo.getUnit,
        showPage(id: string) {
            openPage(id);
        },
        replaceUrl(url) {
            if (url && String(url).indexOf("http") < 0) {
                return Neo.REMOTE + "file/download/" + url;
            } else {
                return url;
            }
        },
        reload() {
            getUserInfo();
        },
        imgChange(newVal, type) {
            realAuth.info = { ...realAuth.info, [type]: newVal };
            (this.$refs[type] as any).classList.remove(type);
        },
        saveInfo() {
            if (realAuth.info.name.length <= 1 || realAuth.info.name.length <= 1) {
                return mui.toast("请填写正确的姓名");
            }
            if (!realAuth.info.handle || !realAuth.info.positive || !realAuth.info.negative) {
                return mui.toast("请补全用户身份资料");
            }
            let params: any = {};
            let url: string = "person/update";
            if (userInfo.userType === 203) {
                if (!Neo.testIdNumber(realAuth.info.legalPersonIdentityId || "")) {
                    return mui.toast("请填写正确的法人身份证号");
                }
                url = "front/company/update";
                params = {
                    ...params, legalPerson: realAuth.info.legalPerson, legalPersonIdentityId: realAuth.info.legalPersonIdentityId,
                    relatedImgUrls: JSON.stringify([realAuth.info.positive, realAuth.info.negative, realAuth.info.handle])
                };
            }
            if (userInfo.userType === 202) {
                if (!Neo.testIdNumber(realAuth.info.identityId || "")) {
                    return mui.toast("请填写正确的身份证号");
                }
                params = {
                    ...params, name: realAuth.info.name, identityId: realAuth.info.identityId,
                    relatedImgUrls: JSON.stringify([realAuth.info.positive, realAuth.info.negative, realAuth.info.handle])
                };
            }
            plus.nativeUI.showWaiting("认证资料保存中...");
            Neo.$http("POST", url, params).then((res: any) => {
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
                                    plus.nativeUI.closeWaiting();
                                    mui.back();
                                }, 1000);
                            } else {
                                plus.nativeUI.closeWaiting();
                                Neo.showError(rsp.errorCode, "认证失败");
                            }
                        }).catch(() => {
                            mui.toast("认证失败");
                        });
                    }
                } else {
                    Neo.showError(res.errorCode, res.data || "保存失败");
                    plus.nativeUI.closeWaiting();
                }
            }).catch(() => {
                plus.nativeUI.closeWaiting();
            });
        }
    },
    mounted() {
        Neo.setImmersed();
    }
});
