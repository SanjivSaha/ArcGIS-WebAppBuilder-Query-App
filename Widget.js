define(['dojo/_base/declare', 
        'dojo/parser', 
	'jimu/BaseWidget', 
	'dojo/_base/connect', 
	'dijit/registry', 
	'dojo/ready', 
	'dojo/query', 
	'dojo/_base/declare', 
	'dojo/_base/lang', 
	'dojo/_base/html',
	'dojo/dom', 
	'dojo/on', 
	'esri/tasks/query', 
	'esri/graphic', 
	'esri/Color', 
	'esri/layers/GraphicsLayer',
        'esri/tasks/QueryTask', 
	'esri/layers/FeatureLayer',
	'esri/layers/Field', 
	'esri/request', 
	'dojo/store/Memory', 
	'jimu/LayerInfos/LayerInfos',
	'esri/symbols/SimpleMarkerSymbol', 
	'dijit/form/FilteringSelect',
	'dijit/form/TextBox', 
	'esri/InfoTemplate', 
	'dijit/form/Button', 
	'dijit/Dialog', 
	'dijit/layout/ContentPane',
	'dgrid/Grid',
	'dgrid/Selection', 
	'esri/geometry/Point', 
	'esri/SpatialReference', 
	'esri/symbols/SimpleLineSymbol', 
	'dojo/_base/array', 
	'esri/graphicsUtils', 
	'dijit/layout/TabContainer', 
	'esri/layers/ArcGISDynamicMapServiceLayer', 
	'dojo/domReady!', 
	'jimu/loaderplugins/jquery-loader!https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'
	],

	function (declare, parser, BaseWidget, connect, registry, ready, query, declare, lang, html, dom, on, Query, Graphic, Color, GraphicsLayer,
		QueryTask, FeatureLayer, field, esriRequest, Memory, LayerInfos,
		SimpleMarkerSymbol, FilteringSelect, TextBox, InfoTemplate, Button, Dialog, ContentPane, Grid, Selection, Point, SpatialReference, 
		SimpleLineSymbol, arrayUtils, graphicsUtils, TabContainer, ArcGISDynamicMapServiceLayer, $) {
		parser.parse();
		return declare([BaseWidget], {
			//parser.parse();
			name: 'MyQueryCopy',
			baseClass: 'jimu-widget-myquerywidget',
			_grphcs: null,
			mapp: null,
			graphic: null,
			graphics: null,
			layer: null,
			queryType: null,
			category: null,
			feature: null,
			on: null,
			toDate: null,
			fromDate: null,
			url: null,
			state: null,
			prominence: null,
			stateName: null,
			queryType: 'State',
			queryString: null,
			featureType: null,
			condition: null,
			toHeight: null,
			fromHeight: null,
			queryResults: null,
			catOpt: null,
			ftType: null,
			query: null,
			arr: [],
			myGrid: null,
                        lyr : null,
			featureList : [],
			/************************startup() - Entry point for the widget, loads layer list dynamically**********************/
			startup: function () {
				this.inherited(arguments);
				console.log('startup');
				mapp = this.map;
				var layerListOpt="", visible = [], loadedLayer="";
				
				var layerIDs = mapp.layerIds;
                                for(var i = 0; i<layerIDs.length; i++){
				    visible = [];
				    loadedLayer = mapp.getLayer(layerIDs[i]);
				    console.log('Base Layer Id :'+ loadedLayer.id + ',' + 'Base Layer Url :' + loadedLayer.url);
				    visible = loadedLayer.layerInfos;
				}	
				
				console.log('Loaded Base Layer Id :'+ loadedLayer.id + ',' + 'Loaded Base Layer Url :' + loadedLayer.url);
				
				this.lyr = loadedLayer;
				layerListOpt += "<option value=" + "\"" + 'Select' + "\"" + ">" + 'Select' + "</option>";
				for(var i=0; i< visible.length; i++){
				      console.log('Sub Layer :'+ visible[i].id + ','+visible[i].name); 
				      if((visible[i].id === 15) || (visible[i].id === 19)){ //Pay attention -- Change id if LandPlot layer id is not 19
				          console.log('Loaded Sub Layer :'+ visible[i].id + ','+visible[i].name); 
				          layerListOpt += "<option value=" + visible[i].id + ">" + visible[i].name + "</option>";
				      }	  
			        }
                                document.getElementById("layerSelect").innerHTML = layerListOpt;				  
			       
		       	},
			/******************************************************************************************************************/
			
			/***************showResults() -Process query results and display in a grid inside a dialog box*********************/
			showResults: function (featureSet) {
				var mapLayer = "";
				var infoTmplt = "";
				var title = "";
				var content = "";
				this.layer = this.queryTask.url;
				if (this.layer.includes("15")) {
					var symbol = new esri.symbol.SimpleMarkerSymbol().setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE);
					title = "Buildings";
					content = "<b> FID : </b> ${FID}</br>" +
						"<b> OWNER_NAME : </b> ${OWNER_NAME}</br>" +
						"<b> BLDG_ID : </b> ${BLDG_ID}</br>" +
						"<b> BLDG_NAME : </b> ${BLDG_NAME}</br>";
				}
				else if (this.layer.includes("19")) { //Pay attention -- Change id if LandPlot layer id is not 19
					var symbol = new esri.symbol.SimpleMarkerSymbol().setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_SOLID);
					title = "Landplots";
					content = "<b> FID : </b> ${FID}</br>" +
						"<b> PLOT_CTGY : </b> ${PLOT_CTGY}</br>" +
						"<b> LESSE_NAME : </b> ${LESSE_NAME}</br>" +
						"<b> LEASE_EXPI : </b> ${LEASE_EXPI}</br>";
				}
				/**********************************Not Required****************************
				else if (this.layer.includes("1")) {
					var symbol = new esri.symbol.SimpleLineSymbol().setStyle(esri.symbol.SimpleLineSymbol.STYLE_SOLID);
					symbol.setWidth(3);
					symbol.setMarker({
                                           style: "arrow",
                                           placement: "end"
                                        });
					title = "Rivers";
					content = "<b> NAME : </b> ${NAME}</br>" +
						"<b> SYSTEM : </b> ${SYSTEM}</br>";
				}
				/***************************************************************************/
				
				this.graphics = new esri.layers.GraphicsLayer();

				var map1 = new Map();
				var resultFeatures = featureSet.features;
				this.featureList = featureSet.features;
				var jsonString = "";
				var arr = [];
				var lbl = "";
				var items = [];
				var count = 0;
				var idType = "";
				for (var i = 0, il = resultFeatures.length; i < il; i++) {
                                        map1.set(resultFeatures[i].attributes.FID, resultFeatures[i]);
					idType = 'FID';
					this.graphic = resultFeatures[i];
					console.log(this.graphic.attributes);
					items = this.graphic.attributes;
					for (var key in this.graphic.attributes) {
			   		        if ((resultFeatures.length - i) == 1) {
							arr.push({
								field: key,
								label: key

							});
							count = count + 1;
						}
                                        }

					this.graphic.setSymbol(symbol);

					var infoTmplt = new esri.InfoTemplate();
					infoTmplt.setTitle(title);
					infoTmplt.setContent(content);
					graphic.setInfoTemplate(infoTmplt);
					this.graphics.add(this.graphic);

				}
				mapp.addLayer(this.graphics);

				var ct = '<div data-dojo-type="dijit/layout/ContentPane" style="height:280px;">' +
					'<div id="grid" style="height:98%; width:500%;"></div>' +
					'</div>';

				var myDialog = new dijit.Dialog({
					title: "Query Results",
					content: ct,
					style: "width: 1200px",
					onHide: function () {
						myDialog.destroy() 
					}
				});

				var myGrid = declare([dgrid.Grid, dgrid.Selection]);

				var grid = new myGrid({      
					columns: arr,
					selectionMode: 'single',
					    
				}, 'grid');
				
				grid.on("dgrid-select", function (evt) {
					var objID = evt.rows[0].data.FID;
					
					var ext = map1.get(objID);
					if(ext.geometry.type == 'point'){
						var maxZoom = mapp.getMaxZoom();
						var cityCenter = new esri.geometry.Point(ext.geometry.x, ext.geometry.y, new esri.SpatialReference({
							wkid: ext.geometry.spatialReference.wkid
						}));
						mapp.centerAndZoom(cityCenter, 8);
				        }
                                        else if(ext.geometry.type == 'polygon'){
						var extent = ext.geometry.getExtent();
						mapp.setExtent(ext.geometry.getExtent());
                                        }
					else if(ext.geometry.type == 'polyline'){
 						var extent = ext.geometry.getExtent();
						mapp.setExtent(ext.geometry.getExtent());
                                        }
				
                                });

				var item = arrayUtils.map(resultFeatures, function (ft) {
					var graphic = ft.attributes;
					return ft.attributes;
				});

				grid.refresh();
                                grid.renderArray(item);
				myDialog.show();

                        },
			/********************************************************************************************************************/
			
			
			 _onLoadWidgetBClick: function(){
			       console.log(this.featureList);
                               var widgets = this.appConfig.getConfigElementsByName('WidgetB');
                               if(widgets.length === 0){
                                   this.loadWidgetBInfoNode.innerText = 'Widget B is not configured.';
                                   return;
                               }

                               var widgetId = widgets[0].id;
                               if(this.widgetManager.getWidgetById(widgetId)){
                                   this.loadWidgetBInfoNode.innerText = 'Widget B has been loaded.';
                                   return;
                               }
                               this.openWidgetById(widgetId).then(lang.hitch(this, function(widget){
                               this.loadWidgetBInfoNode.innerText = widget.name + ' is loaded';
                           }));
                        },
			
									
			/**********************_onBtnValidateClicked() - Enabling/disabling fields according to query type*******************/
			_onBtnValidateClicked: function () {
				this.queryType = dom.byId('querySelect').value;
				if (this.queryType === 'Category') {
					var categoryType = dom.byId('categoryType').style.display = "block";
					categoryType.disabled = false;
					var categoryTypeLbl = dom.byId('categoryTypeDropDown').style.display = "block";

					var featureType = dom.byId('featureType').style.display = "none";
					featureType.disabled = true;
					var featureTypeLbl = dom.byId('featureTypeDropDown').style.display = "none";

					var condition = dom.byId('condition').style.display = "none";
					condition.disabled = true;
					var conditionLbl = dom.byId('conditionDropDown').style.display = "none";

					var toDate = dom.byId('toHeight').style.display = "none";
					toDate.disabled = true;
					var toDateLbl = dom.byId('toDateDropDown').style.display = "none";

					var fromDate = dom.byId('fromHeight').style.display = "none";
					fromDate.disabled = true;
					var fromDateLbl = dom.byId('fromDateDropDown').style.display = "none";

					var leaseLbl = dom.byId('leaseDropDown').style.display = "none";
					var andLbl = dom.byId('andDropDown').style.display = "none";
				} else {
					var categoryType = dom.byId('categoryType').style.display = "none";
					categoryType.disabled = true;
					var categoryTypeLbl = dom.byId('categoryTypeDropDown').style.display = "none";

					var featureType = dom.byId('featureType').style.display = "block";
					featureType.disabled = false;
					var featureTypeLbl = dom.byId('featureTypeDropDown').style.display = "block";

					var condition = dom.byId('condition').style.display = "block";
					condition.disabled = false;
					var conditionLbl = dom.byId('conditionDropDown').style.display = "block";

					var toDate = dom.byId('toHeight').style.display = "block";
					toDate.disabled = false;
					var toDateLbl = dom.byId('toDateDropDown').style.display = "block";

					var fromDate = dom.byId('fromHeight').style.display = "block";
					fromDate.disabled = false;
					var fromDateLbl = dom.byId('fromDateDropDown').style.display = "block";

					var leaseLbl = dom.byId('leaseDropDown').style.display = "block";
					var andLbl = dom.byId('andDropDown').style.display = "block";

				}
				
				var featureDropdownVal = dom.byId("featureType").value;
				if(featureDropdownVal ===""){
					var condition = dom.byId('condition').style.display = "none";
					condition.disabled = true;
					var conditionLbl = dom.byId('conditionDropDown').style.display = "none";

					var toDate = dom.byId('toHeight').style.display = "none";
					toDate.disabled = true;
					var toDateLbl = dom.byId('toDateDropDown').style.display = "none";

					var fromDate = dom.byId('fromHeight').style.display = "none";
					fromDate.disabled = true;
					var fromDateLbl = dom.byId('fromDateDropDown').style.display = "none";
							
				        var leaseLbl = dom.byId('leaseDropDown').style.display = "none";
					var andLbl = dom.byId('andDropDown').style.display = "none";
				}

			},
                        /*******************************************************************************************************************/
			
			/***************_onChangeCondition() - Enable/disable 'to' and 'from' fields according to query criteria************/
			_onChangeCondition: function () {
				var condition = dom.byId('condition').value;
				if (condition === 'AND') {
					var toDate = dom.byId('toHeight').style.display = "block";
					toDate.disabled = false;
					var toDateLbl = dom.byId('toDateDropDown').style.display = "block";
					var fromDate = dom.byId('fromHeight').style.display = "block";
					fromDate.disabled = false;
					var fromDateLbl = dom.byId('fromDateDropDown').style.display = "block";
					var andLbl = dom.byId('andDropDown').style.display = "block";
				} else {
					var toDate = dom.byId('toHeight').style.display = "none";
					toDate.disabled = true;
					var toDateLbl = dom.byId('toDateDropDown').style.display = "none";
					var andLbl = dom.byId('andDropDown').style.display = "none";
				}
			},
			/*******************************************************************************************************************/

			/******_onBtnSubmitClicked() - Create query string according to query type and invoke function to execute query*****/
			_onBtnSubmitClicked: function () {
				this.queryString = '';
				this.url = this.layer;
				this.queryType = dom.byId('querySelect').value;
				if (this.layer.includes("15")) {
					if (this.queryType === 'Category') {
						this.state = 'BLDG_CTGY';
					}
				}
				/****************Not Required Now*******************
				else if (this.layer.includes("2")) { 
					if (this.queryType === 'Category') {
						this.state = 'STATE_NAME';
					}
				}
				/**************************************************/
				else if (this.layer.includes("19")) { //Pay attention -- Change id if LandPlot layer id is not 19
					if (this.queryType === 'Category') {
						this.state = 'PLOT_CTGY';
					}
				}
				
				this.category = dom.byId('categoryType').value;

				if (this.queryType === 'Category') {
					this.queryString = this.state + "=" + "'" + this.category + "'";
				} else {

					this.feature = dom.byId('featureType').value;
					this.toDate = dom.byId('toHeight').value;
					this.fromDate = dom.byId('fromHeight').value;
					this.on = dom.byId('condition').value;
					if (this.on === '=') {
						this.condition = '=';
						this.queryString = this.feature + " " + this.on + " " + "'" + this.fromDate + "'" ;

					} else if (this.on === '<') {
						this.condition = '<';
						this.queryString = this.feature + " " + this.on + " " + "'" + this.fromDate + "'" ;
					} else if (this.on === '>') {
						this.condition = '>';
						this.queryString = this.feature + " " + this.on + " " + "'" + this.fromDate + "'" ;
					} else {
						this.condition = 'AND';
						this.queryString = this.feature + " " + 'BETWEEN' + " " + "'" + this.fromDate + "'" + " " + this.on + " " + "'" + this.toDate + "'";
					}
				}
				console.log(this.queryString);
				this._executeQuery();

			},
                        /*******************************************************************************************************************/
			
			/**********************_onBtnClearClicked() - Clear graphics and set zoom level to original*************************/
			_onBtnClearClicked: function () {
				graphics.clear();
				mapp.setZoom(3);
			},
			/*******************************************************************************************************************/
 
                        /*******************************_executeQuery() - Query the feature service*****************************************/
			_executeQuery: function () {
				this.url = this.layer;
				queryTask = new esri.tasks.QueryTask(this.url);
				query = new esri.tasks.Query();
				query.returnGeometry = true;
				query.outFields = ["*"];
				query.outSpatialReference = mapp.spatialReference;

				if (mapp.loaded) {
					query.where = this.queryString;
					queryTask.execute(query, this.showResults);
				} else {
					mapp.on("load", function () {
						query.where = this.queryString;
						queryTask.execute(query, showResults);
					});
				}

			},
                        /*******************************************************************************************************************/			

			/************_onChangeClicked() - Calls _execute() to fetch category and features of the feature service************/
			_onChangeClicked: function () {
				var visibleLayerIds = [], url="";
				this.lyr.setVisibleLayers(visibleLayerIds);
				var layerVal = dom.byId('layerSelect').value;
				var lyrInfo = this.lyr.layerInfos;
				var lyrId = parseInt(layerVal);
				var baseUrl = this.lyr.url;
				for(var i=0; i<lyrInfo.length; i++){
					if(lyrInfo[i].id === lyrId){
					   visibleLayerIds.push(lyrInfo[i].id);
					   this.lyr.setVisibleLayers(visibleLayerIds);
					   this.layer = baseUrl + "/" + lyrInfo[i].id;
					   console.log('URL --' + this.layer);
					}
				}
				this._execute();
			},
			/*******************************************************************************************************************/

			/******************queryResult() - Loads category and features of the feature service*******************************/
			queryResult: function (featureSet) {
				var catOptions = ""; 
				var featrOptions = ""; 
				this.layer = this.queryTask.url;
				var array = [];
				
					var resultFeatures = featureSet.features 
					for (var i = 0, il = resultFeatures.length; i < il; i++) {
						this.queryResults = resultFeatures[i];
						if(this.layer.includes("15")){
						   array[i] = this.queryResults.attributes.BLDG_CTGY;
						}
						/****************Not Required Now*******************
						else if(this.layer.includes("2")){  
						   array[i] = this.queryResults.attributes.STATE_NAME;
						}
						/***************************************************/
						else if(this.layer.includes("19")){  //Pay attention -- Change id if LandPlot layer id is not 19
						   array[i] = this.queryResults.attributes.PLOT_CTGY;
						}
						
					}
					this.catOpt = [...new Set(array)];
					console.log(this.catOpt);
				

					this.url = this.layer;
					var categoryOptions = this.catOpt;
					for (var i = 0; i < categoryOptions.length; i++) {
						catOptions += "<option value=" + "\"" + categoryOptions[i] + "\"" + ">" + categoryOptions[i] + "</option>";
					}
					document.getElementById("categoryType").innerHTML = catOptions;


					var mapLayer = new esri.layers.FeatureLayer(this.url, {
						mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
						outFields: ["*"]
					});
					var arr = [];
					dojo.connect(mapLayer, 'onLoad', function () {

						for (i = 0; i < mapLayer.fields.length; i++) {
							if (mapLayer.fields[i].type === "esriFieldTypeString"){ //Pay attention -- Change if LandPlot date field is of date type, else let it be for time being
								v = mapLayer.fields[i].name;
								arr[i] = mapLayer.fields[i].name;
							}
						}
						var featOptions = arr;
						for (var j = 0; j < featOptions.length; j++) {
							if (featOptions[j] != undefined)
								featrOptions += "<option value=" + "\"" + featOptions[j] + "\"" + ">" + featOptions[j] + "</option>";
						}
						document.getElementById("featureType").innerHTML = featrOptions;
						var featureDropdownVal = dom.byId("featureType").value;
						if(featrOptions ===""){
							var condition = dom.byId('condition').style.display = "none";
					                condition.disabled = true;
					                var conditionLbl = dom.byId('conditionDropDown').style.display = "none";

					                var toDate = dom.byId('toHeight').style.display = "none";
					                toDate.disabled = true;
					                var toDateLbl = dom.byId('toDateDropDown').style.display = "none";

					                var fromDate = dom.byId('fromHeight').style.display = "none";
					                fromDate.disabled = true;
					                var fromDateLbl = dom.byId('fromDateDropDown').style.display = "none";
							
							var leaseLbl = dom.byId('leaseDropDown').style.display = "none";
					                var andLbl = dom.byId('andDropDown').style.display = "none";
						}
						else{
						        var condition = dom.byId('condition').style.display = "block";
					                condition.disabled = false;
					                var conditionLbl = dom.byId('conditionDropDown').style.display = "block";

					                var toDate = dom.byId('toHeight').style.display = "block";
					                toDate.disabled = false;
					                var toDateLbl = dom.byId('toDateDropDown').style.display = "block";

					                var fromDate = dom.byId('fromHeight').style.display = "block";
					                fromDate.disabled = false;
					                var fromDateLbl = dom.byId('fromDateDropDown').style.display = "block";

					                var leaseLbl = dom.byId('leaseDropDown').style.display = "block";
					                var andLbl = dom.byId('andDropDown').style.display = "block";

						}
					});

				
                        },
			/*******************************************************************************************************************/
			
			/*********************_execute() - Fetches category and features of the feature service*****************************/
			_execute: function () {
				query = new esri.tasks.Query();
				query.returnGeometry = true;
				this.url = this.layer;
				query.outFields = ["*"];
				queryTask = new esri.tasks.QueryTask(this.url);
				
				if (mapp.loaded) {
					query.where = "1=1";
					queryTask.execute(query, this.queryResult);
				} else {
					mapp.on("load", function () {
						query.where = "1=1";
						queryTask.execute(query, this.queryResult);
					});
				}

			}
			/*******************************************************************************************************************/

		});
	});