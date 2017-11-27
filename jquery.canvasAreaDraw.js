(function( $ ){

	$.widget("custom.htmlimagemap", {

		//Default options
		options:{
			name: "map",
			image: null,
			mobile: false,
			imageUrl: "",
			activeColor: "255,20,20",
			inactiveColor: "#323232",
			fillOpacity: "0.3",
			lineWidth: 2,			
			mode: "",
			areas: [{
				href:"",
				coords:[]
			}],
			onMove: function(p){},
			onUpdateArea: function(p){},
			onSelect: function(p){}
		},

		_applyHandler: function(method) {
			var context = this.isCSMode() ? this._CSMode : this,
				fn = context[method];
			if (typeof fn === 'function') {
				fn.apply(context, [].slice.call(arguments, 1));
			}
		},

		//Widget implementation
		_create: function(){

			var self = this,
				cb;
			this.__activeArea = 0;
			this.__activeCoord = undefined;
			this.__settings = undefined;
			this.__$canvas = undefined;
			this.__ctx = undefined;
			this.__image = this.options.image ? $(this.options.image)[0] : new Image();

			this.__$canvas = this._initCanvas();
			this.__ctx = this.__$canvas[0].getContext('2d');

			$(this.element).append(this.__$canvas);
			$(this.__$canvas).on('mousedown', function(e){
				self._applyHandler('__mousedown', e);
			});
			$(this.__$canvas).on('contextmenu', function(e){
				self._applyHandler('__rightclick', e);
			});
			$(this.__$canvas).on('mouseup', function(e){
				self._applyHandler('__mouseup', e);
			});
			$(this.__$canvas).on('mouseleave', function(e){
				self.__stopdrag(e);
			});

			if (this.options.mobile) {
				registerTouchEvents(this.__$canvas[0]);
			}

			if (this.isCSMode()) {
				this._CSMode.init(this);
				cb = this._CSMode.onCanvasSizeUpdate.bind(this._CSMode);
			}

			this.setImageUrl(this.options.imageUrl, cb);

		},

		_initCanvas: function() {
			var canvas = $('<canvas>');
			if (!canvas[0].getContext && typeof G_vmlCanvasManager !== 'undefined') {
				//IE Support
				canvas[0] = G_vmlCanvasManager.initElement(canvas[0]);
			}
			return canvas;
		},

		_clearCtx: function(ctx) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
		},

		__redraw: function(){
			$(this.__$canvas[0]).attr('height', this.__image.height).attr('width', this.__image.width);
			$(this.__$canvas[0]).css('height', this.__image.height+"px").css('width', this.__image.width+"px");
			this.__$canvas[0].width = this.__image.width;
			this.__$canvas[0].height = this.__image.height;
			this.__draw();
		},

		__move: function(e){
			e.offsetX = (e.pageX - $(this.__$canvas[0]).offset().left);
			e.offsetY = (e.pageY - $(this.__$canvas[0]).offset().top);
			if($.browser.msie && parseFloat($.browser.version)<8){
				e.offsetY = e.offsetY-$('body').scrollTop();
			}
			this.options.areas[this.__activeArea].coords[this.__activeCoord] = Math.round(e.offsetX);
			this.options.areas[this.__activeArea].coords[this.__activeCoord+1] = Math.round(e.offsetY);
			this.__redraw();
			this.options.onMove(this.options.areas[this.__activeArea]);
		},

		__stopdrag: function(){
			$(this.element).off('mousemove');
			this.__activeCoord = null;
			this.options.onUpdateArea(this.options.areas[this.__activeArea]);
		},

		__rightclick: function(e){
			e.preventDefault();
			e.offsetX = (e.pageX - $(this.__$canvas[0]).offset().left);
			e.offsetY = (e.pageY - $(this.__$canvas[0]).offset().top);
			var x = e.offsetX, y = e.offsetY;
			if($.browser.msie && parseFloat($.browser.version)<8){
				y = e.offsetY-$('body').scrollTop();
			}
			for (var i = 0; i < this.options.areas[this.__activeArea].coords.length; i+=2) {
				dis = Math.sqrt(Math.pow(x - this.options.areas[this.__activeArea].coords[i], 2) + Math.pow(y - this.options.areas[this.__activeArea].coords[i+1], 2));
				if ( dis < 6 ) {
					this.options.areas[this.__activeArea].coords.splice(i, 2);
					this.options.onUpdateArea(this.options.areas[this.__activeArea]);
					this.__redraw();
					return false;
				}
			}
			return false;
		},

		__mousedown: function(e){
			var x, y, dis, lineDis, insertAt = this.options.areas[this.__activeArea].coords.length;
			var self = this;

			if (e.which === 3) {
				return false;
			}

			e.preventDefault();
			e.offsetX = (e.pageX - $(this.__$canvas[0]).offset().left);
			e.offsetY = (e.pageY - $(this.__$canvas[0]).offset().top);
			x = e.offsetX; y = e.offsetY;
			if($.browser.msie && parseFloat($.browser.version)<8){
				y = e.offsetY-$('body').scrollTop();
			}
			//Move existing coord
			for (var i = 0; i < this.options.areas[this.__activeArea].coords.length; i+=2) {
				dis = Math.sqrt(Math.pow(x - this.options.areas[this.__activeArea].coords[i], 2) + Math.pow(y - this.options.areas[this.__activeArea].coords[i+1], 2));
				if ( dis < 6 ) {
					this.__activeCoord = i;
					$(this.element).on('mousemove', function(e){
						self.__move(e);
					});
					return false;
				}
			}

			//Insert new coord if close to line
			for (var i = 0; i < this.options.areas[this.__activeArea].coords.length; i+=2) {
				if (i > 1) {
					lineDis = dotLineLength(
						x, y,
						this.options.areas[this.__activeArea].coords[i], this.options.areas[this.__activeArea].coords[i+1],
						this.options.areas[this.__activeArea].coords[i-2], this.options.areas[this.__activeArea].coords[i-1],
						true
					);
					if (lineDis < 6) {
						insertAt = i;
					}
				}
			}

			this.options.areas[this.__activeArea].coords.splice(insertAt, 0, Math.round(x), Math.round(y));
			this.__activeCoord = insertAt;
			$(this.element).on('mousemove', function(e){
				self.__move(e);
			});

			this.options.onUpdateArea(this.options.areas[this.__activeArea]);
			this.__redraw();

			return false;
		},

		__mouseup: function() {
			this.__stopdrag();
		},

		__draw: function(){

			this.__ctx.canvas.width = this.__ctx.canvas.width;
			this.__ctx.globalCompositeOperation = 'source-over';

			for(var i=0; i<this.options.areas.length; i++){

				if(i != this.__activeArea){
					this.__drawArea(i);
				}

			}

			this.__drawArea(this.__activeArea);
		},

		__isArea: function(index) {
			return this.options.areas[index].coords.length > 2;
		},

		__onAreaSelect: function() {
			if (typeof this.options.onSelect === 'function') {
				this.options.onSelect(this.__isArea(this.__activeArea) ? this.__activeArea : null);
			}
		},

		__drawArea: function(area){

			var strokePolygonRgb = '';
			var fillPolygonRgba = '';
			var strokeCoordRgb = '';
			var fillCoordRgb = '',
				convertColorHex2Dec = function(hexColor) {
					var result = [],
						chars = (hexColor || "").slice(1).split(''),
						tmp;
					for (var i = 0; i < chars.length; i+=2) {
						tmp = chars.slice(i, i+2).join('');
						result.push(parseInt(tmp, 16));
					}
					return result;
				},
				getRgbStrExpr = function(color, opacity) {
					if( color.indexOf(',')>0 ){
						var str = opacity ? 'rgba('+color+','+opacity+')' : 'rgb('+color+')';
						console.log( "::getRgbStrExpr:: ", str );
						return str;
					} else {
						var str = ( opacity ? 'rgba(%s, %o)'.replace('%o', opacity) : 'rgb(%s)' )
								  .replace('%s', convertColorHex2Dec(color).join(','));
						console.log( "::getRgbStrExpr:: ", str );
						return str;
					}
				};

			// nothing to draw, don't redraw :)
			if (this.options.areas[area].coords.length < 2) {
				return false;
			}

			if(area == this.__activeArea){
				strokePolygonRgb = getRgbStrExpr(this.options.activeColor);
				fillPolygonRgba = getRgbStrExpr(this.options.activeColor,this.options.fillOpacity);
				strokeCoordRgb = strokePolygonRgb;
				fillCoordRgba = getRgbStrExpr("#ffffff");
				
			}else{
				strokePolygonRgb = getRgbStrExpr(this.options.inactiveColor);
				fillPolygonRgba = getRgbStrExpr(this.options.inactiveColor,this.options.fillOpacity);
				strokeCoordRgb = strokePolygonRgb;
				fillCoordRgba = fillPolygonRgba;
			}

			this.__ctx.lineWidth = 1;
			this.options.areas[area].color = this.options.lineWidth;

			//Draw polygon
			this.__ctx.beginPath();
			this.__ctx.moveTo(this.options.areas[area].coords[0], this.options.areas[area].coords[1]);
			for (var i = 0; i < this.options.areas[area].coords.length; i+=2) {
				if (this.options.areas[area].coords.length > 2 && i > 1) {
					this.__ctx.lineTo(this.options.areas[area].coords[i], this.options.areas[area].coords[i+1]);
				}
			}
			this.__ctx.closePath();
			this.__ctx.strokeStyle = strokePolygonRgb;
			this.__ctx.stroke();
			this.__ctx.fillStyle = fillPolygonRgba;
			this.__ctx.fill();

			//Draw coords -- min rect size is 4 pixels
			var r = Math.max( 4, this.options.lineWidth );
			this.__ctx.strokeStyle = strokeCoordRgb;
			this.__ctx.fillStyle = fillCoordRgb;
			for (var i = 0; i < this.options.areas[area].coords.length; i+=2) {
				this.__ctx.strokeRect(this.options.areas[area].coords[i]-r, this.options.areas[area].coords[i+1]-r, 2*r, 2*r);
				this.__ctx.fillRect(this.options.areas[area].coords[i]-r, this.options.areas[area].coords[i+1]-r, 2*r, 2*r);
			}

		},

		__fixActiveAreaIndex: function(){
			if(typeof this.options.areas[this.__activeArea] == "undefined"){
				if(typeof this.options.areas[this.__activeArea-1] != "undefined"){
					this.setActiveAreaIndex(this.__activeArea-1);
				}else{
					this.setActiveAreaIndex(this.__activeArea);
				}
			}
		},

		//Public API
		removeAll: function(){
			this.options.areas = [];
			this.__fixActiveAreaIndex();
			this.__redraw();
		},

		getMode: function() {
			return this.options.mode;
		},

		isCSMode: function() {
			return this.getMode() === 'continiousSelect';
		},

		getAreas: function(){
			return this.options.areas;
		},

		setAreas: function(areas){
			this.options.areas = areas;
			this.setActiveAreaIndex(0);
			this.__redraw();
		},

		getArea: function(i){
			return this.options.areas[i];
		},

		setArea: function(i,v){
			this.options.areas[i] = v;
			this.__redraw();
		},

		removeArea: function(i){
			this.options.areas.splice(i,1);
			this.__fixActiveAreaIndex();
			this.__redraw();
		},

		resetArea: function(i){
			this.setArea(i, {
				href: "",
				coords: []
			});
			this.options.onUpdateArea(this.options.areas[i]);
			this.__redraw();
		},

		//ACTIVE AREA
		getActiveArea: function(){
			return this.options.areas[this.__activeArea];
		},

		setActiveArea: function(v){
			this.setArea(this.__activeArea, v);
		},

		resetActiveArea: function(){
			this.resetArea(this.__activeArea);
		},

		removeActiveArea: function(){
			this.removeArea(this.__activeArea);
		},

		//ACTIVE AREA INDEX
		getActiveAreaIndex: function(){
			return this.__activeArea;
		},

		setActiveAreaIndex: function(i){
			if(i < 0){
				return;
			}
			this.__activeArea = i;
			if(typeof this.options.areas[i] == "undefined"){
				this.resetArea(i);
			}
			this.__redraw();
		},

		setImageUrl: function(url, cb){

			var self = this,
				launchCb = function() {
					if (typeof cb === 'function') {
						cb();
					}
				};

			this.options.imageUrl = url;
			var imgonload = function(){
				if (self.options.image) {
					$(self.__$canvas).css({
						position: 'absolute',
						width: '100%',
						height: '100%',
						top: 0,
						left: 0
					});
				} else {
					$(self.__$canvas).css({background: 'url('+self.__image.src+')'});
				}
				self.__redraw();
				launchCb();
			};

			var preload = function(){
				var img = self.__image;
				if(img.complete != null && img.complete == true){
					imgonload();
					return;
				}
				setTimeout(preload, 500);
			};

			$(this.__image).load(imgonload);
			preload();
			if (this.__image.src !== url) {
				this.__image.src = url;
			}
		},

		getImageUrl: function(){
			return this.options.imageUrl;
		},

		_CSMode: {
			context: null,
			init: function(context) {
				this.context = context;
				this.__mouseMoves = [];
				this.__$drawCanvas = this.context._initCanvas();
				$(this.context.element).css({'position': 'relative'});
				$(this.context.element).append(this.__$drawCanvas);
				$(this.context.__$canvas).on('mousemove', this.__mousemove.bind(this));
				$(this.__$drawCanvas).on('mousemove', this.__mousemove.bind(this));
				$(this.__$drawCanvas).on('mouseup', this.__mouseup.bind(this));
				$(this.__$drawCanvas).on('mousedown', this.__mousedown.bind(this));
				$(this.__$drawCanvas).on('mouseleave', this.__stopDrag.bind(this));
				this.__drawCanvasCtx = this.__$drawCanvas[0].getContext('2d');
			},

			_addClick: function(e, isDragging) {
				var offset = $(e.target).offset();
				this.__mouseMoves.push({x: e.pageX - offset.left, y: e.pageY - offset.top, isDragging: isDragging});
			},

			__mousedown: function(e) {
				var areas = this.context.getAreas();
				this.context.setActiveAreaIndex(areas.length);
				e.preventDefault();
				this._isDrawing = true;
				this._showDrawArea();
				this.__mouseMoves = [];
				this._addClick(e);
			},

			__click: function() {
				var point = this.__mouseMoves[0],
					areas = this.context.getAreas().reverse(),
					selectedAreaIndex = null,
					isWithinArea = function(p, coords) {
						var sded = {
							left: false,
							right: false,
							top: false,
							bottom: false
						};
						for (var i = 0; i < coords.length; i+=2) {
							if (coords[i] < p.x) {
								sded.left = true;
							} else {
								sded.right = true;
							}
							if (coords[i + 1] < p.y) {
								sded.top = true;
							} else {
								sded.bottom = true;
							}
						}
						return sded.left && sded.right && sded.top && sded.bottom;
					};
				for (var i = 0; i < areas.length; i++) {
					if (isWithinArea(point, areas[i].coords)) {
						selectedAreaIndex = i;
						break;
					}
				}
				if (typeof selectedAreaIndex === 'number') {
					this.context.setActiveAreaIndex(selectedAreaIndex);
				}
				this.context.__onAreaSelect();
			},

			_prepareCoords: function(coords) {
				var step = this.context.options.approximationStep || 0,
					approximate = function(coords) {
						var result = [coords[0]],
							checkDiff = function(v1, v2) {
								return Math.abs(v1 - v2) > step;
							},
							lastPoint = null;
						for (var i = 1; i < coords.length; i++) {
							lastPoint = result[result.length - 1];
							if (i < coords.length - 1 && checkDiff(coords[i].x, lastPoint.x) && checkDiff(coords[i].y, lastPoint.y)) {
								result.push(coords[i]);
							}
						}
						return result;
					},
					convertCoords = function(coords) {
						var result = [];
						coords.forEach(function(c){
							result.push.call(result, c.x, c.y);
						});
						return result;
					};
				return convertCoords(approximate(coords));
			},

			__mouseup: function(e) {
				e.preventDefault();
				if (this.__$drawCanvas.css('display') === 'none') {
					return false;
				}
				this.__stopDrag();
				this._showDrawArea(false);
				this._clearCtx();
				if (this.__mouseMoves.length === 1) {
					return this.__click();
				}
				if (this.__mouseMoves.length < 3) {
					return false;
				}
				this.context.setActiveArea({coords: this._prepareCoords(this.__mouseMoves)});
			},

			__mousemove: function(e) {
				if (!this._isDrawing) {
					return false;
				}
				this._addClick(e, true);
				this._redraw();
			},

			_clearCtx: function() {
				this.context._clearCtx(this.__drawCanvasCtx);
			},

			_redraw: function() {
				var ctx = this.__drawCanvasCtx;
				this._clearCtx();

				ctx.strokeStyle = "#df4b26";
				ctx.lineJoin = "round";
				ctx.lineWidth = 5;

				for(var i=0; i < this.__mouseMoves.length; i++) {
					ctx.beginPath();
					if (this.__mouseMoves[i].isDragging && i) {
						ctx.moveTo(this.__mouseMoves[i - 1].x, this.__mouseMoves[i - 1].y);
					} else {
						ctx.moveTo(this.__mouseMoves[i].x - 1, this.__mouseMoves[i].y);
					}
					ctx.lineTo(this.__mouseMoves[i].x, this.__mouseMoves[i].y);
					ctx.stroke();
					ctx.closePath();
				}
			},

			onCanvasSizeUpdate: function() {
				var mainCanvas = this.context.__$canvas,
					w = mainCanvas.width(),
					h = mainCanvas.height();
				this.__$drawCanvas.attr('height', h).attr('width', w);
				this.__$drawCanvas.css({
					display: 'none',
					position: 'absolute',
					left: 0,
					top: 0,
					width: w + 'px',
					height: h + 'px'
				});
				this.__$drawCanvas.width = w;
				this.__$drawCanvas.height = h;
			},

			__stopDrag: function() {
				this._isDrawing = false;
			},

			_showDrawArea: function(flag) {
				if (flag !== false) {
					this.__$drawCanvas.css({display: 'inline-block'});
				} else {
					this.__$drawCanvas.hide();
				}
			}
		}
	});

	var dotLineLength = function(x, y, x0, y0, x1, y1, o) {
		function lineLength(x, y, x0, y0){
	        return Math.sqrt((x -= x0) * x + (y -= y0) * y);
	    }
	    if(o && !(o = function(x, y, x0, y0, x1, y1){
	        if(!(x1 - x0)) return {x: x0, y: y};
	        else if(!(y1 - y0)) return {x: x, y: y0};
	        var left, tg = -1 / ((y1 - y0) / (x1 - x0));
	        return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
	    }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
	        var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
	        return l1 > l2 ? l2 : l1;
	    }
	    else {
	        var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
	        return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
	    }
	};

	var touchHandler = function(e) {
			dispatchEvent(e);
		},
		registerTouchEvents = function(target) {
			if (!target) {
				target = document;
			}
			target.addEventListener("touchstart", touchHandler, true);
			target.addEventListener("touchmove", touchHandler, true);
			target.addEventListener("touchend", touchHandler, true);
		},
		dispatchEvent = function(event, target) {
			event.preventDefault();
		    var touch = event.changedTouches[0] || event;

		    var simulatedEvent = document.createEvent("MouseEvent");
		    simulatedEvent.initMouseEvent({
		        touchstart: "mousedown",
		        touchmove: "mousemove",
		        touchend: "mouseup"
		    }[event.type], true, true, window, 1,
		        touch.screenX, touch.screenY,
		        touch.clientX, touch.clientY, false,
		        false, false, false, 0, null);
			simulatedEvent.originalType = event.type;

		    (target || touch.target).dispatchEvent(simulatedEvent);
		};

})( jQuery );
