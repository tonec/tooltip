
(function ( $ ) {

	$.fn.tooltip = function ( options ) {

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
		$.fn.tooltip.options = {
			actionDefault : 'hover',
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
			offsetFromTarget : 12,
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

		window.tooltipNumcache = window.tooltipNumcache || [];

		if ( options.actionDefault === 'none' ) {
			action = 'none';
		} else if ( isTouch() ) {
			action = options.actionTouch;
		} else {
			action = options.actionDefault;
		}

		$( this ).each(function () {
			
			// Handle the caching of the tooltip number.
			do {
				ttNum++;
			} while ( ttNum <= window.tooltipNumcache );

			window.tooltipNumcache = ttNum;

			var tipTarget = $( options.tipTarget ),
				tpl = '',
				content = {},
				tt = '';

			$( this ).addClass( ttTargetClassSelector ).attr( 'data-ti', ttNum );
			
			tpl = '<div class="' + ttClass + '" id="tt-' + ttNum + '" data-ttclass="' + ttClass + '" data-position="' + options.preferredPosition + '" data-offset="' + options.offsetFromTarget + '" data-ti="' + ttNum + '">' + options.tpl + '</div>';

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
			$( this ).addClass( containerClasses );
			
			if ( options.replaceTarget ) {
				$( this ).html( tipTarget );
			}

			$( this ).parent().addClass( 'has-frstip' );
			$( 'body' ).append( tt );
			
			// Set hide/show event types based on the given options
			if ( action === 'hover' ) {
				$( this ).mouseenter( function( e ){
					var el = $( e.target );
					e.preventDefault();
					e.stopPropagation();
					toggleOn( el );
				}).mouseleave( function( e ){
					var el = $( e.target );
					e.preventDefault();
					e.stopPropagation();
					toggleOff( el );
				});
			}

			if ( action === 'click' ) {
				$( this ).on( action, toggleSwitch );
			}

			if ( action === 'none' ) {
				tt.on( 'click', function( e ) {
					var tgt = $( e.target ).parents( '.' + ttClass );
					toggleOff( tgt );
				});
			}

			// Additional interactions that will close any open tooltips

			if ( action !== 'none' ) {
				// Click anywhere on the page
				$( 'html, body' ).on( 'click', closeAllOpen );
				// Resize window
				$( window ).on( 'throttledresize',  closeAllOpen );
			}

		});

		function toggleSwitch ( e ) {
			var	tgt = $( e.target );

			if ( !tgt.hasClass('tt-open') ) {
				toggleOn( e );
			} else {
				toggleOff( e );
			}
		}

		function toggleOn ( el ) {
			var	tgt = el,
				ttNum = tgt.closest( '*[data-ti]' ).attr( 'data-ti' ),
				currentTT = $( '#tt-' + ttNum );

			console.log(currentTT)

			closeAllOpen( el );
			setPosition( tgt, currentTT );
			currentTT.css( 'display', 'block' );
			tgt.addClass('tt-open');
		}

		function toggleOff ( el ) {
			var	tgt = el,
				ttNum = tgt.closest( '*[data-ti]' ).attr( 'data-ti' ) ,
				currentTT = $( '#tt-' + ttNum );

			setPosition( tgt, currentTT );
			currentTT.css('display', 'none');
			tgt.removeClass('tt-open');
		}

		function closeAllOpen ( el ) {

			if ( !el ) {
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

		function setPosition ( tgt, currentTT ) {
			var posX = 0,
				posY = 0,
				scrollTop = $( window ).scrollTop(),
				windowWidth = $( window ).width(),
				windowHeight = $( window ).height(),
				ttClass = options.ttClass || currentTT.attr( 'data-ttclass' ),
				offsetFromTarget = options.offsetFromTarget || parseInt( currentTT.attr( 'data-offset' ) ),
				preferredPosition = options.preferredPosition || currentTT.attr(   'data-position' );

			// Width and height of the target element
			var targetWidth = tgt.outerWidth(),
				targetHeight = tgt.outerHeight();

			// X and Y position of the target element
			var targetX = tgt.offset().left,
				targetY = tgt.offset().top;

			// Width and height of the tooltip with content
			var contentWidth = currentTT.outerWidth(),
				contentHeight = currentTT.outerHeight();
			
			// Manage tooltip position based on available space
			// I think I've created a monster.
			// Essentially, the operations are simple. Check whether theirs enough 
			// space for the tooltip in it's preferred position, if not, position it elsewhere.
			switch ( preferredPosition ) {

				case 'top-left' :
					if ( checkFitsTop() ) {
						if ( checkFitsLeft() ) {
							positionTopLeft();
						} else {
							positionTopMiddle();
						}
					} else {
						if ( checkFitsLeft() ) {
							positionBottomLeft();
						} else {
							positionBottomMiddle();
						}
						
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
					if ( checkFitsTop() ) {
						if ( checkFitsRight() ) {
							positionTopRight();
						} else {
							positionTopMiddle();
						}
					} else {
						if ( checkFitsRight() ) {
							positionBottomRight()
						} else {
							positionBottomMiddle();
						}
					}
					break;

				case 'middle-left' :
					if ( checkFitsLeft() ) {
						positionMiddleLeft();
					} else {
						if ( checkFitsTop() ) {
							positionTopMiddle();
						} else {
							positionBottomMiddle();
						}
					}
					break;

				case 'middle-right' :
					if ( checkFitsRight() ) {
						positionMiddleRight();
					} else {
						if ( checkFitsTop() ) {
							positionTopMiddle();
						} else {
							positionBottomMiddle();
						}
					}
					break;

				case 'bottom-left' :
					if ( checkFitsBottom() ) {
						if ( checkFitsLeft() ) {
							positionBottomLeft();
						} else {
							positionBottomMiddle();
						}
					} else {
						if ( checkFitsLeft() ) {
							positionTopLeft();
						} else {
							positionTopMiddle();
						}
					}
					break;

				case 'bottom-middle' :
					if ( checkFitsBottom() ) {
						positionBottomMiddle();
					} else {
						positionTopMiddle();
					}
					break;

				case 'bottom-right' :
					if ( checkFitsBottom() ) {
						if ( checkFitsRight() ) {
							positionBottomRight();
						} else {
							positionBottomMiddle();
						}
					} else {
						if ( checkFitsRight() ) {
							positionTopRight();
						} else {
							positionTopMiddle();
						}
					}
					break;
			}

			function positionTopLeft() {
				posX = targetX - contentWidth / 2;
				posY = targetY - contentHeight - offsetFromTarget;
				currentTT.removeClass().addClass( ttClass + ' top-left' );
			}

			function positionTopMiddle() {
				posX = targetX + targetWidth / 2 - contentWidth / 2;
				posY = targetY - contentHeight - offsetFromTarget;
				currentTT.removeClass().addClass( ttClass + ' top-middle' );
			}

			function positionTopRight() {
				posX = targetX + targetWidth - contentWidth / 2;
				posY = targetY - contentHeight - offsetFromTarget;
				currentTT.removeClass().addClass( ttClass + ' top-right' );
			}

			function positionMiddleLeft() {
				posX = targetX - contentWidth - offsetFromTarget;
				posY = targetY - contentHeight / 2 + targetHeight / 2;
				currentTT.removeClass().addClass( ttClass + ' middle-left' );
			}

			function positionMiddleRight() {
				posX = targetX + targetWidth + offsetFromTarget;
				posY = targetY - contentHeight / 2 + targetHeight / 2;
				currentTT.removeClass().addClass( ttClass + ' middle-right' );
			}

			function positionBottomLeft() {
				posX = targetX - contentWidth / 2;
				posY = targetY + targetHeight + offsetFromTarget;
				currentTT.removeClass().addClass( ttClass + ' bottom-left' );
			}

			function positionBottomMiddle() {
				posX = targetX + targetWidth / 2 - contentWidth / 2;
				posY = targetY + targetHeight + offsetFromTarget;
				currentTT.removeClass().addClass( ttClass + ' bottom-middle' );
			}

			function positionBottomRight() {
				posX = targetX + targetWidth - contentWidth / 2;
				posY = targetY + targetHeight + offsetFromTarget;
				currentTT.removeClass().addClass( ttClass + 'bottom-right' );
			}

			function checkFitsTop() {
				if ( scrollTop > targetY - contentHeight - offsetFromTarget ) {
					return false;
				} else {
					return true;
				}
			}

			function checkFitsBottom() {
				if ( scrollTop + windowHeight < targetY + targetHeight + contentHeight + offsetFromTarget ) {
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
				if ( targetX + targetWidth + contentWidth + offsetFromTarget > windowWidth ) {
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
})( jQuery, window );