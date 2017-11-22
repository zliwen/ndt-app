declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import "./applicationDetail.scss";

const { plus, mui, plusReady, hideScroll, openPage, setCloseBarStyle } = Neo;
const template = require("./applicationDetail.html");

mui.init({
    swipeBack: true
});

interface IProductDetail {
    bannerImg: string;
    detail: object | null;
    loanFlow: object[];
}

plusReady((view) => {
    hideScroll();
    setCloseBarStyle(view);
    const applicationDetail: any = new Vue({
        el: "#applicationDetail",
        template,
        data(): IProductDetail {
            return {
                bannerImg: "assets/images/ndt/status_progress.jpg",
                detail: view.detail,
                loanFlow: []
            };
        },
        methods: {
            logo: Neo.getProductImg,
            getUnit: Neo.getUnit,
            timeFormat: Neo.timeFormat,
            showPage(id: string) {
                openPage(id);
            },
            cancelApply() {
                mui.confirm("", "确认取消申请?", "", (e) => {
                    if (e.index === 1) {
                        plus.nativeUI.showWaiting("取消申请中...");
                        Neo.$http("POST", "loanInvitation/delete", {
                            id: applicationDetail.detail.id
                        }).then((res: any) => {
                            if (!res.errorCode) {
                                mui.fire(plus.webview.getWebviewById("applications"), "delete", {
                                    index: view.index,
                                    subIndex: view.subIndex
                                });
                                mui.later(() => {
                                    plus.nativeUI.closeWaiting();
                                    mui.back();
                                }, 1000);
                            } else {
                                mui.toast("取消申请失败");
                                plus.nativeUI.closeWaiting();
                            }
                        }).catch(() => {
                            plus.nativeUI.closeWaiting();
                        });
                    }
                }, "div");
            }
        },
        mounted() {
            Neo.setImmersed();
        }
    });

    // Neo.$http("GET", "loanApply/detail", {
    //     id: view.detail.loanApplyId
    // }).then((res: any) => {

    // });

    Neo.$http("POST", "loanFlowSync/list/1/10", {
        invitationId: view.detail.id
    }).then((res: any) => {
        if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
            applicationDetail.loanFlow = res.data.pageData;
        } else {
            Neo.showError(res.errorCode, "获取贷款申请流程失败");
        }
    });
});
