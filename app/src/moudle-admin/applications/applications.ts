declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./applications.scss";

import "../../../../assets/js/mui.pullToRefresh.js";

const { plus, mui, plusReady, hideScroll, openPage, addPageEvent } = Neo;
const template = require("./applications.html");

const userData = Neo.getSettings("user");

mui.init({
    swipeBack: true
});

plusReady((view) => {
    hideScroll();
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.close();
    };
    addPageEvent("delete", (ev: any) => {
        const { index, subIndex } = ev.detail;
        applications.navList[index].list.splice(subIndex, 1);
    });
    addPageEvent("reloadData", (ev: any) => {
        init();
    });
});

function initSlider() {
    applications.navList.forEach((item: any, index: number) => {
        applications.navList.splice(index, 1, {
            ...item,
            pageNo: 1, pageSize: 5,
            list: [],
            loading: true
        });
        const current: any = applications.navList[index];
        Neo.$http("POST", "loanInvitation/list/" + current.pageNo + "/" + current.pageSize, {
            productTypeId: current.id
        }).then((res: any) => {
            if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                current.list = res.data.pageData;
                current.pageNo += 1;
            } else {
                Neo.showError(res.errorCode);
            }
            current.loading = false;
            mui(window["scroll-" + current.id]).pullToRefresh({
                up: {
                    contentinit: "正在加载中...",
                    contentnomore: "",
                    callback() {
                        const self = (this as any);
                        Neo.$http("POST", "loanInvitation/list/" + current.pageNo + "/" + current.pageSize, {
                            productTypeId: current.id
                        }).then((res: any) => {
                            if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                                current.list.splice(current.list.length, 0, ...res.data.pageData);
                                current.pageNo += 1;
                            } else {
                                Neo.showError(res.errorCode);
                            }
                            self.endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== current.pageSize);
                        });
                    }
                }
            }).endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== current.pageSize);
            mui("#slider").slider();
        }).catch(() => {
            current.loading = "fail";
        });
    });
}

interface IProducts {
    loading: boolean;
    navList: object[] | any;
    current: number;
}

const applications: any = new Vue({
    el: "#applications",
    template,
    data(): IProducts {
        return {
            loading: true,
            navList: [],
            current: 0
        };
    },
    components: {
        "net-status": NetStatus
    },
    methods: {
        showPage(id: string, detail, index, subIndex) {
            openPage(id, {
                detail,
                index,
                subIndex
            });
        },
        logo: Neo.getProductImg,
        format: Neo.timeFormat,
        getUnit: Neo.getUnit,
        reload() {
            init();
        }
    },
    mounted() {
        Neo.setImmersed();
        mui(".mui-scroll-wrapper").scroll({
            indicators: true, // 是否显示滚动条
            bounce: true
        });
    }
});

function init() {
    // 获取产品类型列表
    Neo.getCodeTable(33, (result) => {
        applications.navList = result.sort((a, b) => {
            return a.key - b.key;
        });
        applications.loading = false;
        initSlider();
    }, () => {
        applications.loading = "fail";
    });
}
init();