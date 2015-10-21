'use strict';

if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function ($, window, document, undefined) {

// ========================

$.fn.tab = function (h,a,d) {
	var hidden = h,
		anim = a,
		destroy = d;

	this.each(function() {

		var btn = $(this).find('a'),
			self = this;

		if (destroy) {
			btn.off();
			return this
		}

		btn.on('click', function( e ) {
			e.preventDefault();

			if($(this).parent().hasClass('active')) return;

			btn.parent().removeClass('active')
					btn.each(function() {
						$('body').find('.' + $(this).data('tab')).fadeOut(anim);
					});

			$(this).parent().addClass('active');

			if (hidden) {
				$(document).trigger('close');
				$('body').find('.' + $(this).data('tab')).fadeIn(anim).close({
					allow: true,
				    link: this,
				});
			} else {
				$('body').find('.' + $(this).data('tab')).fadeIn(anim);
			}
		});
	});

	return this
};

$.fn.close = function (options) {
    return this.each(function() {
    	var self = this,
    		name = 'close' + Math.random() * (100 - 1) + 1;
        var closed = Object.create( Close );

        closed.init( options, this );
    });
};

$.fn.close.options = {
    allow : false, //снять все обработчики перед стартом.
    link: this, // элемент, с которого нужно удалить класс
    class: 'active', // имя класса, который нужно удалить 
    elements: false, // закрыть все блоки с данным классом
    forced: false, //закрыть при любом клике
};

var Close = {
	// следим за переданными элементами, в зависимости от опций закрываем при клике на пустом месте
	init: function (options, elem) {
		var self = this,
			firstClick = true,
			name = Math.random() * (100 - 1) + 1;

            self.elem = elem;
            self.options = $.extend({}, $.fn.close.options, options);

		if (this.options.allow) $(document).off('click');

		if (self.options.elements) {
			var el1 = $('.' + self.options.elements).not($(self.elem)),
				el2 = $('.' + self.options.elements).not($(self.elem)).parent();

				self.close(el1, el2)
		}

		$(document).on('click.name', function (event) {
			event.stopPropagation()

			if(!firstClick){

				if (self.options.forced  || $(event.target).closest(self.elem).length == 0 ) {

					self.close(self.elem, self.options.link);		
					$(document).off('click.name');
				}

			}

			firstClick = false;
		});

		$(document).on('close', function() {
			self.close(self.elem, self.options.link);
			$(document).off('click.name');
		})
	},

	close: function (el1, el2) {
		$(el1).hide();

		$(el2).removeClass(this.options.class);
	}
};

$.fn.selectAll = function (dest) {
	var destroy = dest;

	this.each(function() {

		var btn = $(this).find('.select--all'),
			$this = $(this);

		if (destroy) {
			btn.off();
			return 
		}

		btn.on('click', function( e ) {
			e.preventDefault();

			var check = btn.toggleClass('checked').hasClass('checked');

			$this.find('input[type="checkbox"]').each(function(index, el) {
				 this.checked = check;
			});
		});
	});

	return this
}

})( jQuery, window, document );
