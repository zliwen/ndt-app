declare function require(path: string): any;
const mui = (window as any).mui;
import "./creditData.scss";

const props = ["detail"];

export const render = {
    qySight: {
        StatusComp: {
            props,
            template: require("./statusComp.html"),
            methods: {
                val(this: any, val: any) {
                    return this.detail[val] === "true" ? "是" : "否";
                }
            }
        },
        LawPersonComp: {
            props,
            template: require("./lawPersonComp.html")
        }
    },
    baseInfo: {
        CompanyInfo: {
            props,
            template: require("./companyInfo.html")
        },
        ShareHolder: {
            props,
            template: require("./shareHolder.html")
        },
        OverseaInst: {
            props,
            template: require("./shareHolder.html")
        },
        BoardDirector: {
            props,
            template: require("./shareHolder.html")
        },
        Branchs: {
            props,
            template: require("./shareHolder.html")
        },
        CompanyInforChange: {
            props,
            template: require("./shareHolder.html")
        }
    },
    law: {
        OpenCourtNotification: {
            props,
            template: require("./shareHolder.html")
        },
        CourtNotification: {
            props,
            template: require("./shareHolder.html")
        },
        JudgeDoc: {
            props,
            template: require("./shareHolder.html")
        },
        ExecutedPerson: {
            props,
            template: require("./shareHolder.html")
        },
        CrackCreditExecutedPerson: {
            props,
            template: require("./shareHolder.html")
        },
        Auction: {
            props,
            template: require("./shareHolder.html")
        },
        StockFreeze: {
            props,
            template: require("./shareHolder.html")
        },
        AdminExecute: {
            props,
            template: require("./shareHolder.html")
        },
        OperationException: {
            props,
            template: require("./shareHolder.html")
        },
        Liquidation: {
            props,
            template: require("./shareHolder.html")
        }
    },
    commercial: {
        SocialFunds: {
            props,
            template: require("./shareHolder.html")
        },
        PubFunds: {
            props,
            template: require("./shareHolder.html")
        },
        ChattelMort: {
            props,
            template: require("./shareHolder.html")
        },
        EquityPledged: {
            props,
            template: require("./shareHolder.html")
        },
        BidInviting: {
            props,
            template: require("./shareHolder.html")
        },
        Bidding: {
            props,
            template: require("./shareHolder.html")
        },
        Recruit: {
            props,
            template: require("./shareHolder.html")
        },
        AnnualDoc: {
            props,
            template: require("./shareHolder.html")
        }
    },
    propertyRight: {
        BrandInfor: {
            props,
            template: require("./shareHolder.html")
        },
        PatentDetail: {
            props,
            template: require("./shareHolder.html")
        },
        SoftwareCopyright: {
            props,
            template: require("./shareHolder.html")
        },
        ProductCopyright: {
            props,
            template: require("./shareHolder.html")
        },
        DomainReference: {
            props,
            template: require("./shareHolder.html")
        }
    }
};
