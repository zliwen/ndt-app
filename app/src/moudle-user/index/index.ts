declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./index.scss";

const { plus, mui, plusReady, hideScroll, openPage, getImmersed } = Neo;
const template = require("./index.html");

mui.init({
    swipeBack: false
});

plusReady(() => {
    Neo.back();
    hideScroll();
    window.addEventListener("reloadData", () => {
        dashboard.reload();
    });
});

function getRecommendProducts() {
    Neo.$http("GET", "front/loanProduct/recommend/1/10", {
        type: -1
    }).then((res: any) => {
        if (!res.errorCode && res.data.pageData.length) {
            dashboard.list = res.data.pageData;
        } else {
            Neo.showError(res.errorCode);
        }
        dashboard.loading = false;
    }).catch(() => {
        dashboard.loading = "fail";
    });
}
function getRecommendPolicy() {
    Neo.$http("GET", "front/policy/recommend/1/10", {
        type: -1
    }).then((res: any) => {
        if (!res.errorCode && res.data.pageData.length) {
            dashboard.news = res.data.pageData.filter((item) => {
                return item.id && item.title;
            });
            dashboard.news.length >= 2 && initScroll(dashboard.news.length);
        } else {
            Neo.showError(res.errorCode);
        }
    });
}

// 政策滚动效果
function initScroll(len) {
    let index = 1;
    setInterval(() => {
        dashboard.scrollTop = -index * 1.18;
        if (index === len) {
            index = 0;
        } else {
            index++;
        }
    }, 3000);
}

// 获取推荐政策
getRecommendPolicy();
// 获取推荐产品
getRecommendProducts();

interface IListModel {
    loading: boolean;
    title: string;
    navList: object[];
    list: object[];
    news: object[];
    today: number;
    scrollTop: number;
}

const dashboard: any = new Vue({
    el: "#index",
    data(): IListModel {
        return {
            loading: true,
            title: "农贷通",
            scrollTop: 0,
            navList: [{
                id: "applications",
                desc: "正在申请",
                txt: "申请",
                icon: "assets/images/ndt/home_icon_application@3x.png",
                url: ""
            }, {
                id: "credit",
                desc: "完善资料",
                txt: "信用",
                icon: "assets/images/ndt/home_icon_credit@3x.png",
                url: ""
            }
                // , {
                //     id: "calculator",
                //     desc: "购买保险",
                //     txt: "保险",
                //     icon: "assets/images/ndt/home_icon_umbrella@3x.png",
                //     url: ""
                // }
            ],
            list: [],
            news: [],
            today: new Date().getTime()
        };
    },
    template,
    components: {
        "net-status": NetStatus
    },
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

        t = document.querySelector(".quikNav");
        t && ((t) => {
            const marginTop: any = getComputedStyle(t).marginTop;
            const top: number = Math.ceil(parseFloat(marginTop));
            t.style.marginTop = top + Neo.getImmersed() + "px";
        })(t);
    },
    methods: {
        logo: Neo.getProductImg,
        format: Neo.timeFormat,
        showUser() {
            mui.openWindow({
                url: "user.html",
                id: "user",
                show: {
                    aniShow: "slide-in-left",
                    duration: 300,
                    event: "loaded"
                },
                styles: {
                    hardwareAccelerated: true,
                    popGesture: "close"
                },
                waiting: {
                    autoShow: false
                }
            });
        },
        reload() {
            // 重新载入政策产品
            dashboard.loading = true;
            getRecommendProducts();
            getRecommendPolicy();
        },
        openPage(id: string, productId?) {
            if (["applications", "credit"].indexOf(id) >= 0) {
                if (!!Neo.getCookie("access_token")) {
                    openPage(id);
                } else {
                    openPage("login");
                }
            } else {
                Neo.showMsg("暂未开放，敬请期待");
            }
        },
        showPage(id: string, productId?) {
            openPage(id, { productId });
        },
        showNews(id: string, detail, type) {
            openPage(id, { detail, type });
        }
    }
});