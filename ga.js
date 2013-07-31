/**
 *  @license
 *  ga-ext version 1.0
 *  (https://github.com/melalj/universal-ga-extension)
 *  Javascript script that allows adding Universal Google analytics snippet to a chrome extension
 *
 *  Copyright (c) 2013 Mohammed Elalj [mohammed@elalj.com] 
 *  This script is freely distributable under the terms of an MIT-style license.
 */

(function(global) {
    "use strict";

    /**
     * Initilization function
     * @param object trackingData Have all tracking attributes
    */
    function ga(trackingData) {
        this.trackingId = trackingData.trackingId;
        this.trackingDns = trackingData.trackingDns;
        this.appVersion = trackingData.appVersion;
        this.appName = trackingData.appName;
        if (typeof(trackingData.getPref) == "function")
            this.getPref = trackingData.getPref;
        if(typeof(trackingData.setPref) == "function")
            this.setPref = trackingData.setPref;
        this.clientId = trackingData.clientId || this._getClientId();
    }
   
    var s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    var guid = function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    
    ga.prototype = {
        getPref: function(pref) {
            return window.localStorage.getItem("ga-measurement-library-" + pref);
        },

        setPref: function(pref, value) {
            return window.localStorage.setItem("ga-measurement-library-" + pref, value);
        },
    
        /**
         * Send an event to G.A
         * @param string category Event Category
         * @param string action Event Action
         * @param string label Event Label (optional)
         * @param integer value Event Value (optional)
        */
        event: function (category, action, label, value) {
            payload = "&t=event";
            if (category) payload += "&ec="+escape(category);
            if (action) payload += "&ea="+escape(action);
            if (label) payload += "&el="+escape(label);
            if (value) payload += "&ev="+parseInt(value);
            this._collect(payload);
        },

        /**
         * Visit a page event to G.A
         * @param string path Page path
         * @param string title Page title
        */
        pageview: function (path, title){
            payload = "&t=pageview";
            if (path) payload += "&dp="+escape(path);
            if (title) payload += "&dt="+escape(title);
            this._collect(payload);
        },

        /**
         * Track exception with G.A
         * @param string description Exception Description
         * @param binary fatal Is it fatal ?
        */
        exception: function (description, fatal) {
            payload = "&t=exception";
            if (description) payload += "&exd="+escape(description);
            if (fatal) payload += "&exf="+fatal;
            this._collect(payload);
        },

        /**
         * Track hit with G.A
         * @param string type Hit Type
         * @param binary noninteractive Non-Interaction Hit?
        */
        hit: function(type, noninteractive) {
            payload = "&t=" + type;
            if (noninteractive) payload += "&ni=" + noninteractive;
            this._collect(payload);
        },

        /**
         * Track social interactions with G.A
         * @param string action Social event Action
         * @param string network Social network
         * @param string target Path targeted by social event
        */
        social: function (action, network, target) {
            payload = "&t=social";
            if (action) payload += "&sa="+escape(action);
            if (network) payload += "&sn="+escape(network);
            if (target) payload += "&st="+escape(target);
            this._collect(payload);
        },


        /**
         * Get/Generate & Save Client Id
        */

        _getClientId: function() {
            var cid;
            if (this.getPref("gaCid")){
                cid = this.getPref("gaCid");
            } else {
                cid = guid();
                this.setPref("gaCid", cid);
            }
            return cid;
        },

        /**
         * Add System Info
        */
        _getSystemInfo: function () {
            payload  = "";
            payload += "&sr="+window.screen.availWidth+"x"+window.screen.availHeight;
            payload += "&sd="+window.screen.colorDepth+"-bits";
            payload += "&ul="+navigator.language;
            return payload;
        },

        /**
         * Add Application Info
        */
        _getAppInfo: function () {
            payload  = "";
            if (this.appName)
                payload += "&an="+this.appName;
            if (this.appVersion)
                payload += "&av="+this.appVersion;
            return payload;
        },

        /**
         * Build GA collect link and sent it to Google
         * @param string payload Custom parameters
        */
        _collect: function (data) {
            var url = "https://ssl.google-analytics.com/collect";
            var payload = "v=1";
            if (this.trackingDns) payload += "&dh=" + this.trackingDns;
            payload += "&tid=" + this.trackingId;
            payload += "&cid=" + this.clientId;

            payload += this._getSystemInfo();
            //payload += this._getAppInfo();

            payload += data;
            payload += "&z=" + Math.floor((1 + Math.random()) * Math.pow(10, 10))

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url + "?" + payload, true);
            xhr.send(null);
        },
    }
    
    global.GA = ga;
})(this);