
(function ( $ ) {

	$.fn.tooltip = function ( options ) {

		// Default options
		$.fn.tooltip.options = {
			actionTouch : 'click',
			actionDesktop : 'hover',
			contentSrc : 'text', // text, html, title, alt or attr
			contentAttrName : 'data-content',
			ttContainerClass : 'tip',
			ttTargetClass : 'tip-target',
			ttClass : 'tip-content',
			replacetarget: false,
			tipTarget : '<span class="tt">?</span>',
			tpl : '<span><%=content%></span>',
			inheritedAttribute : false,
			offsetFromTarget : 20,
			tooltipOverlap : 0,
			preferredPosition : 'top-middle'
		};

		// Merge options
		options = $.extend( {}, $.fn.tooltip.options, options );

		var ttNum = 0,
			ttClass = options.ttClass,
			ttTargetClassSelector = options.ttTargetClass.replace( / /g, '.' ),
			ttClassSelector = ttClass.replace( / /g, '.' ),
			containerClasses = options.ttContainerClass,
			offsetAboveX = options.offsetAboveX,
			offsetAboveY = options.offsetAboveY,
			offsetBelowX = options.offsetBelowX,
			offsetBelowY = options.offsetBelowY,
			action;

		this.tooltipNumcache = this.tooltipNumcache || [];

		if ( isTouch() ) {
			action = options.actionTouch;
		} else {
			action = options.actionDesktop;
		}

		$( this ).each(function () {
			
			// Handle the caching of the tooltip number.
			do {
				ttNum++;
			} while ( ttNum <= this.tooltipNumcache );

			this.tooltipNumcache = ttNum;

			var tipTarget = $( options.tipTarget ),
				tpl = '',
				content = {},
				tt = '';

			$( this ).addClass( ttTargetClassSelector ).attr( 'data-ti', ttNum );
			
			tpl = '<div class="' + ttClass + '" id="tt-' + ttNum + '">' + options.tpl + '</div>';

			// Get tooltip contents
			switch ( options.contentSrc ) {
				case 'text':
					content.content = $( this ).text();
					break;
				case 'html':
					content.content = $( this ).html();
					break;
				case 'title':
					content.content = $( this ).attr( 'title' );
					$( this ).attr( 'title', '' );
					break;
				case 'alt':
					content.content = $( this ).attr( 'alt' );
					break;
				case 'attr':
					content.content = $( this ).attr( options.contentAttrName );
					break;
				default:
					content.content = $( this ).text();
			}

			// Generate tooltip markup using the supplied template
			tt = tmpl( tpl, content );

			// Hide tooltip initially
			tt = $( tt ).css({
				'display' : 'none',
				'position' : 'absolute',
				'z-index' : '1000'
			});

			// Insert tooltip. 
			$( this ).removeClass().addClass( containerClasses );
			
			if ( options.replaceTarget ) {
				$( this ).html( tipTarget );
			}

			$( this ).parent().addClass( 'has-frstip' );
			$( 'body' ).append( tt );
			
			// Set hide/show event types based on the given options
			if ( action === 'hover' ) {
				$( this ).mouseenter( toggleOn ).mouseleave( toggleOff );
			}

			if ( action === 'click' ) {
				$( this ).on( action, toggleSwitch );
			}

			// Additional interactions that will close any open tooltips

			// Click anywhere on the page
			$( 'html, body' ).on( 'click', closeAllOpen );
			// Resize window
			$( window ).on( 'throttledresize',  closeAllOpen );
		});

		function toggleSwitch ( e ) {
			var	tgt = $( e.target );

			if ( !tgt.hasClass('tt-open') ) {
				toggleOn( e );
			} else {
				toggleOff( e );
			}
		}

		function toggleOn ( e ) {
			var	tgt = $( e.target ),
				ttNum = tgt.closest( '*[data-ti]' ).attr( 'data-ti' ),
				currentTT = $( '#tt-' + ttNum );

			e.preventDefault();
			e.stopPropagation();

			closeAllOpen( e );
			setPosition( tgt, currentTT );
			currentTT.css( 'display', 'block' );
			tgt.addClass('tt-open');
		}

		function toggleOff ( e ) {
			var	tgt = $( e.target ),
				ttNum = tgt.closest( '*[data-ti]' ).attr( 'data-ti' ),
				currentTT = $( '#tt-' + ttNum );

			e.preventDefault();
			e.stopPropagation();

			setPosition( tgt, currentTT );
			currentTT.css('display', 'none');
			tgt.removeClass('tt-open');
		}

		function closeAllOpen ( e ) {

			if ( !$( e.target ) ) {
				return;
			}

			$('.' + ttClassSelector )
				.filter(':visible')
				.css('display', 'none')
				.parents('.frstip')
				.removeClass('tt-open');
		}

		// Test for touch screen functionality 
		function isTouch() {
			if ( ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch ) {
				return true;
			} else {
				return false;
			}
		}

		function setPosition ( tgt, currentTT, pos ) {
			var posX = 0,
				posY = 0,
				scrollTop = $( window ).scrollTop(),
				windowWidth = $( window ).width(),
				windowHeight = $( window ).height(),
				offsetFromTarget = options.offsetFromTarget,
				preferredPosition = pos || options.preferredPosition;

			// Width and height of the target element
			var targetWidth = tgt.width(),
				targetHeight = tgt.height();

				// console.log(targetWidth);
				// console.log(targetHeight);

			// X and Y position of the target element
			var targetX = tgt.offset().left,
				targetY = tgt.offset().top;

				// console.log(targetX);
				// console.log(targetY);

			// Width and height of the tooltip with content
			var contentWidth = currentTT.width(),
				contentHeight = currentTT.height();

				// console.log(contentWidth);
				// console.log(contentHeight);
			
			switch ( preferredPosition ) {
				case 'top-left' :
					if ( checkFitsTop() ) {
						positionTopLeft();
					} else {
						positionBottomLeft();
					}
					break;

				case 'top-middle' :
					if ( checkFitsTop() ) {
						positionTopMiddle();
					} else {
						positionBottomMiddle();
					}
					break;

				case 'top-right' :
					positionTopRight();
					break;

				case 'middle-left' :
					if ( checkFitsLeft() ) {
						positionMiddleLeft();
					} else {
						positionTopMiddle();
					}
					break;

				case 'middle-right' :
					if ( checkFitsRight() ) {
						positionMiddleRight();
					} else {
						positionTopMiddle();
					}
					break;

				case 'bottom-left' :
					positionBottomLeft();
					break;

				case 'bottom-middle' :
					if ( checkFitsBottom() ) {
						positionBottomMiddle();
					} else {
						positionTopMiddle();
					}
					break;

				case 'bottom-right' :
					positionBottomRight();
					break;
			}

			function positionTopLeft() {
				posX = targetX - contentWidth / 2;
				posY = targetY - contentHeight - offsetFromTarget;
				currentTT.addClass( 'top-left' );
			}

			function positionTopMiddle() {
				posX = targetX + targetWidth / 2 - contentWidth / 2;
				posY = targetY - contentHeight - offsetFromTarget;
				currentTT.addClass('top-middle');
			}

			function positionTopRight() {
				posX = targetX + targetWidth - contentWidth / 2;
				posY = targetY - contentHeight - offsetFromTarget;
				currentTT.addClass('top-right');
			}

			function positionMiddleLeft() {
				posX = targetX - contentWidth - offsetFromTarget;
				posY = targetY - contentHeight / 2 + targetHeight / 2;
				currentTT.addClass('middle-left');
			}

			function positionMiddleRight() {
				posX = targetX + targetWidth + offsetFromTarget;
				posY = targetY - contentHeight / 2 + targetHeight / 2;
				currentTT.addClass('middle-right');
			}

			function positionBottomLeft() {
				posX = targetX - contentWidth / 2;
				posY = targetY + targetHeight + offsetFromTarget;
				currentTT.addClass('bottom-left');
			}

			function positionBottomMiddle() {
				posX = targetX + targetWidth / 2 - contentWidth / 2;
				posY = targetY + targetHeight + offsetFromTarget;
				currentTT.addClass('bottom-middle');
			}

			function positionBottomRight() {
				posX = targetX + targetWidth - contentWidth / 2;
				posY = targetY + targetHeight + offsetFromTarget;
				currentTT.addClass('bottom-right');
			}

			function checkFitsTop() {
				if ( scrollTop > targetY - contentHeight - offsetFromTarget ) {
					return false;
				} else {
					return true;
				}
			}

			function checkFitsBottom() {
				if ( scrollTop + windowHeight < targetY + contentHeight + offsetFromTarget ) {
					return false;
				} else {
					return true;
				}
			}
			
			function checkFitsLeft() {
				if ( targetX - ( contentWidth / 2 ) < 0 ) {
					return false;
				} else {
					return true;
				}
			}

			function checkFitsRight() {
				if ( targetX + contentWidth + offsetFromTarget > windowWidth ) {
					return false;
				}  else {
					return true;
				}
			}

			currentTT.css({
				'left' : posX,
				'top' : posY
			});
		
		}
	};
})( jQuery );