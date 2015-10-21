var SelectToList = {
        init: function (options, elem) {

            var optGroup, dropList, main, scroll, separator, wrap,
                self = this;

            self.elem = elem;
            self.options = $.extend({}, $.fn.selectToList.options, options);
            self.optGroup = $(self.elem).find('select option');
            self.dropList = $(self.elem).find('.filter__drop');
            self.button = $(self.elem).find('button[type="submit"]');

            if(self.options.button == true) {self.button[0].disabled=true};

            if (self.options.title) {
                self.main = $(self.elem).find('.filter-label');
            } else {
                self.main = $(self.elem)
            }

            self.prepareList();

            self.main.on('click', function (e) {
                self.dropped();
            })
        },

        prepareList: function () {
            var self = this,
                ul, separator, isChoise;

            if(this.options.selection === "multi") {

                this.wrapper = $('<div/>').prependTo(this.dropList).addClass('filter__wrap');

                ul = $('<ul/>').prependTo(this.wrapper);

                this.optGroup.each(function(index, el) {
                    ul.append('<li><input type="checkbox" name="' 
                        + $(this).attr('title') + index + '" id="' 
                        + $(this).attr('title') + index + '"><label for="' 
                        + $(this).attr('title') + index + '">' 
                        + $(this).html() + '</label></li>');
                });

                if(this.options.choice == true) {
                    separator = $('<div/>').addClass('separator').prependTo(this.wrapper),
                    isChoise = $('<ul/>').prependTo(this.wrapper)
                }


                 $(this.elem).find('input[type="checkbox"] + label').on('click', function () {
                    var inText = '',
                        fThis = this;

                    setTimeout(function () {
                        var check = $(self.elem).find('input[type="checkbox"]:checked + label').each(function() {

                        inText += $(this).text() + ' ';

                        });

                        if(self.options.button == true){
                            inText.length ? self.button[0].disabled=false : self.button[0].disabled=true;
                        }
                       

                        if(inText.length > 12) { inText = ' ' + check.length } //кол-во символов в строке

                        $(self.main).find('span').html(inText);

                        if(self.options.choice == true) { 

                            $(fThis).prev('input[type="checkbox"]').prop("checked")
                                   ? isChoise.append($(fThis).parent('li'))
                                   : ul.append($(fThis).parent('li'))
                            }

                    },200)
                })

            } else if(this.options.selection === "single") {
                this.wrapper = $('<div/>').prependTo(this.dropList).addClass('filter__wrap');

                ul = $('<ul/>').prependTo(this.wrapper);
                this.optGroup.each(function(index, el) {
                    ul.append('<li><input type="radio" name="' 
                        + $(this).attr('title') + '" id="' 
                        + $(this).attr('title') + index + '" value="' 
                        + index + '"><label for="' 
                        + $(this).attr('title') + index + '">' 
                        + $(this).html() + '</label></li>');
                });

                $(this.elem).find('input[type="radio"] + label').on('click', function () {

                   $(self.main).html($(this).text());
                })

            }
            
            this.dropList.innerWidth( $(this.main).innerWidth() );

            if(this.options.scroll && this.dropList.show().height() > this.options.maxHeight) {

                this.wrapper
                    .css('min-height', this.options.maxHeight - 50)
                        .customScrollbar({
                            skin : 'modern-skin',
                            updateOnWindowResize : true,
                            vScroll: true
                        });
            };

            this.dropList.hide();

        },

        dropped: function () {
            if (!$(this.elem).hasClass('open')) {
                $(this.elem).addClass('open');

               if (this.options.closed === true) {
                    this.dropList.slideDown(300).close({
                       allow: true,
                       link: this.elem,
                       class: 'open',
                       elements: 'filter__drop'
                   });
                }

                if (this.options.closed === 'forse') {
                    this.dropList.slideDown(300).close({
                       allow: true,
                       link: this.elem,
                       class: 'open',
                       elements: 'filter__drop',
                       forced: true
                   });
                }
            }
        }
    }

$.fn.selectToList = function (options) {
    return this.each(function() {

        var selectList = Object.create( SelectToList );
        selectList.init( options, this );
    });

};

$.fn.selectToList.options = {
    title: false,
    selection : "multi", //список "multi" -чекбоксы, "single" - стандартный список на скрытых радиокнопках
    closed: true, //закрытие списка true - вкл, false - выкл, forse - закрытие при любом клике
    scroll : true,
    choice : false, //перемещение ввыбранных чекбоксов наверх
    button : false, 
    maxHeight : 350 // мкаксимальная высота выпадающего списка
};




