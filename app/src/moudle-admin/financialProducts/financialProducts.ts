declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import { $http, CreatePage, getCodeTable, getProductImg, getSettings, hideScroll, mui, openPage, plus, setImmersed, showError } from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./financialProducts.scss";

import "../../../../assets/js/mui.pullToRefresh.js";

@Component({
    data() {
        return {
            bannerImg: "assets/images/ndt/banner_pic1.png"
        };
    },
    components: {
        "net-status": NetStatus
    },
    template: require("./financialProducts.html"),
    methods: {
        openMenu,
        closeMenu,
        logo: getProductImg
    },
    watch: {
        current(newVal, oldVal) {
            financialProducts.pageNo = 1;
            financialProducts.loading = true;
            getData({ pageNo: 1 }, resSuccess, resError);
        }
    }
})
export class FinancialProd extends Vue {
    public sortData: object[] = [{
        name: "按上架时间排序",
        value: "addTime"
    }, {
        name: "按优先级排序",
        value: "importance"
    }];
    public loading = true;
    public pageNo: number = 1;
    public productsList: object[] = [];
    public sortActive: boolean = false;
    public current: object = this.sortData[0];
    public params = {};

    toggleList() {
        this.sortActive = !this.sortActive;
    }
    setSort(index) {
        this.current = this.sortData[index];
        this.sortActive = !this.sortActive;
    }
    showPage(id: string, productId: string) {
        openPage(id, { productId });
    }
    reload() {
        this.pageNo = 1;
        this.loading = true;
        init();
    }
    mounted() {
        setImmersed();
        document.addEventListener("tap", () => {
            this.sortActive = false;
        }, false);
    }
}

let showMenu: boolean = false;
let menu: object | any;
const mask = mui.createMask(_closeMenu);

const financialProducts = CreatePage("financialProducts", FinancialProd, (view, page) => {
    mui.back = () => {
        if (showMenu) {
            // 菜单处于显示状态，返回键应该先关闭菜单,阻止主窗口执行mui.back逻辑；
            closeMenu();
            return false;
        } else {
            // 菜单处于隐藏状态，执行返回时，要先close菜单页面，然后继续执行mui.back逻辑关闭主窗口；
            menu.close("none");
            plus.nativeUI.closeWaiting();
            view.close();
            return true;
        }
    };
    window.addEventListener("reloadData", (ev: any) => {
        init();
    });
    menu = mui.preload({
        id: "filterPage",
        url: "filterPage.html",
        styles: {
            left: "100%",
            width: "80%",
            zindex: 9997
        }
    });
    // 在android4.4中的swipe事件，需要preventDefault一下，否则触发不正常
    // 故，在dragleft，dragright中preventDefault
    window.addEventListener("dragright", (e: any) => {
        e.detail.gesture.preventDefault();
    });
    window.addEventListener("dragleft", (e: any) => {
        e.detail.gesture.preventDefault();
    });
    // 主界面向左滑动，若菜单未显示，则显示菜单；否则不做任何操作；
    // window.addEventListener("swipeleft", openMenu);
    // 主界面向右滑动，若菜单已显示，则关闭菜单；否则，不做任何操作；
    window.addEventListener("swiperight", closeMenu);
    // menu页面向右滑动，关闭菜单；
    window.addEventListener("menu:swiperight", closeMenu);

    window.addEventListener("getData", (ev: any) => {
        console.log(JSON.stringify(ev.detail));
        financialProducts.pageNo = 1;
        financialProducts.loading = true;
        financialProducts.params = { ...ev.detail };
        getData({ pageNo: 1 }, resSuccess, resError);
        closeMenu();
    });

});

function openMenu() {
    if (!showMenu) {
        menu.show("none", 0, () => {
            menu.setStyle({
                left: "20%",
                transition: {
                    duration: 150
                }
            });
        });
        // 显示主窗体遮罩
        mask.show();
        showMenu = true;
        plus.navigator.setStatusBarStyle("dark");
    }
}

function closeMenu() {
    _closeMenu();
    mask.close();
}

function _closeMenu() {
    if (showMenu) {
        menu.setStyle({
            left: "100%",
            transition: {
                duration: 150
            }
        });
        // 等窗体动画结束后，隐藏菜单webview，节省资源；
        setTimeout(() => {
            menu.hide();
        }, 200);
        showMenu = false;
        plus.navigator.setStatusBarStyle("light");
    }
}

function getData(param, success?, error?) {
    const userData: object | any = getSettings("user");
    const divisionId = userData && userData.adminDivisionId && userData.adminDivisionId.toString();

    const data: any = {};
    if (financialProducts.current.value === "addTime") {
        data.addTime = true;
    }
    if (financialProducts.current.value === "importance") {
        data.importance = true;
    }
    $http("POST", "front/loanProduct/find/" + param.pageNo + "/10", {
        divisions: divisionId ? [divisionId] : [],
        searchType: 2,
        ...data,
        ...param.data,
        ...financialProducts.params
    }).then((res: any) => {
        success && success(res);
    }).catch((res: any) => {
        error && error();
    });
}

function init() {
    getData({ pageNo: 1 }, resSuccess, resError);
}
init();

function resSuccess(res: any) {
    if (!res.errorCode && res.data.pageData) {
        financialProducts.productsList = res.data.pageData;
        financialProducts.pageNo += 1;
    } else {
        showError(res.errorCode);
    }
    financialProducts.loading = false;
    res.data.pageData.length && mui.later(() => {
        mui(".mui-scroll-wrapper").scroll({
            deceleration: 0.0005 // flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
        });
        mui(window["products-list"]).pullToRefresh({
            up: {
                contentinit: "正在加载中...",
                contentnomore: "",
                callback() {
                    const self = (this as any);
                    getData({
                        pageNo: financialProducts.pageNo
                    }, (res: any) => {
                        if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                            financialProducts.productsList.splice(financialProducts.productsList.length, 0, ...res.data.pageData);
                            financialProducts.pageNo += 1;
                        } else {
                            showError(res.errorCode);
                        }
                        self.endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== 10);
                    }, () => {
                        self.endPullUpToRefresh(true);
                    });
                }
            }
        }).endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== 10);
    }, 500);
}

function resError() {
    financialProducts.loading = "fail";
}