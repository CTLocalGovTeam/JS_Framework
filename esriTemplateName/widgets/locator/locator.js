/*global define, document, Modernizr */
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
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom-geometry",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/string",
    "esri/tasks/locator",
    "dojo/window",
    "dojo/text!./templates/locatorTemplate.html",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/i18n!nls/localizedStrings",
    "dojo/topic"
    ],
     function (declare, domConstruct, domStyle, domAttr, lang, on, domGeom, dom, domClass, string, Locator, window, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, topic) {

         //========================================================================================================================//

         return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
             templateString: template,
             nls: nls,
             lastSearchString: null,
             stagedSearch: null,
             mapPoint: null,

             /**
             * display locator widget
             *
             * @class       
             * @name widgets/locator/locator
             */
             postCreate: function () {

                 /**
                 * close locator widget if any other widget is opened 
                 * @param {string} widget Key of the newly opened widget  
                 */
                 topic.subscribe("toggleWidget", lang.hitch(this, function (widget) {
                     if (widget != "locator") {
                         if (domGeom.getMarginBox(this.divAddressHolder).h > 0) {
                             domClass.replace(this.domNode, "esriCTTdHeaderSearch", "esriCTTdHeaderSearch-select");
                             domClass.replace(this.divAddressHolder, "esriCTHideContainerHeight", "esriCTShowContainerHeight");
                             domClass.replace(this.divAddressHolder, "esriCTZeroHeight", "esriCTAddressContentHeight");
                             this.txtAddress.blur();
                         }
                     }
                 }));

                 this.domNode = domConstruct.create("div", { "title": this.title, "class": "esriCTTdHeaderSearch" }, null);
                 domConstruct.place(this.divAddressContainer, dom.byId("esriCTParentDivContainer"));
                 this.own(on(this.domNode, "click", lang.hitch(this, function () {

                     /**
                     * minimize other open header panel widgets and show locator widget
                     */
                     topic.publish("toggleWidget", "locator");
                     this._showLocateContainer();
                 })));
                 domStyle.set(this.divAddressContainer, "display", "block");
                 this.closeButton.src = dojoConfig.baseURL + "/themes/images/searchClose.png";
                 this.imgSearchLoader.src = dojoConfig.baseURL + "/themes/images/blue-loader.gif";

                 this._setDefaultTextboxValue();
                 this._attachLocatorEvents();
             },

             /**
             * set default value of locator textbox as specified in configuration file
             * @param {array} dojo.configData.LocatorSettings.Locators Locator settings specified in configuration file 
             * @memberOf widgets/locator/locator
             */
             _setDefaultTextboxValue: function () {
                 var locatorSettings = dojo.configData.LocatorSettings.Locators;
                 /**
                 * txtAddress Textbox for search text
                 * @member {textbox} txtAddress 
                 * @private
                 * @memberOf widgets/locator/locator
                 */
                 domAttr.set(this.txtAddress, "defaultAddress", locatorSettings[0].LocatorDefaultAddress);
                 domAttr.set(this.txtAddress, "defaultFeature", locatorSettings[1].LocatorDefaultLocation);
                 domAttr.set(this.txtAddress, "defaultActivity", locatorSettings[2].LocatorDefaultActivity);
             },

             /**
             * attach locator events
             * @memberOf widgets/locator/locator
             */
             _attachLocatorEvents: function () {
                 /**
                 * tdSearchAddress Tab for address search 
                 * @member {span} tdSearchAddress 
                 * @private
                 * @memberOf widgets/locator/locator
                 */
                 this.own(on(this.tdSearchAddress, "click", lang.hitch(this, function () {
                     this._showAddressSearchView();
                 })));

                 /**
                 * tdSearchFeature Tab for feature search 
                 * @member {span} tdSearchFeature 
                 * @private
                 * @memberOf widgets/locator/locator
                 */
                 this.own(on(this.tdSearchFeature, "click", lang.hitch(this, function () {
                     this._showFeatureSearchView();
                 })));

                 /**
                 * tdSearchActivity Tab for Activity search 
                 * @member {span} tdSearchActivity 
                 * @private
                 * @memberOf widgets/locator/locator
                 */
                 this.own(on(this.tdSearchActivity, "click", lang.hitch(this, function () {
                     this._showActivitySearchView();
                 })));
                 this.own(on(this.txtAddress, "keyup", lang.hitch(this, function (evt) {
                     this._submitAddress(evt);
                 })));
                 this.own(on(this.txtAddress, "dblclick", lang.hitch(this, function (evt) {
                     this._clearDefaultText(evt);
                 })));
                 this.own(on(this.txtAddress, "blur", lang.hitch(this, function (evt) {
                     this._replaceDefaultText(evt);
                 })));
                 this.own(on(this.txtAddress, "focus", lang.hitch(this, function () {
                     domClass.add(this.txtAddress, "esriCTColorChange");
                 })));
             },

             /**
             * show/hide locator widget and set default search text in address, feature and activity tabs
             * @memberOf widgets/locator/locator
             */
             _showLocateContainer: function () {
                 domAttr.set(this.tdSearchAddress, "innerHTML", nls.addressDisplayText);
                 domAttr.set(this.tdSearchFeature, "innerHTML", nls.featureDisplayText);
                 domAttr.set(this.tdSearchActivity, "innerHTML", nls.activityDisplayText);
                 this.txtAddress.blur();

                 if (domGeom.getMarginBox(this.divAddressHolder).h > 0) {
                     /**
                     * when user clicks on locator icon in header panel, close the search panel if it is open 
                     */
                     domClass.replace(this.domNode, "esriCTTdHeaderSearch", "esriCTTdHeaderSearch-select");
                     domClass.replace(this.divAddressHolder, "esriCTHideContainerHeight", "esriCTShowContainerHeight");
                     domClass.replace(this.divAddressHolder, "esriCTZeroHeight", "esriCTAddressContentHeight");
                     this.txtAddress.blur();
                 } else {
                     /**
                     * when user clicks on locator icon in header panel, open the search panel if it is closed 
                     */
                     domClass.replace(this.domNode, "esriCTTdHeaderSearch-select", "esriCTTdHeaderSearch");
                     domClass.replace(this.txtAddress, "esriCTBlurColorChange", "esriCTColorChange");
                     domClass.replace(this.divAddressHolder, "esriCTShowContainerHeight", "esriCTHideContainerHeight");
                     domClass.add(this.divAddressHolder, "esriCTAddressContentHeight");

                     domStyle.set(this.txtAddress, "verticalAlign", "middle");
                     this.txtAddress.value = domAttr.get(this.txtAddress, "defaultAddress");
                     if (domClass.contains(this.tdSearchFeature, "esriCTSearchByFeature")) {
                         this.txtAddress.value = domAttr.get(this.txtAddress, "defaultFeature");
                     }
                     else if (domClass.contains(this.tdSearchActivity, "esriCTSearchByActivity")) {
                         this.txtAddress.value = domAttr.get(this.txtAddress, "defaultActivity");
                     }
                     this.lastSearchString = lang.trim(this.txtAddress.value)
                 }

                 this._setHeightAddressResults();
             },

             /**
             * search address on every key press
             * @param {object} evt Keyup event
             * @memberOf widgets/locator/locator 
             */
             _submitAddress: function (evt) {
                 if (evt) {
                     if (evt.keyCode == dojo.keys.ENTER) {
                         if (this.txtAddress.value != '') {
                             if (domClass.contains(this.tdSearchAddress, "esriCTSearchByAddress")) {
                                 domStyle.set(this.imgSearchLoader, "display", "block");
                                 this._locateAddress(evt);
                                 return;
                             } else if (domClass.contains(this.tdSearchFeature, "esriCTSearchByFeature") || domClass.contains(this.tdSearchActivity, "esriCTSearchByActivity")) {
                                 return;
                             }
                         }
                     }

                     /**
                     * do not perform auto complete search if alphabets,
                     * numbers,numpad keys,comma,ctl+v,ctrl +x,delete or 
                     * backspace is pressed
                     */
                     if ((!((evt.keyCode >= 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode == 8 || evt.keyCode == 110 || evt.keyCode == 188)) || (evt.keyCode == 86 && evt.ctrlKey) || (evt.keyCode == 88 && evt.ctrlKey)) {
                         evt = (evt) ? evt : event;
                         evt.cancelBubble = true;
                         evt.stopPropagation && evt.stopPropagation();
                         return;
                     }

                     /**
                     * call locator service if search text is not empty  
                     */
                     if (domGeom.getMarginBox(this.divAddressContent).h > 0) {
                         if (lang.trim(this.txtAddress.value) != '') {
                             if (this.lastSearchString != lang.trim(this.txtAddress.value)) {
                                 this.lastSearchString = lang.trim(this.txtAddress.value);
                                 domConstruct.empty(this.divAddressResults);
                                 var _this = this;

                                 /**
                                 * clear any staged search
                                 */
                                 clearTimeout(this.stagedSearch);
                                 if (lang.trim(this.txtAddress.value).length > 0) {

                                     /**
                                     * stage a new search, which will launch if no new searches show up
                                     * before the timeout
                                     */
                                     this.stagedSearch = setTimeout(function () {
                                         _this._locateAddress();
                                     }, 500);
                                 }
                             }
                         } else {
                             this.lastSearchString = lang.trim(this.txtAddress.value);
                             domStyle.set(this.imgSearchLoader, "display", "none");
                             domConstruct.empty(this.divAddressResults);
                         }
                     }
                 }
             },

             /**
             * perform search by addess if search type is address search
             * @memberOf widgets/locator/locator 
             */
             _locateAddress: function () {
                 if (domClass.contains(this.tdSearchAddress, "esriCTSearchByAddress")) {
                     domConstruct.empty(this.divAddressResults);
                     if (lang.trim(this.txtAddress.value) == '') {
                         domStyle.set(this.imgSearchLoader, "display", "none");
                         domConstruct.empty(this.divAddressResults);
                         return;
                     } else {
                         this._searchLocation();
                     }
                 }
             },

             /**
             * call locator service and get search results
             * @memberOf widgets/locator/locator 
             */
             _searchLocation: function () {
                 domStyle.set(this.imgSearchLoader, "display", "block");
                 domAttr.set(this.txtAddress, "defaultAddress", this.txtAddress.value);
                 this._setHeightAddressResults();

                 /**
                 * call locator service specified in configuration file 
                 */
                 var locatorSettings = dojo.configData.LocatorSettings.Locators;
                 var locator = new Locator(locatorSettings[0].LocatorURL);
                 var searchFieldName = locatorSettings[0].LocatorParameters.SearchField;
                 var addressField = {};
                 addressField[searchFieldName] = lang.trim(this.txtAddress.value);
                 var baseMapExtent = this.map.getLayer(this.map.basemapLayerIds[0]).fullExtent;

                 var options = {};
                 options["address"] = addressField;
                 options["outFields"] = locatorSettings[0].LocatorOutFields;
                 options[locatorSettings[0].LocatorParameters.SearchBoundaryField] = baseMapExtent;
                 locator.outSpatialReference = this.map.spatialReference;

                 /**
                 * get results from locator service
                 * @param {object} options Contains address, outFields and basemap extent for locator service
                 * @param {object} candidates Contains results from locator service        
                 */
                 locator.addressToLocations(options);
                 locator.on("address-to-locations-complete", lang.hitch(this, function (candidates) {
                     this._showLocatedAddress(candidates.addresses);
                 }), function () {
                     domStyle.set(this.imgSearchLoader, "display", "none");
                     this._locatorErrBack();
                 });
             },

             /**
             * filter valid results from results returned by locator service 
             * @param {object} candidates Contains results from locator service  
             * @memberOf widgets/locator/locator 
             */
             _showLocatedAddress: function (candidates) {
                 domConstruct.empty(this.divAddressResults);
                 if (lang.trim(this.txtAddress.value) === "") {
                     this.txtAddress.focus();
                     domConstruct.empty(this.divAddressResults);
                     domStyle.set(this.imgSearchLoader, "display", "none");
                     return;
                 }

                 /**
                 * display all the located address in the address container
                 * 'this.divAddressResults' div dom element contains located addresses, created in widget template  
                 */
                 if (candidates.length > 0) {
                     var hasValidRecords = false;
                     var validResult = true;
                     var locatorSettings = dojo.configData.LocatorSettings.Locators;
                     var searchFields = [];
                     var addressFieldName = locatorSettings[0].AddressSearch.FilterFieldName;
                     var addressFieldValues = locatorSettings[0].AddressSearch.FilterFieldValues;
                     var placeFieldName = locatorSettings[0].PlaceNameSearch.FilterFieldName;
                     var placeFieldValues = locatorSettings[0].PlaceNameSearch.FilterFieldValues;
                     for (var s in addressFieldValues) {
                         searchFields.push(addressFieldValues[s]);
                     }
                     if (locatorSettings[0].PlaceNameSearch.enabled) {
                         searchFields.push(locatorSettings[0].PlaceNameSearch.LocatorFieldValue);
                     }

                     for (var i in candidates) {
                         /**
                         * for every result returned by locator service verify if match score is greater than minimum match score specified in configuration file
                         */
                         if (candidates[i].attributes[locatorSettings[0].AddressMatchScore.Field] > locatorSettings[0].AddressMatchScore.Value) {
                             for (j in searchFields) {
                                 /**
                                 * verify if FilterFieldName of results match with FilterFieldValues of locator settings specified in configuration file
                                 */
                                 if (candidates[i].attributes[addressFieldName].toUpperCase() == searchFields[j].toUpperCase()) {
                                     if (candidates[i].attributes[addressFieldName].toUpperCase() == locatorSettings[0].PlaceNameSearch.LocatorFieldValue.toUpperCase()) {
                                         for (var placeField in placeFieldValues) {
                                             if (candidates[i].attributes[placeFieldName].toUpperCase() != placeFieldValues[placeField].toUpperCase()) {
                                                 validResult = false;
                                             } else {
                                                 validResult = true;
                                                 break;
                                             }
                                         }
                                     } else {
                                         validResult = true;
                                     }
                                     /**
                                     * display the result if it is valid  
                                     */
                                     if (validResult) {
                                         hasValidRecords = this._displayValidLocations(candidates[i]);
                                     }
                                 }
                             }
                         }
                     }
                     if (!hasValidRecords) {
                         this._locatorErrBack();
                     }
                     domStyle.set(this.imgSearchLoader, "display", "none");
                     this._setHeightAddressResults();
                 } else {
                     this.mapPoint = null;
                     this._locatorErrBack();
                 }
             },

             /**
             * display valid result in search panel
             * @param {object} candidate Contains valid result to be displayed in search panel
             * @return {Boolean} true if result is displayed successfully
             * @memberOf widgets/locator/locator 
             */
             _displayValidLocations: function (candidate) {
                 var locatorSettings = dojo.configData.LocatorSettings.Locators;
                 var tdData = domConstruct.create("div", { "class": "esriCTBottomBorder esriCTCursorPointer" }, this.divAddressResults);
                 try {
                     /**
                     * bind x, y co-ordinates and address of search result with respective row in search panel 
                     */
                     tdData.innerHTML = string.substitute(locatorSettings[0].DisplayField, candidate.attributes);

                     domAttr.set(tdData, "x", candidate.location.x);
                     domAttr.set(tdData, "y", candidate.location.y);
                     domAttr.set(tdData, "address", string.substitute(locatorSettings[0].DisplayField, candidate.attributes));
                 } catch (err) {
                     alert(nls.errorMessages.falseConfigParams);
                 }
                 var _this = this;
                 tdData.onclick = function () {
                     /**
                     * display result on map on click of search result
                     */
                     _this.mapPoint = new esri.geometry.Point(domAttr.get(this, "x"), domAttr.get(this, "y"), _this.map.spatialReference);
                     _this.txtAddress.value = this.innerHTML;
                     domAttr.set(_this.txtAddress, "defaultAddress", this.innerHTML);
                     _this._locateAddressOnMap(_this.mapPoint);
                 };
                 hasValidRecord = true;
                 return hasValidRecord;
             },

             /**
             * add push pin on the map  
             * @param {object} mapPoint Map point of search result 
             * @memberOf widgets/locator/locator
             */
             _locateAddressOnMap: function (mapPoint) {
                 var geoLocationPushpin, locatorMarkupSymbol, graphic;
                 this.map.setLevel(dojo.configData.ZoomLevel);
                 this.map.centerAt(mapPoint);
                 geoLocationPushpin = dojoConfig.baseURL + dojo.configData.LocatorSettings.DefaultLocatorSymbol;
                 locatorMarkupSymbol = new esri.symbol.PictureMarkerSymbol(geoLocationPushpin, "35", "35");
                 graphic = new esri.Graphic(mapPoint, locatorMarkupSymbol, {}, null);
                 this.map.getLayer("esriGraphicsLayerMapSettings").clear();
                 this.map.getLayer("esriGraphicsLayerMapSettings").add(graphic);
                 this._hideAddressContainer();
             },

             /**
             * hide search panel
             * @memberOf widgets/locator/locator 
             */
             _hideAddressContainer: function () {
                 domClass.replace(this.domNode, "esriCTTdHeaderSearch", "esriCTTdHeaderSearch-select");
                 this.txtAddress.blur();
                 domClass.replace(this.divAddressHolder, "esriCTHideContainerHeight", "esriCTShowContainerHeight");
                 domClass.replace(this.divAddressHolder, "esriCTZeroHeight", "esriCTAddressContentHeight");
             },

             /**
             * set height of the search panel
             * @memberOf widgets/locator/locator 
             */
             _setHeightAddressResults: function () {
                 /**
                 * divAddressContent Container for search results
                 * @member {div} divAddressContent 
                 * @private
                 * @memberOf widgets/locator/locator
                 */
                 var height = domGeom.getMarginBox(this.divAddressContent).h;
                 if (height > 0) {
                     /**
                     * divAddressScrollContent Scrollbar container for search results
                     * @member {div} divAddressScrollContent 
                     * @private
                     * @memberOf widgets/locator/locator
                     */
                     this.divAddressScrollContent.style.height = (height - 120) + "px";
                 }
             },

             /**
             * display search by address tab
             * @memberOf widgets/locator/locator 
             */
             _showAddressSearchView: function () {
                 if (this.imgSearchLoader.style.display == "block") {
                     return;
                 }
                 this.txtAddress.value = domAttr.get(this.txtAddress, "defaultAddress");
                 this.lastSearchString = lang.trim(this.txtAddress.value);
                 domConstruct.empty(this.divAddressResults);
                 this.tdSearchAddress.className = "esriCTSearchByAddress";
                 this.tdSearchFeature.className = "esriCTSearchByUnSelectedFeature";
                 this.tdSearchActivity.className = "esriCTSearchByUnSelectedActivity";
             },

             /**
             * display search by feature tab
             * @memberOf widgets/locator/locator 
             */
             _showFeatureSearchView: function () {
                 this.txtAddress.value = domAttr.get(this.txtAddress, "defaultFeature");
                 if (this.imgSearchLoader.style.display == "block") {
                     return;
                 }
                 this.lastSearchString = lang.trim(this.txtAddress.value);
                 domConstruct.empty(this.divAddressResults);
                 this.tdSearchAddress.className = "esriCTSearchByUnSelectedAddress";
                 this.tdSearchFeature.className = "esriCTSearchByFeature";
                 this.tdSearchActivity.className = "esriCTSearchByUnSelectedActivity";
             },

             /**
             * display the search by activity tab
             * @memberOf widgets/locator/locator 
             */
             _showActivitySearchView: function () {
                 if (this.imgSearchLoader.style.display == "block") {
                     return;
                 }
                 this.txtAddress.value = domAttr.get(this.txtAddress, "defaultActivity");
                 this.lastSearchString = lang.trim(this.txtAddress.value);
                 domConstruct.empty(this.divAddressResults);
                 this.tdSearchAddress.className = "esriCTSearchByUnSelectedAddress";
                 this.tdSearchFeature.className = "esriCTSearchByUnSelectedFeature";
                 this.tdSearchActivity.className = "esriCTSearchByActivity";
             },

             /**
             * display error message if locator service fails or does not return any results
             * @memberOf widgets/locator/locator 
             */
             _locatorErrBack: function () {
                 domConstruct.empty(this.divAddressResults);
                 domStyle.set(this.imgSearchLoader, "display", "none");
                 var tBody = domConstruct.create("tbody", {}, this.divAddressResults);
                 var tr = domConstruct.create("tr", {}, tBody);
                 var td = domConstruct.create("td", { "align": "left", "class": "esriCTBottomBorder", "style": "cursor:default" }, tr);
                 td.innerHTML = nls.errorMessages.invalidSearch;
             },

             /**
             * clear default value from search textbox
             * @param {object} evt Dblclick event
             * @memberOf widgets/locator/locator 
             */
             _clearDefaultText: function (evt) {
                 var target = window.event ? window.event.srcElement : evt ? evt.target : null;
                 if (!target) return;
                 target.style.color = "#FFF";
                 target.value = '';
             },

             /**
             * set default value to search textbox
             * @param {object} evt Blur event
             * @memberOf widgets/locator/locator 
             */
             _replaceDefaultText: function (evt) {
                 var target = window.event ? window.event.srcElement : evt ? evt.target : null;
                 if (!target) return;

                 if (this.tdSearchFeature.className == "esriCTSearchByFeature") {
                     this._resetTargetValue(target, "defaultFeature", "gray");
                 } else if (this.tdSearchActivity.className == "esriCTSearchByActivity") {
                     this._resetTargetValue(target, "defaultActivity", "gray");
                 } else {
                     this._resetTargetValue(target, "defaultAddress", "gray");
                 }
             },

             /**
             * set default value to search textbox
             * @param {object} target Textbox dom element
             * @param {string} title Default value
             * @param {string} color Background color of search textbox
             * @memberOf widgets/locator/locator
             */
             _resetTargetValue: function (target, title, color) {
                 if (target.value == '' && domAttr.get(target, title)) {
                     target.value = target.title;
                     if (target.title == "") {
                         target.value = domAttr.get(target, title);
                     }
                 }
                 if (domClass.contains(target, "esriCTColorChange")) {
                     domClass.remove(target, "esriCTColorChange");
                 }
                 domClass.add(target, "esriCTBlurColorChange");
                 this.lastSearchString = lang.trim(this.txtAddress.value);
             }
         });
     });