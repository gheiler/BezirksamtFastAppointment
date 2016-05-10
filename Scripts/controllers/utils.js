

var utils = {
    baseServiceUrl: "https://service.berlin.de/",
    baseServiceUrlWithProxy: "https://jsonp.afeld.me/?url=https://service.berlin.de/",
    phantomCloudedUrl: function(url){
        return "https://phantomjscloud.com/api/browser/v2/ak-b8f5z-seztj-5x052-xcjg8-cxpq6/?request={url:%22" + encodeURIComponent(url).replace(/'/g,"%27").replace(/"/g,"%22") + 
               "%22,renderType:%22html%22,requestSettings:{clearCache:true,loadImages:false}}";
    },
    showError: function(message, type) {
        alert(message);
    },
    toggleSpin: function(btn) {
        $("i", btn).toggleClass("btn-spinner");
    }
};


