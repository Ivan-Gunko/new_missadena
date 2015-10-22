/* jshint devel:true */

/* 
Структура слайдера:
<div> --контейнер с классом/ид
    <div> --обертка окна показа слайдов. Если ее нет ширирна считается от контейнера
        <ul class="slider__wrapper"> --простенький список
            <li> --любое содержимое
        </ul>
    </div>
    .nav nav--prev --навигация
    .nav nav--next
    .slider__input --счетчик слайдов
</div>
 */


'use strict';

if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function ($, window, document, undefined) {

    var Slider = {
        init: function (options, elem) { 

            var self = this;
            var swither, wrapper, cnt, tooltip;

            self.maxScrollPosition = 0;
            self.elem = elem;
            self.options = $.extend({}, $.fn.sliderShop.options, options);

            // console.log(this.options.tooltip);

            this.tooltip = $(this.elem).find('.' + this.options.tooltip);
            this.wrapper = $(this.elem).find('.' + this.options.wrapper);
            this.swither = this.wrapper.children().addClass('swither__item'); 
            this.cnt = this.wrapper.find('.swither__item').length;
            this.countBoxs = $(this.elem).find('.' + this.options.countBox);
            this.originSize = parseFloat($(self.elem).css('max-width'));
            this.deltaHeight = $(elem).outerHeight(true) - this.wrapper.height();
            this.originHeight = $(elem).outerHeight(true);
            // this.caseLimit = this.options.caseLimit;

            // console.log(this.tooltip);

            self.calcConst();

            if(this.options.wait) {
                   $(window).load(function () {
                    self.calcConst();
                    // console.log('load');
                }); 
            }

            

            this.swither.first().addClass('swither__item--edge');

            $(this.elem).find('.nav').on('click', function (e) {
                e.preventDefault();

                var $targetItem = $(elem).find('.swither__item--edge');

                if( $(this).hasClass('nav--prev') && !$targetItem.prev().length ) return;


                $(this).hasClass('nav--prev') 
                    ? self.toGalleryItem($targetItem.prev())
                    : self.toGalleryItem($targetItem.next());
            });

            if (this.options.animBox) this.prepareTooltip();
            
            if (this.options.response) {
                this.response();
                $('body').trigger('resize');
            }

            if (this.options.touch) this.initTouch();

            if (this.options.countSelect) {
                this.countBoxs.on('click', function () {
                    var ind = $(this).prevAll().length,
                        list = $(elem).find('.swither__item').removeClass('swither__item--edge'),
                        $targetItem = $(list[ind]).addClass('swither__item--edge');

                        // self.tooltip.removeClass('active').fadeOut(400).delay(400);

                        // $(self.tooltip[ind]).addClass('active').fadeIn(400);

                        // console.log(self.tooltip);

                   self.toGalleryItem($targetItem);
                })
            }

            if (this.options.timer) {
                var timer;

                $(this.elem).on({

                    mouseenter: function () {
                        clearInterval(timer);
                    },

                    mouseleave: function () {
                        timer = setInterval(function () {

                        var $targetItem = $(elem).find('.swither__item--edge');
                        
                            self.toGalleryItem($targetItem.next());
                        },self.options.timer);
                    }
                });

                $(this.elem).trigger('mouseleave');
            }
        },

        calcConst: function () {
            var self = this,
                totalWidth = 0,
                section = $(this.elem).outerWidth() - 40,
                space = this.wrapper.parent().width() - this.swither.outerWidth(true)*this.options.caseLimit,
                elspace = (this.options.spaceSection === 'auto') 
                                                ? space / (this.options.caseLimit * 2) 
                                                : this.options.spaceSection;

                elspace = ( space < 0 ) ? 0 : elspace;

                this.swither
                    .css({
                        'margin-left': elspace,
                        'margin-right': elspace
                    })
                    .each(function() {
                        totalWidth = totalWidth + $(this).outerWidth(true);
                    });

            if (this.options.count == 1) {
                $(this.elem).find('.slider__input').text('1 / ' + this.swither.length)
            }

            self.maxScrollPosition = totalWidth - this.swither.outerWidth(true) * this.options.caseLimit;

            this.wrapper.width(totalWidth + 20);

            
        },

        response: function () {
            var self = this;

            $(window).on('resize', function (){

                var newSize = $(self.elem).outerWidth(true),
                    originSize = parseFloat($(self.elem).css('max-width')),
                    windowWidth = ($(window).width() > 1400) ? 1400 : $(window).width(),
                    windowHeight = ($(window).height() - 70 < 400 ) ? 400 : $(window).height();

                    // console.log('windowHeight' + windowHeight);

                windowHeight = (windowHeight > 700) ? 700 : windowHeight;

                if (self.options.response == 'height') {
                    if (originSize > windowWidth) {

                        $(self.elem).height(windowHeight + self.deltaHeight);

                        self.swither.find('.slider__img').height(windowHeight);

                        // $(self.elem).width(windowWidth);
                        self.swither.width(windowWidth);

                        self.swither.find('.slider__img')
                            .css({
                                'margin-left': (windowWidth - windowHeight * 1.75)/2,
                                'margin-right': (windowWidth - windowHeight * 1.75)/2
                            });
                    }
                } else {
                    self.swither.width(
                            (newSize > originSize) 
                                ? originSize / self.options.caseLimit 
                                : newSize / self.options.caseLimit);

                    $(window).load(function(){
                        $(self.elem).height(self.swither.height() + self.deltaHeight);
                    });

                        $(self.elem).height(self.swither.height() + self.deltaHeight);

                    
                }

                self.calcConst();

                var newPosition = $(self.elem).find('.swither__item--edge').position().left;

                self.wrapper.css('left', - newPosition);

            });
        },

        initTouch: function () {
            var self = this;

            this.touch = {
                start: {x: 0, y: 0},

                end: {x: 0, y: 0},

                onTouchStart: function (e) {
                     self.touch.start.x = e.originalEvent.changedTouches[0].pageX;
                },

                onTouchMove: function (e) {
                    var orig = e.originalEvent,
                        xMovement = Math.abs(orig.changedTouches[0].pageX - self.touch.start.x),
                        yMovement = Math.abs(orig.changedTouches[0].pageY - self.touch.start.y);

                    if((xMovement * 3) > yMovement){ e.preventDefault() }
                },

                onTouchEnd: function (e) {
                    self.touch.end.x = e.originalEvent.changedTouches[0].pageX;
                    self.distance = self.touch.end.x - self.touch.start.x;

                    if ( Math.abs(self.distance) > 50) {
                        var $targetItem = $(self.elem).find('.swither__item--edge');

                        (self.distance > 0)
                            ? self.toGalleryItem($targetItem.prev())
                            : self.toGalleryItem($targetItem.next());
                    }
                }
            }

            $(this.elem).on('touchstart', self.touch.onTouchStart)
                        .on('touchmove', self.touch.onTouchMove)
                        .on('touchend', this.touch.onTouchEnd);

        },

        prepareTooltip: function () {
            var self = this,
                animBoxs =  $(this.elem).find('.' + this.options.animBox);

                animBoxs.each(function(index, el) {
                    this.x = $(this).data('x');
                    this.y = $(this).data('y');
                    this.time = $(this).data('time');

                    var me = this;

                    setTimeout(function () {
                        $(me).fadeIn(500);
                    }, this.time)
                });


        },

        animBox: function ($targetItem) {
            if (this.options.animBox) {

                var anim = $($targetItem).find('.' + this.options.animBox).hide();

                anim.each(function(index, el) {

                    this.x = $(this).data('x');
                    this.y = $(this).data('y');
                    this.time = $(this).data('time');

                    $(this).css({
                        left: this.x + '%',
                        top: this.y + '%'
                    });

                    var me = this;

                    setTimeout(function () {
                        $(me).fadeIn(700);
                    }, this.time)
                });
            }
            return
        },

        toGalleryItem:  function ($targetItem, callback) {
            var self = this;

            if(!callback) {callback = function () {};}

            if (!self.wrapper.find('.swither__item--edge')) {
                console.log('error!');
                return;
            }

            if($targetItem.length) {

                var newPosition = $targetItem.position().left;

                if(newPosition <= self.maxScrollPosition+20) {

                    $targetItem.addClass('swither__item--edge');
                    $targetItem.siblings().removeClass('swither__item--edge');

                    if (this.options.countBox && this.countBoxs[$targetItem.prevAll().length]) {

                        this.countBoxs.removeClass('active');
                       

                        $(this.countBoxs[$targetItem.prevAll().length]).addClass('active');

                        self.tooltip.removeClass('active').fadeOut(400).delay(400);

                        $(self.tooltip[$targetItem.prevAll().length]).addClass('active').fadeIn(400);
                    }

                    if (this.options.count == 1) {
                        $(this.elem).find('.slider__input')
                            .text($targetItem.prevAll().length + this.options.caseLimit + ' / ' + this.swither.length)
                    }

                    switch (this.options.animation) {
                        case 'slide':
                            this.wrapper.animate({'left' : - newPosition},300, function() {
                                 callback();
                            });

                            self.animBox($targetItem);
                            break;

                        case 'hide-show':
                            this.wrapper.fadeTo(300, 0, function() {

                                $(this).css('left', - newPosition);
                                $(this).animate({opacity : 1}, 300);

                                self.animBox($targetItem);
                            })
                            break; 
                    } 
                } else if(this.options.repeat) {
                    if (this.options.countBox && this.options.observe) {
                            this.countBoxs.removeClass('active');

                            $(this.countBoxs[0]).addClass('active');

                            self.tooltip.removeClass('active').fadeOut(400).delay(400);

                            $(self.tooltip[0]).addClass('active').fadeIn(400);
                        }
                    if(!this.swither) {return}

                        var tar = $(this.elem).find('.swither__item--edge'),
                            first = $(self.elem).find('.swither__item:first').clone();


                         // self.swither
                                // .children()
                         //        .removeClass('swither__item--edge')
                        self.wrapper.append(first);

                        self.calcConst();

                         if (this.options.countBox && this.options.observe) {
                            this.countBoxs.removeClass('active');

                            $(this.countBoxs[0]).addClass('active');

                            self.tooltip.removeClass('active').fadeOut(400).delay(400);

                            $(self.tooltip[0]).addClass('active').fadeIn(400);
                        }


                                // .addClass('swither__item--edge');
                        // self.toGalleryItem(tar.next())
                }

            } else if(this.options.repeat) {
                if (this.options.countBox && this.options.observe) {
                            this.countBoxs.removeClass('active');
                            // console.log($(this.countBoxs[0]).addClass('active'));
                            $(this.countBoxs[0]).addClass('active');

                            self.tooltip.removeClass('active').fadeOut(400).delay(400);

                            $(self.tooltip[0]).addClass('active').fadeIn(400);
                        }
                if(!this.swither) {return}

                var residue = this.swither
                                    .clone()
                                    .appendTo(this.wrapper)
                                    .addClass('cloned')
                                    .removeClass('swither__item--edge');

                this.cnt = this.wrapper.find('.swither__item').length;
                this.swither = this.wrapper.children();

                self.calcConst();

                var tar = $(this.elem).find('.swither__item--edge');

                self.toGalleryItem(tar.next(), function() {

                    var animCss = self.wrapper.css('transition');

                    self.wrapper.find('.swither__item:not(.cloned)').remove();

                    self.wrapper.find('.cloned').removeClass('cloned');

                    self.wrapper
                        .css('left', 0)
                        .children()
                        .first()
                        .addClass('swither__item--edge');

                    self.swither = self.wrapper.children();
                    return;
                })
               
            }

        } 
    };  

    $.fn.sliderShop = function (options) {
        return this.each(function() {
            
            var slider = Object.create( Slider );
            slider.init( options, this );
        });

    };

    $.fn.sliderShop.options = {
        caseLimit: 4, //кол-во товаров в витрине
        //caseMinLimit: 1, // минимальное кол-во при response: true
        spaceSection: 'auto', //расстояние между секциями
        animation: 'slide', //тип анимации
        count: false, // счетчик слайдов
        countBox: false, //селектор списка
        countSelect: false, //выбор по индикатору
        timer: false, //автопереключение
        repeat: false, //показ слайдов по кругу
        animBox: null, // всплывающие блоки-подсказки - (селектор)
        response: false, //резина, адаптив
        touch: true, //тач-события
        wrapper: 'slider__wrapper', //селектор обетрки для двойного слайдера
        observe: true,
        tooltip: false,
        wait: false
    };

})( jQuery, window, document );


