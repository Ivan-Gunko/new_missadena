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
            var swither, wrapper, cnt;

            self.maxScrollPosition = 0;
            self.elem = elem;

            self.options = $.extend({}, $.fn.sliderShop.options, options);

            this.wrapper = $(this.elem).find('.slider__wrapper');
            this.swither = this.wrapper.children().addClass('swither__item'); 
            this.cnt = this.wrapper.find('.swither__item').length;
            this.countBoxs = $(this.elem).find('.' + this.options.countBox);

            self.calcConst();

            $(this.elem).find('.nav').on('click', function (e) {
                e.preventDefault();

                var $targetItem = $(elem).find('.swither__item--edge');

                $(this).hasClass('nav--prev') 
                    ? self.toGalleryItem($targetItem.prev())
                    : self.toGalleryItem($targetItem.next());
            });

            if (this.options.animBox) this.prepareTooltip();
            if (this.options.response) this.response();

            if (this.options.countSelect) {
                this.countBoxs.on('click', function () {
                    var ind = $(this).prevAll().length,
                        list = $(elem).find('.swither__item').removeClass('swither__item--edge'),
                        $targetItem = $(list[ind]).addClass('swither__item--edge');

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
                elspace =(this.options.spaceSection === 'auto') 
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

            this.swither.first().addClass('swither__item--edge');
        },

        // response: function () {
        //     var self = this;

        //     $(window).on('resize', function (){
        //         self.calcConst();
        //     }
        // },

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
                        left: this.x,
                        top: this.y
                    });

                    var me = this;

                    setTimeout(function () {
                        $(me).fadeIn(500);
                    }, this.time)
                });
            }
            return
        },

        toGalleryItem:  function ($targetItem) {
            var self = this;

            if($targetItem.length) {

                var newPosition = $targetItem.position().left;

                if(newPosition <= self.maxScrollPosition+20) {

                    $targetItem.addClass('swither__item--edge');
                    $targetItem.siblings().removeClass('swither__item--edge');

                    if (this.options.countBox) {
                        this.countBoxs.removeClass('active');

                        $(this.countBoxs[$targetItem.prevAll().length]).addClass('active');
                    }

                    if (this.options.count == 1) {
                        $(this.elem).find('.slider__input')
                            .text($targetItem.prevAll().length + this.options.caseLimit + ' / ' + this.swither.length)
                    }

                    switch (this.options.animation) {

                        case 'slide':
                            this.wrapper.animate({'left' : - newPosition});
                            break;

                        case 'hide-show':
                            this.wrapper.fadeTo(300, 0, function() {

                                $(this).css('left', - newPosition);
                                $(this).animate({opacity : 1}, 300);

                                self.animBox($targetItem);
                            })
                            break; 
                    }

                    
                }
                else if(this.options.repeat) {
                    if(!this.swither) {return}
                
                    var first = this.swither.removeClass('swither__item--edge').first().addClass('swither__item--edge')
                    self.toGalleryItem(first)
               
                }

            } else if(this.options.repeat) {
                if(!this.swither) {return}
                
                var first = this.swither.removeClass('swither__item--edge').first().addClass('swither__item--edge')
                self.toGalleryItem(first)
               
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
        spaceSection: 'auto', //расстояние между секциями
        animation: 'slide', //тип анимации
        count: false, // счетчик слайдов
        countBox: false, //селектор списка
        countSelect: false, //выбор по индикатору
        timer: false, //автопереключение
        repeat: false, //показ слайдов по кругу
        animBox: null, // всплывающие блоки - $(селектор)
        response: false
    };

})( jQuery, window, document );

