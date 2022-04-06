var criticalerror = false
var criticalerror_reason = ""
var selectedposition = [1, 1]
var sendingRequest = 0
var audio = {
    select_tile: new Audio("./audio/selecttile.wav"),
    deselect_tile: new Audio("./audio/deselecttile.wav"),
    ready_for_tile: new Audio("./audio/newtile.wav"),
    place_tile: new Audio("./audio/placetile.wav"),
    select_color_1: new Audio("./audio/selectcolor1.wav"),
    select_color_2: new Audio("./audio/selectcolor2.wav")
}

var scalesize = 1

var target = $("#canvas")

function ScrollZoom(container,max_scale,factor){
    
    var size = {w:target.width(),h:target.height()}
    var pos = {x:0,y:0}
    var zoom_target = {x:0,y:0}
    var zoom_point = {x:0,y:0}
    var scale = 1
    target.css('transform-origin','0 0')
    target.on("mousewheel DOMMouseScroll",scrolled)

    function scrolled(e){
        var offset = container.offset()
        zoom_point.x = e.pageX - offset.left
        zoom_point.y = e.pageY - offset.top

        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        if (delta === undefined) {
          //we are on firefox
          delta = e.originalEvent.detail;
        }
        delta = Math.max(-1,Math.min(1,delta)) // cap the delta to [-1,1] for cross browser consistency

        // determine the point on where the slide is zoomed in
        zoom_target.x = (zoom_point.x - pos.x)/scale
        zoom_target.y = (zoom_point.y - pos.y)/scale

        // apply zoom
        scale += delta*factor * scale
        scale = Math.max(1,Math.min(max_scale,scale))

        // calculate x and y based on zoom
        pos.x = -zoom_target.x * scale + zoom_point.x 
        pos.y = -zoom_target.y * scale + zoom_point.y


        // Make sure the slide stays in its container area when zooming out
        if(pos.x>0)
            pos.x = 0
        if(pos.x+size.w*scale<size.w)
            pos.x = -size.w*(scale-1)
        if(pos.y>0)
            pos.y = 0
         if(pos.y+size.h*scale<size.h)
            pos.y = -size.h*(scale-1)

        update()
    }

    function update(){
        scalesize = scale
        target.css('transform','translate('+(pos.x)+'px,'+(pos.y)+'px) scale('+scale+','+scale+')')
    }
}

ScrollZoom($("#container"), 4, 0.1)

function SetupColorSelector() {
    axios.get('/api/get_colors').then((res) => {
        var json = res.data
        console.log(json)
        Object.keys(json).forEach((ColorHex) => {
            console.log(ColorHex)
            CreateColor(ColorHex, json[ColorHex])
        })
    }).catch(function (error) {
        console.log(error)
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            SetCriticalError("Axios Request Error\n" + "Please see console for errors")
        }
    })
}

function CreateColor(ColorHex, ColorName){
    var elcs = document.getElementById("colorselector")
    var newcolor = document.createElement("button")
    newcolor.style.backgroundColor = ColorHex
    newcolor.onclick = () => {
        ConfirmPlace(ColorHex, ColorName)
    }
    elcs.appendChild(newcolor)
}

function ConfirmPlace(ColorHex, ColorName) {
    setTimeout(() => {document.getElementById('canvas').src = '/api/get_image?' + new Date().getTime()}, 100);
    //if(confirm(`Do you really want to place a ${ColorName} pixel at ${selectedposition[0]}, ${selectedposition[1]}`))
    PlacePixel(selectedposition[0], selectedposition[1], ColorHex)
}

async function PlacePixel(X, Y, ColorHex) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    if(sendingRequest == 0){
        sendingRequest += 1;
        await axios.post('/api/set_pixel', `x=${X}&y=${Y}&color=${ColorHex}`, {headers})
        sendingRequest -= 1;
        audio.place_tile.play()
    }
    else {
        alert("Your sending requests too much!")
    }
}

function SetCriticalError(reason){
    console.log(reason)
    criticalerror = true
    criticalerror_reason = reason
    alert("Critical Error (Please refresh the page): \n" + reason)
}

window.onload = () => {
    SetupColorSelector()
}
$("#canvas").click(function (e) {
    var pX = e.pageX;
    var pY = e.pageY;
    var imagel = document.getElementById("canvas");
    var imagepixelx = (Math.floor((pX - imagel.getBoundingClientRect().x) / ((imagel.clientWidth * scalesize) / imagel.naturalWidth)) + 1)
    var imagepixely = (Math.floor((pY - imagel.getBoundingClientRect().y) / ((imagel.clientHeight * scalesize) / imagel.naturalHeight)) + 1)
    $("#pixels").html("X: " + imagepixelx + "; Y: " + imagepixely);
    selectedposition[0] = imagepixelx;
    selectedposition[1] = imagepixely; 
});

window.onresize((ev) => {
    SetCanvasInMiddle()
})

function SetCanvasInMiddle() {
    var canvas = document.getElementById("image")
    var left = (window.innerWidth / 2) - canvas.clientWidth 
    canvas.style.left = left
}
SetCanvasInMiddle()
