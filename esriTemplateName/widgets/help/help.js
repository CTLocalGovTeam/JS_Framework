﻿/*global dojo,define,document */
/*jslint sloppy:true */
/** @license
| Version 10.2
| Copyright 2013 Esri
|
| Licensed under the Apache License, Version 2.0 (the "License");
| you may not use this file except in compliance with the License.
| You may obtain a copy of the License at
|
|    http://www.apache.org/licenses/LICENSE-2.0
|
| Unless required by applicable law or agreed to in writing, software
| distributed under the License is distributed on an "AS IS" BASIS,
| WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
| See the License for the specific language governing permissions and
| limitations under the License.
*/
//============================================================================================================================//
define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/topic",
    "dojo/_base/lang",
    "dijit/_WidgetBase"
  ],
function (declare, domConstruct, on, topic, lang, _WidgetBase) {

    //========================================================================================================================//

    return declare([_WidgetBase], {
        /**
        * create help widget
        * 
        * @class
        * @name widgets/help/help
        */
        postCreate: function () {
            this.domNode = domConstruct.create("div", { "title": this.title, "class": "esriCTHelpImg" }, null);

            this.own(on(this.domNode, "click", lang.hitch(this, function () {

                /**
                * minimize other open header panel widgets and show help 
                */
                topic.publish("toggleWidget", "help");
                this._showHelpPage();
            })));
        },

        /**
        * show help page 
        * @memberOf widgets/help/help
        */
        _showHelpPage: function () {
            window.open();
        }
    });
});