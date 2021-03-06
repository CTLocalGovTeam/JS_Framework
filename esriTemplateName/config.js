﻿/*global dojo */
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
define([], function () {
    return {

        // This file contains various configuration settings for esri template
        //
        // Use this file to perform the following:
        //
        // 1.  Specify application Name                      - [ Tag(s) to look for: ApplicationName ]
        // 2.  Set path for application icon                 - [ Tag(s) to look for: ApplicationIcon ]
        // 3.  Set path for application favicon              - [ Tag(s) to look for: ApplicationFavicon ]
        // 4.  Set URL for help page                         - [ Tag(s) to look for: HelpURL ]
        // 5.  Specify header widget settings                - [ Tag(s) to look for: AppHeaderWidgets ]
        // 6.  Specify URLs for base maps                    - [ Tag(s) to look for: BaseMapLayers ]
        // 7.  Set initial map extent                        - [ Tag(s) to look for: DefaultExtent ] 
        // 8.  Specify URLs for operational layers           - [ Tag(s) to look for: OperationalLayers]
        // 9.  Customize zoom level for address search       - [ Tag(s) to look for: ZoomLevel ]   
        // 10.  Customize address search settings            - [ Tag(s) to look for: LocatorSettings]
        // 11.  Set URL for geometry service                 - [ Tag(s) to look for: GeometryService ]
        // 12. Specify URLs for map sharing                  - [ Tag(s) to look for: MapSharingOptions,TinyURLServiceURL, TinyURLResponseAttribute, FacebookShareURL, TwitterShareURL, ShareByMailLink ]

        // ------------------------------------------------------------------------------------------------------------------------
        // GENERAL SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set application title
        ApplicationName: "Esri Template",

        // Set application icon path
        ApplicationIcon: "/themes/images/logo.png",

        // Set application Favicon path
        ApplicationFavicon: "/themes/images/favicon.png",
      
        // Set URL of help page/portal
        HelpURL: "help.htm",

        //------------------------------------------------------------------------------------------------------------------------
        // Header Widget Settings
        //------------------------------------------------------------------------------------------------------------------------
        // Set widgets settings such as widget title, widgetPath, mapInstanceRequired to be displayed in header panel
        // Title: Name of the widget, will displayed as title of widget in header panel
        // WidgetPath: path of the widget respective to the widgets package.
        // MapInstanceRequired: true if widget is dependent on the map instance.

        AppHeaderWidgets: [
           {
               Title: "locator",
               WidgetPath: "widgets/locator/locator",
               MapInstanceRequired: true
           }, {
               Title: "geolocation",
               WidgetPath: "widgets/geoLocation/geoLocation",
               MapInstanceRequired: true
           }, {
               Title: "share",
               WidgetPath: "widgets/share/share",
               MapInstanceRequired: true
           }, {
               Title: "help",
               WidgetPath: "widgets/help/help",
               MapInstanceRequired: false
           }
        ],

        // ------------------------------------------------------------------------------------------------------------------------
        // BASEMAP SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set baseMap layers
        // Supported key values are 'streets', 'satellite', 'hybrid', 'topo', 'gray', 'oceans', 'national-geographic' and 'osm'.

        BaseMapLayers: [{
            Key: "topo"
        }, {
            Key: "streets"
        }],

        // Initial map extent. Use comma (,) to separate values and dont delete the last comma
        DefaultExtent: "-10181248, 2823548, -8510640, 3646622, 102100",

        // ------------------------------------------------------------------------------------------------------------------------
        // OPERATIONAL DATA SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------

        // Configure operational layers:

        // Configure operational layers below.
        // ServiceURL: URL of the layer.
        // LoadAsServiceType: Field to specify if the operational layers should be added as dynamic map service layer or feature layer.
        //                    Supported service types are 'dynamic' or 'feature'.
        OperationalLayers: [{
            ServiceURL: "http://50.18.115.76:6080/arcgis/rest/services/PermitsCT/MapServer/1",
            LoadAsServiceType: "feature"
        }, {
            ServiceURL: "http://50.18.115.76:6080/arcgis/rest/services/CUP/MapServer/0",
            LoadAsServiceType: "feature"
        }, {
            ServiceURL: "http://50.18.115.76:6080/arcgis/rest/services/ERP/MapServer/0",
            LoadAsServiceType: "feature"
        }],


        // Following zoom level will be set for the map upon searching an address 
        ZoomLevel: 12,
        
        // ------------------------------------------------------------------------------------------------------------------------
        // ADDRESS SEARCH SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set locator settings such as locator symbol, size, display fields, match score
        // LocatorParameters: Parameters(text, outFields, maxLocations, bbox, outSR) used for address and location search.
        // AddressSearch: Candidates based on which the address search will be performed.
        // PlaceNameSearch: Attributes based on which the layers will be queried when a location search is performed.
        // AddressMatchScore: Setting the minimum score for filtering the candidate results.
        // MaxResults: Maximum number of locations to display in the results menu.
        LocatorSettings: {
            DefaultLocatorSymbol: "/themes/images/redpushpin.png",
            MarkupSymbolSize: {
                width: 35,
                height: 35
            },
            Locators: [{
                DisplayText: "Address",
                LocatorDefaultAddress: "Lake Echo Rd Tracy City TN 37387",
                LocatorParameters: {
                    SearchField: "SingleLine",
                    SearchBoundaryField: "searchExtent"
                },
                LocatorURL: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                LocatorOutFields: [
                    "Addr_Type",
                    "Type",
                    "Score",
                    "Match_Addr",
                    "xmin",
                    "xmax",
                    "ymin",
                    "ymax"
                ],
                DisplayField: "${Match_Addr}",
                AddressMatchScore: {
                    Field: "Score",
                    Value: 80
                },
                AddressSearch: {
                    FilterFieldName: 'Addr_Type',
                    FilterFieldValues: ["StreetAddress", "StreetName", "PointAddress", "POI"]
                },
                PlaceNameSearch: {
                    LocatorFieldValue: "POI",
                    FilterFieldName: 'Type',
                    FilterFieldValues: ["county"],
                    enabled: true
                },
                MaxResults: 200
            }, {
                DisplayText: "Name",
                LocatorDefaultLocation: "Shelby Park"

            }, {
                DisplayText: "Activity",
                LocatorDefaultActivity: " "
            }]
        },

        // ------------------------------------------------------------------------------------------------------------------------
        // GEOMETRY SERVICE SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------

        // Set geometry service URL
        GeometryService: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",

        // ------------------------------------------------------------------------------------------------------------------------
        // SETTINGS FOR MAP SHARING
        // ------------------------------------------------------------------------------------------------------------------------

        // Set URL for TinyURL service, and URLs for social media
        MapSharingOptions: {
            TinyURLServiceURL: "http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=${0}&format=json",
            TinyURLResponseAttribute: "data.url",
            FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=esri%Template",
            TwitterShareURL: "http://mobile.twitter.com/compose/tweet?status=esri%Template ${0}",
            ShareByMailLink: "mailto:%20?subject=Check%20out%20this%20map!&body=${0}"
        }
    }
});