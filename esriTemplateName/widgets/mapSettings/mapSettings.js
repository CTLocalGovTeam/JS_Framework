﻿/*global dojo, define, document */
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
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dijit/_WidgetBase",
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Extent",
    "esri/dijit/BasemapToggle",
    "esri/dijit/HomeButton",
    "esri/SpatialReference",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "dojo/domReady!"
    ],
     function (declare, domConstruct, domStyle, lang, on, dom, query, domClass, domGeom, _WidgetBase, esriMap, FeatureLayer, GraphicsLayer, geometryExtent, BasemapToggle, HomeButton, spatialReference, arcGISDynamicMapServiceLayer) {

         //========================================================================================================================//

         return declare([_WidgetBase], {
             map: null,
             tempGraphicsLayerId: "esriGraphicsLayerMapSettings",

             /**
             * initialize map object 
             *
             * @class
             * @name widgets/mapSettings/mapSettings
             */
             postCreate: function () {
                 /**
                 * set map extent to default extent specified in configuration file
                 * @param {string} dojo.configData.DefaultExtent Default extent of map specified in configuration file 
                 */
                 var extentPoints = dojo.configData && dojo.configData.DefaultExtent && dojo.configData.DefaultExtent.split(","),
                 mapDefaultExtent = new geometryExtent({ "xmin": parseFloat(extentPoints[0]), "ymin": parseFloat(extentPoints[1]), "xmax": parseFloat(extentPoints[2]), "ymax": parseFloat(extentPoints[3]), "spatialReference": { "wkid": parseFloat(extentPoints[4])} }),
                 graphicsLayer = new GraphicsLayer();
                 graphicsLayer.id = this.tempGraphicsLayerId;

                 /**
                 * load map
                 * @param {string} dojo.configData.BaseMapLayers Basemap settings specified in configuration file 
                 */
                 this.map = new esriMap("esriCTParentDivContainer", {
                     basemap: dojo.configData.BaseMapLayers[0].Key,
                     extent: mapDefaultExtent,
                     autoResize: true
                 });
                 this.map.addLayer(graphicsLayer);

                 /**
                 * load esri 'Home Button' widget 
                 */
                 var home = this._addHomeButton();

                 /**
                 * load esri 'Basemap Toggle' widget
                 */
                 this._loadBasemapToggle();

                 /**
                 * set position of home button widget after map is successfuly loaded
                 * @param {array} dojo.configData.OperationalLayers List of operational Layers specified in configuration file  
                 */
                 this.map.on("load", lang.hitch(this, function () {
                     domConstruct.place(home.domNode, query(".esriSimpleSliderIncrementButton")[0], "after");
                     home.startup();

                     for (var i in dojo.configData.OperationalLayers) {
                         this._addOperationalLayerToMap(i, dojo.configData.OperationalLayers[i]);
                     }
                 }));
             },

             /**
             * load esri 'Home Button' widget which sets map extent to default extent
             * @return {object} Home button widget
             * @memberOf widgets/mapSettings/mapSettings
             */
             _addHomeButton: function () {
                 var home = new HomeButton({
                     map: this.map
                 }, domConstruct.create("div", {}, null));
                 return home;
             },

             /**
             * load esri 'Basemap Toggle' widget which allow toggle between configured base map
             * @memberOf widgets/mapSettings/mapSettings
             */
             _loadBasemapToggle: function () {
                 var toggle = new BasemapToggle({
                     map: this.map,
                     basemap: dojo.configData.BaseMapLayers[1].Key
                 }, domConstruct.create("div", {}, "esriCTParentDivContainer"));
                 toggle.startup();
             },

             /**
             * load and add operational layers depending on their LoadAsServiceType specified in configuration file
             * @param {int} index Layer order specified in configuration file  
             * @param {object} layerInfo Layer settings specified in configuration file  
             * @memberOf widgets/mapSettings/mapSettings
             */
             _addOperationalLayerToMap: function (index, layerInfo) {
                 if (layerInfo.LoadAsServiceType.toLowerCase() == "feature") {
                     /**
                     * set layerMode of the operational layer if it's type is feature 
                     */
                     var layerMode = null;
                     switch (layerInfo.layermode && layerInfo.layermode.toLowerCase()) {
                         case "ondemand":
                             layerMode = FeatureLayer.MODE_ONDEMAND;
                             break;
                         case "selection":
                             layerMode = FeatureLayer.MODE_SELECTION;
                             break;
                         default:
                             layerMode = FeatureLayer.MODE_SNAPSHOT;
                             break;
                     }
                     /**
                     * load operational layer if it's type is feature along with its layer mode
                     */
                     var featureLayer = new FeatureLayer(layerInfo.ServiceURL, {
                         id: index,
                         mode: layerMode,
                         outFields: ["*"],
                         displayOnPan: false
                     });

                     this.map.addLayer(featureLayer);

                 } else if (layerInfo.LoadAsServiceType.toLowerCase() == "dynamic") {
                     /*
                     * load operational layer if it's type is dynamic
                     */
                     var dynamicMapSerivceLayer = new arcGISDynamicMapServiceLayer(layerInfo.ServiceURL, {
                         id: index
                     });

                     this.map.addLayer(dynamicMapSerivceLayer);
                 }
             },

             /**
             * return current map instance
             * @return {object} Current map instance
             * @memberOf widgets/mapSettings/mapSettings
             */
             getMapInstance: function () {
                 return this.map;
             }
         });
     });