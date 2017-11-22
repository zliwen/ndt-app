export const creditData = [{
    name: "企业洞察",
    pageName: "qySight",
    options: {
        url: "http://182.140.213.68:9080/zhixin/qySight/searchQySight.st",
        type: "GET",
        params: {}
    },
    icon: "se_btn_qd@3x.png",
    navList: [{
        value: "状态全析",
        comName: "StatusComp",
        loading: true
    }, {
        value: "法人关联",
        comName: "LawPersonComp",
        loading: true
    }]
}, {
    name: "基本资料",
    pageName: "baseInfo",
    icon: "se_btn_jz@3x.png",
    navList: [{
        url: "http://182.140.213.68:9080/zhixin/baseInfo/queryCompanyInfoByName.st",
        value: "工商资料",
        comName: "CompanyInfo",
        loading: true
    }, {
        url: "http://182.140.213.68:9080/zhixin/baseInfo/queryShareHolderByName.st",
        value: "股东情况",
        comName: "ShareHolder",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/baseInfo/queryOverseaInstByName.st",
        value: "海外投资机构",
        loading: true,
        comName: "OverseaInst",
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/baseInfo/queryBoardDirectorByName.st",
        value: "主要人员",
        loading: true,
        comName: "BoardDirector",
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/baseInfo/queryBranchsByName.st",
        value: "分支机构",
        loading: true,
        comName: "Branchs",
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryCompanyInforChangeByName.st",
        value: "工商变更",
        loading: true,
        comName: "CompanyInforChange",
        params: {
            page: 1,
            pageSize: 100
        }
    }]
}, {
    name: "信用行为",
    pageName: "law",
    url: "",
    icon: "se_btn_xx@3x.png",
    navList: [{
        url: "http://182.140.213.68:9080/zhixin/law/queryOpenCourtNotificationByName.st",
        value: "开庭公告",
        comName: "OpenCourtNotification",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryCourtNotificationByName.st",
        value: "法院公告",
        comName: "CourtNotification",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryJudgeDocByName.st",
        value: "判断文书",
        comName: "JudgeDoc",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryExecutedPersonByName.st",
        value: "被执行人",
        comName: "ExecutedPerson",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryCrackCreditExecutedPersonByName.st",
        value: "被执行人",
        comName: "CrackCreditExecutedPerson",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryAuctionByName.st",
        value: "司法拍卖",
        comName: "Auction",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryStockFreezeByName.st",
        value: "股权冻结",
        comName: "StockFreeze",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/law/queryAdminExecuteByName.st",
        value: "行政处罚",
        comName: "AdminExecute",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/operation/queryOperationExceptionByName.st",
        value: "异常经营",
        comName: "OperationException",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/commercial/queryLiquidationByName.st",
        value: "清算信息",
        comName: "Liquidation",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }]
}, {
    name: "经营信息",
    pageName: "commercial",
    url: "",
    icon: "se_btn_jx@3x.png",
    navList: [{
        url: "http://182.140.213.68:9080/zhixin/funds/searchSocialFunds.st",
        value: "社保",
        comName: "SocialFunds",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/funds/searchPubFunds.st",
        value: "公积金",
        comName: "PubFunds",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/commercial/queryChattelMortByName.st",
        value: "动产抵押",
        comName: "ChattelMort",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/commercial/queryEquityPledgedByName.st",
        value: "股权出质",
        comName: "EquityPledged",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/operation/queryBidInvitingByName.st",
        value: "招标信息",
        comName: "BidInviting",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/operation/queryBiddingByName.st",
        value: "中标信息",
        comName: "Bidding",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/operation/queryRecruitByName.st",
        value: "招聘信息",
        comName: "Recruit",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/commercial/queryAnnualDocByName.st",
        value: "企业年报",
        comName: "AnnualDoc",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }]
}, {
    name: "知识产权",
    pageName: "propertyRight",
    url: "",
    icon: "se_btn_zc@3x.png",
    navList: [{
        url: "http://182.140.213.68:9080/zhixin/propertyRight/queryBrandInforByName.st",
        value: "商标信息",
        comName: "BrandInfor",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/propertyRight/queryPatentDetailByName.st",
        value: "专利信息",
        comName: "PatentDetail",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/propertyRight/querySoftwareCopyrightByName.st",
        value: "软件著作权",
        comName: "SoftwareCopyright",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/propertyRight/queryProductCopyrightByName.st",
        value: "作品著作权",
        comName: "ProductCopyright",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/propertyRight/queryDomainReferenceByName.st",
        value: "域名备案",
        comName: "DomainReference",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }]
}, {
    name: "关联图谱",
    pageName: "map",
    url: "",
    icon: "se_btn_gt@3x.png"
}, {
    name: "国税信息",
    pageName: "taxInfo",
    url: "",
    icon: "se_btn_gx@3x.png",
    navList: [{
        url: "http://182.140.213.68:9080/zhixin/propertyRight/queryDomainReferenceByName.st",
        value: "域名备案",
        comName: "DomainReference",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/propertyRight/queryDomainReferenceByName.st",
        value: "域名备案",
        comName: "DomainReference",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }, {
        url: "http://182.140.213.68:9080/zhixin/propertyRight/queryDomainReferenceByName.st",
        value: "域名备案",
        comName: "DomainReference",
        loading: true,
        params: {
            page: 1,
            pageSize: 100
        }
    }]
}];