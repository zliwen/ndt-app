declare function require(path: string): any;

import Vue from "vue";
import * as Neo from "../../common";
import "./apply.scss";

import "../../../../assets/js/mui.picker.min.js";

const { plus, mui, plusReady, hideScroll, openPage, getViewById, getCodeTable } = Neo;
const template = require("./apply.html");

const userInfo = Neo.getSettings("user");

mui.init({
    swipeBack: true
});

interface IApply {
    month: number;
    userInfo: object | null;
    detail: object | null;
    applyInfo: object;
    selectType: number[];
    loanType: object[];
    division: string;
}

const apply: any = new Vue({
    el: "#apply",
    template,
    data(): IApply {
        return {
            month: 3,
            detail: {},
            userInfo: null,
            loanType: [],
            selectType: [],
            applyInfo: {},
            division: ""
        };
    },
    methods: {
        showPage(id: string) {
            openPage(id);
        },
        showPicker(pickerName) {
            picker[pickerName].show(picker[pickerName].showCb);
        },
        handelSelect(id) {
            if (apply.selectType.indexOf(id) < 0) {
                apply.selectType = [id];
                // apply.selectType.push(id);
            } else {
                const index = apply.selectType.indexOf(id);
                apply.selectType.splice(index, 1);
            }
        },
        replaceNum: Neo.replaceNum,
        submit() {
            if (apply.userInfo) {
                if (apply.userInfo.adminDivisionId === 5101 || !apply.userInfo.adminDivisionId) {
                    return Neo.showMsg("请完善地址信息");
                }
                if (!apply.userInfo.identityId) {
                    return Neo.showMsg("请完善身份证信息");
                }
            }
            if (!apply.applyInfo.applyAmount || apply.applyInfo.applyAmount <= 0 || !Neo.IsNumeric(apply.applyInfo.applyAmount)) {
                return Neo.showMsg("请填写正确的贷款金额");
            }
            if (apply.applyInfo.applyAmount > apply.detail.maxAmount) {
                return Neo.showMsg("大于规定贷款金额");
            }
            // if (!apply.applyInfo.applyAmountUnit) {
            //     return Neo.showMsg("请选择贷款金额单位");
            // }
            if (!apply.applyInfo.applyTerm || apply.applyInfo.applyTerm <= 0 || !Neo.IsNumeric(apply.applyInfo.applyTerm)) {
                return Neo.showMsg("请填正确的写贷款期限");
            }
            if (apply.applyInfo.applyTerm > apply.detail.maxTerm) {
                return Neo.showMsg("大于规定贷款期限");
            }
            // if (!apply.applyInfo.applyTermUnit) {
            //     return Neo.showMsg("请选择贷款期限单位");
            // }
            if (!apply.selectType.length) {
                return Neo.showMsg("请选择贷款方式，至少一项");
            }
            if (!apply.applyInfo.applyPurpose) {
                return Neo.showMsg("请选择贷款用途");
            }
            // if (!apply.applyInfo.guaranteeName) {
            //     return Neo.showMsg("抵押物名称不能为空");
            // }

            const data = {
                orgId: apply.detail.orgId,
                loanProductId: apply.detail.id,
                applyPurpose: apply.applyInfo.applyPurpose,
                applyAmount: Number(apply.applyInfo.applyAmount),
                applyAmountUnit: apply.applyInfo.applyAmountUnit,
                applyTerm: Number(apply.applyInfo.applyTerm),
                applyTermUnit: apply.applyInfo.applyTermUnit,
                guaranteeType: apply.selectType,
                guaranteeTypeItems: [{
                    name: apply.applyInfo.guaranteeName,
                    remark: apply.applyInfo.guaranteeRemark
                }]
            };

            plus.nativeUI.showWaiting("提交申请中");
            Neo.$http("POST", "loanApply/add", data).then((rep: any) => {
                if (!rep.errorCode) {
                    // 关闭产品详情页
                    getViewById("productDetail").close("none");
                    mui.later(() => {
                        plus.nativeUI.closeWaiting();
                        Neo.showMsg("提交成功");
                        mui.back();
                    }, 1000);
                } else {
                    Neo.showError(rep.errorCode, "提交申请失败");
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

// 获取贷款用途
const industryPicker = new mui.PopPicker();
const industryData: object[] = [];
industryPicker.showCb = (selectItems) => {
    apply.applyInfo = { ...apply.applyInfo, applyPurpose: selectItems[0].value };
    apply.applyInfo = { ...apply.applyInfo, applyPurposeName: selectItems[0].text };
};
getCodeTable(21, (result) => {
    result.forEach((item) => {
        industryData.push({
            value: item.id,
            text: item.value
        });
    });
    industryPicker.setData(industryData);
});

// // 获取金额单位
// const sumUnitPicker = new mui.PopPicker();
// const sumUnit: object[] = [];
// sumUnitPicker.showCb = (selectItems) => {
//     apply.applyInfo = { ...apply.applyInfo, applyAmountUnit: selectItems[0].value };
//     apply.applyInfo = { ...apply.applyInfo, applyAmountUnitName: selectItems[0].text };
// };
// getCodeTable(22, (result) => {
//     result.forEach((item) => {
//         sumUnit.push({
//             value: item.id,
//             text: item.value
//         });
//     });
//     sumUnitPicker.setData(sumUnit);
// });

// // 获取期限单位
// const dateUnitPicker = new mui.PopPicker();
// const dateUnit: object[] = [];
// dateUnitPicker.showCb = (selectItems) => {
//     apply.applyInfo = { ...apply.applyInfo, applyTermUnit: selectItems[0].value };
//     apply.applyInfo = { ...apply.applyInfo, applyTermUnitName: selectItems[0].text };
// };
// getCodeTable(23, (result) => {
//     result.forEach((item) => {
//         dateUnit.push({
//             value: item.id,
//             text: item.value
//         });
//     });
//     dateUnitPicker.setData(dateUnit);
// });

// 获取贷款方式类型
getCodeTable(28, (result) => {
    apply.loanType = result;
});

// 所有Picker容器
const picker = {
    industryPicker
    // dateUnitPicker,
    // sumUnitPicker
};

plusReady((view) => {
    hideScroll();
    mui.back = () => {
        plus.nativeUI.closeWaiting();
        view.close();
    };

    // 获取贷款产品详情
    apply.detail = view.detail;
    apply.applyInfo = {
        ...apply.applyInfo,
        // applyAmountUnit: view.detail.maxAmountUnit,
        applyAmountUnit: 2201,
        // applyAmountUnitName: view.detail.maxAmountUnitName,
        applyAmountUnitName: "元",
        applyTermUnit: 2302,
        // applyTermUnit: view.detail.maxTermUnit,
        applyTermUnitName: "月"
        // applyTermUnitName: view.detail.maxTermUnitName
    };
});

function getUserInfo() {
    // 获取用户信息或企业信息
    let url = "person/findByUserId";
    if (userInfo.userType === 203) {
        url = "front/company/detail/" + userInfo.userId;
    }
    Neo.$http("GET", url, {
        userId: userInfo.userId
    }).then((res: any) => {
        if (!res.errorCode && res.data) {
            apply.userInfo = res.data;
        } else {
            Neo.showError(res.errorCode, "获取信息失败");
        }
    });
    Neo.getDivision(userInfo.adminDivisionId, (data) => {
        apply.division = data.fullName;
    });
}

userInfo && getUserInfo();