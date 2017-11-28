jImageMap - jQuery ImageMap Area Canvas Editor
======================

jQuery plugin to create imagemap area polygon coordinates. 
Display an image with a canvas on which points may be added 
to create a polygon.

Flexible API allows you to create multiple areas, manipulate them in several ways, get notified on changes, for any purpose. Please check the demo.html page to view an example of the usage of the API.

### EXAMPLE

Include the javascript file in your page after jQuery and use the following jQuery call:

```html
<div id="element"></div>
<script type="text/javascript">
  (function($){
    $(document).ready(function(){
      var htmlmap = $("#element").htmlimagemap({
        imageUrl: "http://farm8.staticflickr.com/7259/6956772778_2fa755a228.jpg",
        areas: [{
    				href:"",
    				coords:[208,221,208,202,198,199,201,191,218,176,229,155,221,132,196,117,169,131,157,158,163,172,177,164,173,180,190,185,192,199,187,201,185,222]
    			}],
        onMove: function(area){
        },
        onUpdateArea: function(area){
        }
      });
    });
  })(jQuery);
</script>
```

### OPTIONS

```javascript
$("#elem").htmlimagemap({
  //REQUIRED
  imageUrl: "", 
  //OPTIONAL
  areas: [{
    href: "http://www.example.com",
    coords: [208,221,208,202,198,199]
  },{
    href: "http://www.example2.com",
    coords: [176,229,155,221,132,196]
  }], 
  label: "Demo2",
  labelFont: "14px Arial",
  labelColor: "#ffffff",
	activeColor: '#ff9911',
  inactiveColor: "#323232",
	fillOpacity: "0.3",
	lineWidth: 2,
  handleColor: "#cccccc",
  mobile: false,

  //OPTIONAL EVENT HANDLER
  onMove: function(area){}, 
  //OPTIONAL EVENT HANDLER
  onUpdateArea: function(area){} 
});
```

### EVENTS

###### onMove
```javascript
onMove: function(area){}
```
Fires every moment you drag a point on the canvas


###### onUpdateArea
```javascript
onUpdateArea: function(area){}
```
Fires every:

| Event       | Description                                    |
|-------------|------------------------------------------------|
| stopDrag    | The mouse stops dragging a point in the canvas |
| rightClick  | A right-click removes a point in the area map  |
| mousedown   | A mousedown event occurs on the canvas         |
| resetArea   | An area is reset                               |


### API

|                 | get | set | remove | reset |
|-----------------|-----|-----|--------|-------|
| all             |     |     |   x    |       |
| areas           |  x  |  x  |        |       |
| area            |  x  |  x  |   x    |   x   |
| activeArea      |  x  |  x  |   x    |   x   |
| activeAreaIndex |  x  |  x  |        |       |
| imageUrl        |  x  |  x  |        |       |

###### removeAll()
```javascript
$("#elem").htmlimagemap("removeAll");
```

###### getAreas()
```javascript
var areas = $("#elem").htmlimagemap("getAreas");
```

###### setAreas(areas)
```javascript
$("#elem").htmlimagemap("setAreas",areas);
```

###### getArea(i)
```javascript
var area = $("#elem").htmlimagemap("getArea",i);
```

###### setArea(i,area)
```javascript
$("#elem").htmlimagemap("setArea",i,area);
```

###### removeArea(i)
```javascript
$("#elem").htmlimagemap("removeArea",i);
```

###### resetArea(i)
```javascript
$("#elem").htmlimagemap("resetArea",i);
```

###### getActiveArea()
```javascript
var area = $("#elem").htmlimagemap("getActiveArea");
```

###### setActiveArea(area)
```javascript
$("#elem").htmlimagemap("setActiveArea",area);
```

###### resetActiveArea()
```javascript
$("#elem").htmlimagemap("resetActiveArea");
```

###### removeActiveArea()
```javascript
$("#elem").htmlimagemap("removeActiveArea");
```

###### getActiveAreaIndex()
```javascript
var i = $("#elem").htmlimagemap("getActiveAreaIndex");
```

###### setActiveAreaIndex(i)
```javascript
$("#elem").htmlimagemap("setActiveAreaIndex",i);
```

###### getImageUrl()
```javascript
var imgurl = $("#elem").htmlimagemap("getImageUrl");
```

###### setImageUrl(url)
```javascript
$("#elem").htmlimagemap("setImageUrl",url);
```

_You may want to use a document load or ready event to make sure your elements are already added to the DOM before you invoke the plugin._

### SUPPORT

Supports IE6 and later if you include the excanvas polyfill before the canvasAreaDraw script.

```html
<!--[if IE]><script type="text/javascript" src="excanvas.js"></script><![endif]-->
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<script type="text/javascript" src="//code.jquery.com/ui/1.11.1/jquery-ui.js"></script>
<script type="text/javascript" src="jquery.canvasAreaDraw.js"></script>
```

