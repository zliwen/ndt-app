declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./products.scss";

import "../../../../assets/js/mui.pullToRefresh.js";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./products.html");

mui.init({
    swipeBack: true
});

// 获取产品栏目
const icons = {
    icon3301: "icon-fin_btn_yd",
    icon3302: "icon-baoxian",
    icon3303: "icon-fin_btn_umb"
};

function initSlider() {
    const userData: any = Neo.getSettings("user");
    const divisionId = userData && userData.adminDivisionId && userData.adminDivisionId.toString();
    const divisions = divisionId ? [divisionId] : [5101];
    products.navList.forEach((item: any, index: number) => {
        products.navList.splice(index, 1, {
            ...item,
            icon: icons["icon" + item.id] || "icon-baoxian",
            pageNo: 1, pageSize: 5,
            list: [],
            loading: true
        });
        const current: any = products.navList[index];
        console.log(JSON.stringify({
            productType: current.id,
            divisions,
            searchType: 2
        }));
        Neo.$http("POST", "front/loanProduct/find/" + current.pageNo + "/" + current.pageSize, {
            productType: current.id,
            divisions,
            searchType: 2
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
                        Neo.$http("POST", "front/loanProduct/find/" + current.pageNo + "/" + current.pageSize, {
                            productType: current.id
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

plusReady((view) => {
    hideScroll();
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.close();
    };
    window.addEventListener("reloadData", (ev: any) => {
        init();
    });
});

interface IProducts {
    bannerImg: string;
    loading: boolean;
    current: number;
    navList: object[] | any;
}

const products: any = new Vue({
    el: "#products",
    template,
    data(): IProducts {
        return {
            bannerImg: "assets/images/ndt/banner_pic1.png",
            loading: true,
            current: 0,
            navList: []
        };
    },
    components: {
        "net-status": NetStatus
    },
    methods: {
        logo: Neo.getProductImg,
        showPage(id: string, productId) {
            openPage(id, { productId });
        },
        reload() {
            init();
        }
    },
    mounted() {
        Neo.setImmersed();
    }
});

function init() {
    // 获取栏目列表
    getCodeTable(33, (result) => {
        products.navList = result.sort((a, b) => {
            return a.key - b.key;
        });
        products.loading = false;
        initSlider();
    }, () => {
        products.loading = "fail";
    });
}
// 初始化
init();