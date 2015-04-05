// jQuery Popup plugin
// ---------------------
//
// A responsive popup
//
// Author: Tony Coop
// Website: http://thewholeworldwindow.co.uk
// Repo: http://github.com/tonec/tooltip

;(function ( $ ) {
	'use strict';

	$.fn.popup = function ( options ) {

		var methods = {
			show : function( ) {
				toggleOn( $( this ) );
			},
			hide : function( ) {
				toggleOff( $( this ) );
			}
		};

		if ( methods[ options] ) {
			return methods[ options ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}

		// Default options
		$.fn.popup.options = {
			actionDefault : 'hover',
			actionTouch : 'click',
			contentSrc : 'text', // text, html, title, alt or attr
			headingAttrName : 'data-heading',
			contentAttrName : 'data-content',
			containerClass : 'popup-container',
			targetClass : 'popup-target',
			contentClass : 'popup',
			replacetarget: false,
			popupTarget : '<span class="popup-target">?</span>',
			tpl : '<span><%=content%></span>',
			offsetX : 0,
			offsetY : 0,
			overlap : 0,
			preferredPosition : 'top-middle',
			width: 'auto',
			responsiveDefinition: false
		};

		// Merge options
		options = $.extend( {}, $.fn.popup.options, options );

		var popupIndex = 0,
			contentClass = options.contentClass,
			targetClassSelector = options.targetClass.replace( / /g, '.' ),
			contentClassSelector = contentClass.replace( / /g, '.' ),
			containerClass = options.containerClass,
			action;

		window.popup = window.popup || {};
		window.popup.util = window.popup.util || {};
		window.popup.indexCache = window.popup.indexCache || [];

		if ( options.actionDefault === 'none' ) {
			action = 'none';
		} else if ( options.actionDefault === 'focus' ) {
			action = 'focus';
		} else if ( isTouch() ) {
			action = options.actionTouch;
		} else {
			action = options.actionDefault;
		}

		$( this ).each(function () {

			// Handle the caching of the popup number.
			do {
				popupIndex++;
			} while ( popupIndex <= window.popup.indexCache );

			window.popup.indexCache = popupIndex;

			var popupTarget = $( options.popupTarget ),
				outerTmpl = '',
				content = {},
				popupFragment = '',
				CSSPositioning;

			if ( elementOrParentIsFixed( this ) ) {
				CSSPositioning = 'fixed';
			} else {
				CSSPositioning = 'absolute';
			}

			$( this ).addClass( targetClassSelector ).attr( 'data-pop', popupIndex );

			outerTmpl = '<div class="' + contentClass + '" id="pop-' + popupIndex + '" data-content-class="' + contentClass + '" data-position="' + options.preferredPosition + '" data-offsetX="' + options.offsetX + '" data-offsetY="' + options.offsetY + '" data-overlap="' + options.overlap + '" data-pop="' + popupIndex + '">' + options.tpl + '</div>';

			// Get popup contents
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
					content.heading = $( this ).attr( options.headingAttrName );
					content.content = $( this ).attr( options.contentAttrName );
					break;
				default:
					content.content = '';
					break;
			}

			// Generate popup markup using the supplied template
			popupFragment = tmpl( outerTmpl, content );

			// Hide popup initially
			popupFragment = $( popupFragment ).css({
				'display' : 'none',
				'position' : CSSPositioning,
				'z-index' : '1000'
			});

			popupFragment.css( 'width', options.width );

			// Insert popup
			if ( options.replaceTarget ) {
				$( this ).html( popupTarget );
			}

			$( this ).parent().addClass( 'has-' + containerClass );
			$( 'body' ).append( popupFragment );

			// Set hide/show event types based on the given options
			if ( action === 'hover' ) {

				$( this ).on( 'mouseenter', function( event ) {
					var el = $( event.delegateTarget );

					event.preventDefault();
					event.stopPropagation();

					clearTimeout( el.data( 'timeoutId' ) );

					toggleOn( el );
				});

				$( this ).on( 'mouseleave', function( event ) {
					var el = $( event.delegateTarget ),
						timeoutId;

					event.preventDefault();
					event.stopPropagation();

					timeoutId = setTimeout( function () {
						toggleOff( el );
					}, 150);

					el.data( 'timeoutId', timeoutId );
				});

				popupFragment.on( 'mouseenter', function( event ) {
					var el = $( '[data-pop=' + popupIndex + ']' );

					event.preventDefault();
					event.stopPropagation();

					clearTimeout( el.data( 'timeoutId' ) );

					toggleOn( el );
				});

				popupFragment.on( 'mouseleave', function( event ) {
					var el = $( '[data-pop=' + popupIndex + ']' );

					event.preventDefault();
					event.stopPropagation();

					timeoutId = setTimeout( function () {
						toggleOff( el );
					}, 150);

					el.data( 'timeoutId', timeoutId );
				});
			}

			if ( action === 'click' ) {

				// Standard click event
				$( this ).on( action, toggleSwitch );

			}

			if ( action === 'focus' ) {

				// Check if tab key is being used and use focus event for accessibilty
				$( this ).focusin( function( event ) {
					var el = $( e.delegateTarget );

					event.preventDefault();
					event.stopPropagation();
					toggleOn( el );
				});

				$( this ).focusout( function( event ) {
					var el = $( e.delegateTarget );

					e.preventDefault();
					e.stopPropagation();
					toggleOff( el );
				});

			}

			if ( action === 'none' ) {
				popupFragment.on( 'click', function( event ) {
					var tgt = $( event.delegateTarget );
					toggleOff( tgt );
				});
			}

			// Additional interactions that will close any open popup

			// Click anywhere on the page
			if ( action !== 'none') {
				$( 'html, body' ).on( 'click', closeAllOpen );
			}

			// Recalculate position on window resize
			$( window ).on( 'throttledresize', changePosition );

		});

		function toggleSwitch ( event ) {
			var	tgt = $( event.delegateTarget );

			event.preventDefault();
			event.stopPropagation();

			if ( !tgt.hasClass( 'popup-open' ) ) {
				toggleOn( tgt );
			} else {
				toggleOff( tgt );
			}
		}

		function toggleOn ( el ) {
			var	tgt = el,
				popupIndex = tgt.closest( '*[data-pop]' ).attr( 'data-pop' ),
				current = $( '#pop-' + popupIndex );

			closeAllOpen( el );

			if ( elementOrParentIsFixed( el ) ) {
				setPosition( tgt, current, 'fixed' );
			} else {
				setPosition( tgt, current, 'absolute' );
			}

			current.css( 'display', 'block' );
			tgt.addClass('popup-open');
		}

		function toggleOff ( el ) {
			var	tgt = el,
				popupIndex = tgt.closest( '*[data-pop]' ).attr( 'data-pop' ) ,
				current = $( '#pop-' + popupIndex );

			current.css( 'display', 'none' );
			tgt.removeClass( 'popup-open' );
		}

		function closeAllOpen ( el ) {

			if ( $( el.target ).parents( '.popup' ).length > 0 ) return;

			if ( !el ) {
				return;
			}

			$( '.' + targetClassSelector ).removeClass( 'popup-open' );

			$( '.' + contentClassSelector )
				.filter( ':visible' )
				.css( 'display', 'none' );
		}

		// Test for touch screen functionality
		function isTouch () {
			return !!( ( 'ontouchstart' in window ) || window.DocumentTouch && document instanceof DocumentTouch );
		}

		function elementOrParentIsFixed( el ) {
			var element = $( el ),
				checkElements = element.add( element.parents() ),
				isFixed = false;

			checkElements.each( function () {
				if ( $( this ).css( 'position' ) === 'fixed' ) {
					isFixed = true;
					return false;
				}
			});
			return isFixed;
		}

		function setPosition ( tgt, current, positioning ) {
			var posX = 0,
				posY = 0,
				scrollTop = $( window ).scrollTop(),
				windowWidth = $( window ).width(),
				windowHeight = $( window ).height(),
				contentClass = options.contentClass || current.attr( 'data-content-class' ),
				offsetX = options.offsetX || parseInt( current.attr( 'data-offsetX' ) ),
				offsetY = options.offsetY || parseInt( current.attr( 'data-offsetY' ) ),
				preferredPosition = options.preferredPosition || current.attr(   'data-position' ),
				overlap = options.overlap || current.attr(   'data-overlap' ),
				responsiveDefinition = options.responsiveDefinition,
				targetX,
				targetY;

			// Width and height of the target element
			var targetWidth = tgt.outerWidth(),
				targetHeight = tgt.outerHeight();

			// Width and height of the popup with content
			var contentWidth = current.outerWidth(),
				contentHeight = current.outerHeight();

			// X and Y position of the target element
			targetX = tgt.offset().left;
			targetY = tgt.offset().top;

			if ( positioning === 'fixed' ) {
				targetY = targetY - scrollTop;
			}

			window.popup.util.positionTopLeft = function () {
				posX = targetX - contentWidth + overlap - offsetX;
				posY = targetY - contentHeight - offsetY;
				current.removeClass().addClass( contentClass + ' pop-top-left' );
				tgt.parent().addClass( 'has-pop-top-left' );
			};

			window.popup.util.positionTopMiddle = function () {
				posX = targetX + targetWidth / 2 - contentWidth / 2 - offsetX;
				posY = targetY - contentHeight - offsetY;
				current.removeClass().addClass( contentClass + ' pop-top-middle' );
				tgt.parent().addClass( 'has-pop-top-middle' );
			};

			window.popup.util.positionTopRight = function () {
				posX = targetX + targetWidth - overlap + offsetX;
				posY = targetY - contentHeight - offsetY;
				current.removeClass().addClass( contentClass + ' pop-top-right' );
				tgt.parent().addClass( 'has-pop-top-right' );
			};

			window.popup.util.positionMiddleLeft = function () {
				posX = targetX - contentWidth - offsetX;
				posY = targetY - contentHeight / 2 + targetHeight / 2 - offsetY;
				current.removeClass().addClass( contentClass + ' pop-middle-left' );
				tgt.parent().addClass( 'has-pop-middle-left' );
			};

			window.popup.util.positionMiddleRight = function () {
				posX = targetX + targetWidth + offsetX;
				posY = targetY - contentHeight / 2 + targetHeight / 2 + offsetY;
				current.removeClass().addClass( contentClass + ' pop-middle-right' );
				tgt.parent().addClass( 'has-pop-middle-right' );
			};

			window.popup.util.positionBottomLeft = function () {

				posX = targetX - contentWidth + overlap - offsetX;
				posY = targetY + targetHeight + offsetY;
				current.removeClass().addClass( contentClass + ' pop-bottom-left' );
				tgt.parent().addClass( 'has-pop-bottom-left' );
			};

			window.popup.util.positionBottomMiddle = function () {
				posX = targetX + targetWidth / 2 - contentWidth / 2 + offsetX;
				posY = targetY + targetHeight + offsetY;
				current.removeClass().addClass( contentClass + ' pop-bottom-middle' );
				tgt.parent().addClass( 'has-pop-bottom-middle' );
			};

			window.popup.util.positionBottomRight = function () {
				posX = targetX + targetWidth - overlap + offsetX;
				posY = targetY + targetHeight + offsetX;
				current.removeClass().addClass( contentClass + ' pop-bottom-right' );
				tgt.parent().addClass( 'has-pop-bottom-right' );
			};

			window.popup.util.checkFitsTop = function () {
				if ( scrollTop > targetY - contentHeight - offsetY ) {
					return false;
				} else {
					return true;
				}
			};

			window.popup.util.checkFitsBottom = function () {
				if ( scrollTop + windowHeight < targetY + targetHeight + contentHeight + offsetY ) {
					return false;
				} else {
					return true;
				}
			};

			window.popup.util.checkFitsLeft = function () {
				if ( targetX - ( contentWidth / 2 ) < 0 ) {
					return false;
				} else {
					return true;
				}
			};

			window.popup.util.checkFitsRight = function () {
				if ( targetX + targetWidth + contentWidth + offsetX > windowWidth ) {
					return false;
				}  else {
					return true;
				}
			};

			// Manage popup position based on available space
			// Essentially, the operations are simple. Check whether there's enough
			// space for the popup in it's preferred position, if not, position it elsewhere.

			// Override preset resonsive positioning with a user defined definition
			if ( options.responsiveDefinition ) {
				preferredPosition = 'overridden';
				responsiveDefinition();
			}

			// These are some preset position schemes
			switch ( preferredPosition ) {

				case 'overridden' :
					break;

				case 'top-left' :
					if ( window.popup.util.checkFitsTop() ) {
						if ( window.popup.util.checkFitsLeft() ) {
							window.popup.util.positionTopLeft();
						} else {
							window.popup.util.positionTopMiddle();
						}
					} else {
						if ( window.popup.util.checkFitsLeft() ) {
							window.popup.util.positionBottomLeft();
						} else {
							window.popup.util.positionBottomMiddle();
						}

					}
					break;

				case 'top-middle' :
					if ( window.popup.util.checkFitsTop() ) {
						window.popup.util.positionTopMiddle();
					} else {
						window.popup.util.positionBottomMiddle();
					}
					break;

				case 'top-right' :
					if ( window.popup.util.checkFitsTop() ) {
						if ( window.popup.util.checkFitsRight() ) {
							window.popup.util.positionTopRight();
						} else {
							window.popup.util.positionTopMiddle();
						}
					} else {
						if ( window.popup.util.checkFitsRight() ) {
							window.popup.util.positionBottomRight();
						} else {
							window.popup.util.positionBottomMiddle();
						}
					}
					break;

				case 'middle-left' :
					if ( window.popup.util.checkFitsLeft() ) {
						window.popup.util.positionMiddleLeft();
					} else {
						if ( window.popup.util.checkFitsTop() ) {
							window.popup.util.positionTopMiddle();
						} else {
							window.popup.util.positionBottomMiddle();
						}
					}
					break;

				case 'middle-right' :
					if ( window.popup.util.checkFitsRight() ) {
						window.popup.util.positionMiddleRight();
					} else {
						if ( window.popup.util.checkFitsTop() ) {
							window.popup.util.positionTopMiddle();
						} else {
							window.popup.util.positionBottomMiddle();
						}
					}
					break;

				case 'bottom-left' :
					if ( window.popup.util.checkFitsBottom() ) {
						if ( window.popup.util.checkFitsLeft() ) {
							window.popup.util.positionBottomLeft();
						} else {
							window.popup.util.positionBottomMiddle();
						}
					} else {
						if ( window.popup.util.checkFitsLeft() ) {
							window.popup.util.positionTopLeft();
						} else {
							window.popup.util.positionTopMiddle();
						}
					}
					break;

				case 'bottom-middle' :
					if ( window.popup.util.checkFitsBottom() ) {
						window.popup.util.positionBottomMiddle();
					} else {
						window.popup.util.positionTopMiddle();
					}
					break;

				case 'bottom-right' :
					if ( window.popup.util.checkFitsBottom() ) {
						if ( window.popup.util.checkFitsRight() ) {
							window.popup.util.positionBottomRight();
						} else {
							window.popup.util.positionBottomMiddle();
						}
					} else {
						if ( window.popup.util.checkFitsRight() ) {
							window.popup.util.positionTopRight();
						} else {
							window.popup.util.positionTopMiddle();
						}
					}
					break;
			}

			current.css({
				'left' : posX,
				'top' : posY
			});

		}

		function changePosition () {
			var openPopups = $( '.popup-open' );

			openPopups.each( function() {
				var	tgt = $( this ),
					popupIndex = tgt.closest( '*[data-pop]' ).attr( 'data-pop' ),
					current = $( '#pop-' + popupIndex );

				setPosition( tgt, current );
			});
		}

	};
})( jQuery, window );