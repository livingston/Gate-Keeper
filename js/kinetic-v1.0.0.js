/**
 * Kinetic JS JavaScript Library v1.0.0
 * http://www.kineticjs.com/
 * Copyright 2011, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Apr 16 2011
 *
 * Copyright (C) 2011 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Kinetic = {};

Kinetic.Stage = function(canvas, fps){

    var that = this;
    
    // Stage vars
    var context = canvas.getContext("2d");
    var updateStage = undefined;
    var drawStage = undefined;
    
    // Event vars
    var mousePos = null;
    var mouseDown = false;
    var mouseUp = false;
    var currentRegion = null;
    var regionCounter = 0;
    var lastRegionIndex = null;
    
    // Animation vars
    var t = 0;
    var timeInterval = 1000 / fps;
    var intervalId = null;
    var frame = 0;
    
    // Stage
    this.isMousedown = function(){
        return mouseDown;
    };
    this.isMouseup = function(){
        return mouseUp;
    };
    this.setDrawStage = function(func){
        drawStage = func;
        that.listen();
    };
    this.drawStage = function(){
        if (drawStage !== undefined) {
            that.clearCanvas();
            drawStage();
        }
    };
    this.setUpdateStage = function(func){
        updateStage = func;
    };
    this.getContext = function(){
        return context;
    };
    this.clearCanvas = function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    // Events
    this.listen = function(){
        // store current listeners
        var canvasOnmouseover = canvas.onmouseover;
        var canvasOnmouseout = canvas.onmouseout;
        var canvasOnmousemove = canvas.onmousemove;
        var canvasOnmousedown = canvas.onmousedown;
        var canvasOnmouseup = canvas.onmouseup;
        
        if (drawStage !== undefined) {
            drawStage();
        }
        
        canvas.onmouseover = function(e){
            if (!e) {
                e = window.event;
            }
            
            setMousePosition(e);
            if (typeof(canvasOnmouseover) == typeof(Function)) {
                canvasOnmouseover();
            }
        };
        canvas.onmouseout = function(){
            mousePos = null;
            if (typeof(canvasOnmouseout) == typeof(Function)) {
                canvasOnmouseout();
            }
        };
        canvas.onmousemove = function(e){
            if (!e) {
                e = window.event;
            }
            reset(e);
            
            if (typeof(canvasOnmousemove) == typeof(Function)) {
                canvasOnmousemove();
            }
        };
        canvas.onmousedown = function(e){
            if (!e) {
                e = window.event;
            }
            mouseDown = true;
            reset(e);
            
            if (typeof(canvasOnmousedown) == typeof(Function)) {
                canvasOnmousedown();
            }
        };
        canvas.onmouseup = function(e){
            if (!e) {
                e = window.event;
            }
            mouseUp = true;
            reset(e);
            
            if (typeof(canvasOnmouseup) == typeof(Function)) {
                canvasOnmouseup();
            }
        };
    };
    this.beginRegion = function(){
        currentRegion = {};
        regionCounter++;
    };
    // add region event listeners
    this.addRegionEventListener = function(type, func){
        if (type == "onmouseover") {
            currentRegion.onmouseover = func;
        }
        else if (type == "onmouseout") {
            currentRegion.onmouseout = func;
        }
        else if (type == "onmousemove") {
            currentRegion.onmousemove = func;
        }
        else if (type == "onmousedown") {
            currentRegion.onmousedown = func;
        }
        else if (type == "onmouseup") {
            currentRegion.onmouseup = func;
        }
    };
    this.closeRegion = function(){
        if (mousePos !== null && context.isPointInPath(mousePos.x, mousePos.y)) {
        
            // handle onmousemove
            // do this everytime
            if (currentRegion.onmousemove !== undefined) {
                currentRegion.onmousemove();
            }
            
            // handle onmouseover
            if (lastRegionIndex != regionCounter) {
                lastRegionIndex = regionCounter;
                
                if (currentRegion.onmouseover !== undefined) {
                    currentRegion.onmouseover();
                }
            }
            
            // handle onmousedown
            if (mouseDown && currentRegion.onmousedown !== undefined) {
                currentRegion.onmousedown();
                mouseDown = false;
            }
            
            // handle onmouseup
            if (mouseUp && currentRegion.onmouseup !== undefined) {
                currentRegion.onmouseup();
                mouseUp = false;
            }
            
        }
        else if (regionCounter == lastRegionIndex) {
            // handle mouseout condition
            lastRegionIndex = null;
            
            if (currentRegion.onmouseout !== undefined) {
                currentRegion.onmouseout();
            }
        }
        
        regionCounter++;
    };
    this.getMousePos = function(evt){
        return mousePos;
    };
    function setMousePosition(evt){
        var mouseX = evt.clientX - canvas.offsetLeft + window.pageXOffset;
        var mouseY = evt.clientY - canvas.offsetTop + window.pageYOffset;
        mousePos = new Kinetic.Position(mouseX, mouseY);
    }
    
    function reset(evt){
        setMousePosition(evt);
        regionCounter = 0;
        
        if (drawStage !== undefined) {
            that.clearCanvas();
            drawStage();
        }
        
        mouseDown = false;
        mouseUp = false;
    }
    
    // Animation
    this.getFrame = function(){
        return frame;
    };
    this.start = function(){
        if (drawStage !== undefined) {
            drawStage();
        }
        
        intervalId = setInterval(animationLoop, timeInterval);
    };
    this.stop = function(){
        clearInterval(intervalId);
    };
    this.getTimeInterval = function(){
        return timeInterval;
    };
    this.getTime = function(){
        return t;
    };
    function animationLoop(){
        frame++;
        t += timeInterval;
        that.clearCanvas();
        if (updateStage !== undefined) {
            updateStage();
        }
        if (drawStage !== undefined) {
            drawStage();
        }
    }
    
};
Kinetic.Position = function(x, y){
    this.x = x;
    this.y = y;
};
