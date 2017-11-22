declare function require(path: string): any;

import Vue from "vue";
import Component from "vue-class-component";
import * as Neo from "../../common";
import NetStatus from "../../components/netStatus/netStatus";
import "./news.scss";

import "../../../../assets/js/mui.pullToRefresh.js";

const { plus, mui, plusReady, hideScroll, openPage, getCodeTable } = Neo;
const template = require("./news.html");

mui.init({
    swipeBack: false
});

// 获取政策
function getPolicy(opt) {
    const userData: any = Neo.getSettings("user");
    const divisionId = userData && userData.adminDivisionId;
    Neo.$http("POST", "front/policy/search/" + opt.pageNo + "/" + 5, {
        divisionId,
        searchType: 2,
        pageSize: 5,
        type: opt.type,
        ...opt.data
    }).then((res) => {
        opt.success && opt.success(res);
    }).catch(() => {
        opt.error && opt.error();
    });
}
function getPolicyList() {
    getPolicy({
        pageNo: 1,
        type: 6501,
        success(res) {
            if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                news.policyList = {
                    ...news.policyList,
                    list: res.data.pageData,
                    pageNo: news.policyList.pageNo + 1,
                    loading: false
                };
                mui(window["scroll-policy"]).pullToRefresh({
                    up: {
                        contentinit: "正在加载中...",
                        contentnomore: "",
                        callback() {
                            const self = (this as any);
                            getPolicy({
                                pageNo: news.policyList.pageNo,
                                type: 6501,
                                success(res) {
                                    if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                                        news.policyList.list.splice(news.policyList.list.length, 0, ...res.data.pageData);
                                    } else {
                                        Neo.showError(res.errorCode);
                                    }
                                    self.endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== news.policyList.pageSize);
                                }
                            });
                        }
                    }
                }).endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== news.policyList.pageSize);
                mui("#sliderSegmentedControl").scroll();
            } else {
                Neo.showError(res.errorCode);
                news.policyList = {
                    ...news.policyList,
                    loading: false
                };
            }
        },
        error() {
            news.policyList = {
                ...news.policyList,
                loading: "fail"
            };
        }
    });
}
// 获取农贷通政策
function getNdtPolicyList() {
    getPolicy({
        pageNo: 1,
        type: 6502,
        success(res) {
            if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                news.ndtPolicyList = {
                    ...news.ndtPolicyList,
                    list: res.data.pageData,
                    pageNo: news.ndtPolicyList.pageNo + 1,
                    loading: false
                };
                mui(window["scroll-ndtPolicy"]).pullToRefresh({
                    up: {
                        contentinit: "正在加载中...",
                        contentnomore: "",
                        callback() {
                            const self = (this as any);
                            getPolicy({
                                pageNo: news.ndtPolicyList.pageNo,
                                type: 6502,
                                success(res) {
                                    if (!res.errorCode && res.data.pageData && res.data.pageData.length) {
                                        news.ndtPolicyList.list.splice(news.ndtPolicyList.list.length, 0, ...res.data.pageData);
                                    } else {
                                        Neo.showError(res.errorCode);
                                    }
                                    self.endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== news.ndtPolicyList.pageSize);
                                }
                            });
                        }
                    }
                }).endPullUpToRefresh(!res.data || res.data.pageData && res.data.pageData.length !== news.ndtPolicyList.pageSize);
                mui("#sliderSegmentedControl").scroll();
            } else {
                Neo.showError(res.errorCode);
                news.ndtPolicyList = {
                    ...news.ndtPolicyList,
                    loading: false
                };
            }
        },
        error() {
            news.ndtPolicyList = {
                ...news.ndtPolicyList,
                loading: "fail"
            };
        }
    });
}

function initSlider() {
    const userData: any = Neo.getSettings("user");
    const divisionId = userData && userData.adminDivisionId;
    news.navList.forEach((item: any, index: number) => {
        news.navList.splice(index, 1, { ...item, pageNo: 1, pageSize: 5, list: [], loading: true });
        const current: any = news.navList[index];
        Neo.$http("POST", "front/info/search/" + current.pageNo + "/" + current.pageSize, {
            type: current.id,
            divisionId,
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
                        Neo.$http("POST", "front/info/search/" + current.pageNo + "/" + current.pageSize, {
                            type: current.id
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
            mui("#sliderSegmentedControl").scroll();
        }).catch(() => {
            current.loading = "fail";
        });
    });
}

plusReady((view) => {
    Neo.back();
    hideScroll();
    window.addEventListener("reloadData", (ev: any) => {
        init();
    });
});

@Component({
    template,
    filters: {
        format: Neo.timeFormat
    },
    components: {
        "net-status": NetStatus
    }
})
class News extends Vue {
    current: number = 0;
    loading: any = true;
    navList: object[] | any = [];
    policyList: object | any = {
        pageNo: 1, pageSize: 5, list: [], loading: true
    };
    ndtPolicyList: object | any = {
        pageNo: 1, pageSize: 5, list: [], loading: true
    };
    logo(url) {
        return Neo.getImgUrl(url);
    }
    reload() {
        init();
    }
    showPage(id, detail, type) {
        Neo.openPage(id, {
            detail,
            type: type ? type : "info"
        });
    }
    mounted() {
        Neo.setImmersed();
    }
}

const news = new News().$mount("#news");
// 初始化数据
function init() {
    // 获取资讯栏目
    getCodeTable(3, (result) => {
        news.navList = result.sort((a, b) => {
            return a.key - b.key;
        });
        news.loading = false;
        getPolicyList();
        getNdtPolicyList();
        initSlider();
    }, () => {
        news.loading = "fail";
    });
}
init();